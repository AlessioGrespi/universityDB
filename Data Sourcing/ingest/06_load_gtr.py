#!/usr/bin/env python3
"""Load GtR organisations, persons, and projects into the database.

This is the longest-running script (~30-60 min) due to 173k projects + 142k persons.
Supports resuming via progress file.
"""

import json
import time
import sys
from config import GTR_BASE_URL, RAW_DIR
from db import get_conn, fetch_all, fetch_one, bulk_insert, upsert, execute
from utils import UniversityMatcher, make_slug, paginate_gtr


PROGRESS_FILE = RAW_DIR / "gtr_progress.json"


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"orgs_done": False, "persons_done": False, "projects_page": 0}


def save_progress(**kwargs):
    p = load_progress()
    p.update(kwargs)
    PROGRESS_FILE.write_text(json.dumps(p))


# ─── Phase 1: Organisations ───────────────────────────────────────────────────

def load_orgs(conn, matcher: UniversityMatcher) -> dict[str, int | None]:
    """Build mapping: gtr_org_id -> university_id (or None)."""
    print("\n--- GtR Organisations ---")
    gtr_to_uni: dict[str, int | None] = {}

    count = 0
    for org in paginate_gtr(f"{GTR_BASE_URL}/organisations", page_size=100):
        gtr_id = org.get("id", "")
        name = org.get("name", "")

        uni_id = matcher.match(name=name, gtr_id=gtr_id)
        gtr_to_uni[gtr_id] = uni_id

        # Update university gtr_id if matched but not stored
        if uni_id and gtr_id:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE universities SET gtr_id = COALESCE(gtr_id, %s) WHERE id = %s",
                    (gtr_id, uni_id),
                )

        count += 1
        if count % 5000 == 0:
            conn.commit()
            print(f"  Processed {count:,} orgs ({sum(1 for v in gtr_to_uni.values() if v):,} matched)")

    conn.commit()
    matched = sum(1 for v in gtr_to_uni.values() if v)
    print(f"  Done — {count:,} orgs, {matched:,} matched to universities")
    return gtr_to_uni


# ─── Phase 2: Persons ─────────────────────────────────────────────────────────

def load_persons(conn, gtr_to_uni: dict[str, int | None]):
    print("\n--- GtR Persons ---")
    batch = []
    affil_batch = []
    count = 0

    for person in paginate_gtr(f"{GTR_BASE_URL}/persons", page_size=100):
        gtr_id = person.get("id", "")
        first = person.get("firstName", "")
        last = person.get("surname", "")
        name = f"{first} {last}".strip()
        orcid = person.get("orcidId") or None

        if not name:
            continue

        batch.append((
            name,
            make_slug(name + "-" + gtr_id[:8]),
            first or None,
            last or None,
            None,  # openalex_id
            orcid,
            gtr_id,
        ))

        # Find employer from links
        for link in person.get("links", {}).get("link", []):
            if link.get("rel") == "EMPLOYED":
                org_href = link.get("href", "")
                org_id = org_href.split("/")[-1] if org_href else None
                if org_id:
                    uni_id = gtr_to_uni.get(org_id)
                    if uni_id:
                        affil_batch.append((gtr_id, uni_id))

        count += 1
        if len(batch) >= 1000:
            _flush_persons(conn, batch, affil_batch)
            batch.clear()
            affil_batch.clear()
            print(f"  Processed {count:,} persons")

    if batch:
        _flush_persons(conn, batch, affil_batch)

    print(f"  Done — {count:,} persons loaded")


def _flush_persons(conn, batch, affil_batch):
    upsert(
        conn, "academics",
        ["name", "slug", "first_name", "last_name", "openalex_id", "orcid", "gtr_id"],
        batch,
        conflict_columns=["gtr_id"],
        update_columns=["name", "first_name", "last_name", "orcid"],
    )

    # Link affiliations
    for gtr_id, uni_id in affil_batch:
        row = fetch_one(conn, "SELECT id FROM academics WHERE gtr_id = %s", (gtr_id,))
        if row:
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO academic_affiliations (academic_id, university_id, is_current)
                       VALUES (%s, %s, true) ON CONFLICT (academic_id, university_id) DO NOTHING""",
                    (row["id"], uni_id),
                )
    conn.commit()


# ─── Phase 3: Projects ────────────────────────────────────────────────────────

def load_projects(conn, gtr_to_uni: dict[str, int | None], start_page: int = 0):
    print("\n--- GtR Projects ---")
    batch = []
    link_batch = []  # (gtr_project_id, org_links, person_links)
    count = 0
    page = 0

    for project in paginate_gtr(f"{GTR_BASE_URL}/projects", page_size=100):
        page_num = count // 100
        if page_num < start_page:
            count += 1
            continue

        gtr_id = project.get("id", "")
        title = project.get("title", "")
        if not title:
            count += 1
            continue

        # Parse funding from participantValues if present
        funding = None
        pv = project.get("participantValues", {}).get("participantValue", [])
        if isinstance(pv, list):
            for v in pv:
                if v.get("currencyCode") == "GBP":
                    funding = v.get("amount")
                    break

        # Parse identifiers
        grant_ref = None
        for ident in project.get("identifiers", {}).get("identifier", []):
            if ident.get("type") == "RCUK":
                grant_ref = ident.get("value")

        # Parse dates (milliseconds)
        start_ms = project.get("start")
        end_ms = project.get("end")

        batch.append((
            title,
            make_slug(title[:150] + "-" + gtr_id[:8]),
            project.get("abstractText"),
            project.get("techAbstractText"),
            project.get("potentialImpact"),
            project.get("status"),
            project.get("grantCategory"),
            project.get("leadFunder"),
            grant_ref,
            project.get("leadOrganisationDepartment"),
            f"epoch {start_ms}" if start_ms else None,  # placeholder, converted below
            f"epoch {end_ms}" if end_ms else None,
            funding,
            "GBP",
            gtr_id,
        ))

        # Collect links for post-insert
        org_links = []
        person_links = []
        for link in project.get("links", {}).get("link", []):
            rel = link.get("rel", "")
            href = link.get("href", "")
            ref_id = href.split("/")[-1] if href else None
            if rel in ("LEAD_ORG", "COLLAB_ORG", "PROJECT_PARTNER") and ref_id:
                org_links.append((ref_id, rel))
            elif rel in ("PI_PER", "COI_PER", "RESEARCHER_COI_PER") and ref_id:
                person_links.append((ref_id, rel))

        link_batch.append((gtr_id, org_links, person_links))

        count += 1
        if len(batch) >= 500:
            _flush_projects(conn, batch, link_batch, gtr_to_uni)
            batch.clear()
            link_batch.clear()
            save_progress(projects_page=count // 100)
            print(f"  Processed {count:,} projects")

    if batch:
        _flush_projects(conn, batch, link_batch, gtr_to_uni)

    print(f"  Done — {count:,} projects loaded")


def _flush_projects(conn, batch, link_batch, gtr_to_uni):
    # Convert epoch timestamps
    rows = []
    for b in batch:
        row = list(b)
        for i in (10, 11):  # start_date, end_date
            if row[i] and row[i].startswith("epoch "):
                ms = int(row[i].split(" ")[1])
                # Convert to ISO timestamp for postgres
                import datetime
                row[i] = datetime.datetime.fromtimestamp(ms / 1000, tz=datetime.timezone.utc).isoformat()
            else:
                row[i] = None
        rows.append(tuple(row))

    upsert(
        conn, "research_projects",
        ["title", "slug", "abstract", "tech_abstract", "potential_impact",
         "status", "grant_category", "lead_funder", "grant_reference", "department",
         "start_date", "end_date", "funding_amount", "funding_currency", "gtr_id"],
        rows,
        conflict_columns=["gtr_id"],
        update_columns=["title", "status", "funding_amount"],
    )

    # Link orgs and persons
    for gtr_project_id, org_links, person_links in link_batch:
        proj_row = fetch_one(conn, "SELECT id FROM research_projects WHERE gtr_id = %s", (gtr_project_id,))
        if not proj_row:
            continue
        proj_id = proj_row["id"]

        for org_gtr_id, role in org_links:
            uni_id = gtr_to_uni.get(org_gtr_id)
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO project_organisations (project_id, university_id, gtr_org_id, role)
                       VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING""",
                    (proj_id, uni_id, org_gtr_id, role),
                )

        for person_gtr_id, role in person_links:
            acad_row = fetch_one(conn, "SELECT id FROM academics WHERE gtr_id = %s", (person_gtr_id,))
            acad_id = acad_row["id"] if acad_row else None
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO project_researchers (project_id, academic_id, gtr_person_id, role)
                       VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING""",
                    (proj_id, acad_id, person_gtr_id, role),
                )

    conn.commit()


def main():
    progress = load_progress()

    with get_conn() as conn:
        unis = fetch_all(conn, "SELECT id, name, ukprn, gtr_id, ror_id, openalex_id, wikidata_id FROM universities")
        matcher = UniversityMatcher(unis)

        if not progress.get("orgs_done"):
            gtr_to_uni = load_orgs(conn, matcher)
            # Cache org mapping
            (RAW_DIR / "gtr_org_mapping.json").write_text(
                json.dumps({k: v for k, v in gtr_to_uni.items()}), encoding="utf-8"
            )
            save_progress(orgs_done=True)
        else:
            print("Orgs already done, loading cached mapping...")
            gtr_to_uni = json.loads((RAW_DIR / "gtr_org_mapping.json").read_text())
            # Convert string keys, None values
            gtr_to_uni = {k: v for k, v in gtr_to_uni.items()}

        if not progress.get("persons_done"):
            load_persons(conn, gtr_to_uni)
            save_progress(persons_done=True)
        else:
            print("Persons already done, skipping...")

        load_projects(conn, gtr_to_uni, start_page=progress.get("projects_page", 0))
        save_progress(projects_page=999999)

    print("\nAll GtR data loaded.")


if __name__ == "__main__":
    main()
