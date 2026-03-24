#!/usr/bin/env python3
"""Load OpenAlex UK-affiliated authors into the academics table.

This is the largest dataset (~2M authors). Supports cursor-based resuming.
Merges with existing GtR persons via ORCID matching.
"""

import json
import sys
from config import OPENALEX_BASE_URL, RAW_DIR
from db import get_conn, fetch_all, fetch_one, upsert, bulk_insert
from utils import UniversityMatcher, make_slug, paginate_openalex


PROGRESS_FILE = RAW_DIR / "openalex_authors_progress.json"


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"cursor": "*", "count": 0}


def save_progress(cursor: str, count: int):
    PROGRESS_FILE.write_text(json.dumps({"cursor": cursor, "count": count}))


def main():
    print("Loading OpenAlex UK authors...")

    with get_conn() as conn:
        unis = fetch_all(conn, "SELECT id, name, ukprn, ror_id, openalex_id, wikidata_id FROM universities")
        matcher = UniversityMatcher(unis)

        # Build ORCID -> academic_id map for merging with GtR
        existing_orcids = {}
        for r in fetch_all(conn, "SELECT id, orcid FROM academics WHERE orcid IS NOT NULL"):
            existing_orcids[r["orcid"]] = r["id"]

        progress = load_progress()
        cursor = progress["cursor"]
        count = progress["count"]

        endpoint = f"{OPENALEX_BASE_URL}/authors?filter=last_known_institutions.country_code:gb"

        batch = []
        affil_batch = []

        import urllib.request
        import time

        while cursor:
            url = f"{endpoint}&per_page=200&cursor={cursor}&mailto=universitydb@example.com"

            try:
                from utils import fetch_json
                data = fetch_json(url, timeout=60)
            except Exception as e:
                print(f"  Error at cursor {cursor}: {e}, retrying in 5s...")
                time.sleep(5)
                continue

            results = data.get("results", [])
            if not results:
                break

            for author in results:
                openalex_id = author.get("id", "").replace("https://openalex.org/", "")
                orcid_url = author.get("orcid") or ""
                orcid = orcid_url.replace("https://orcid.org/", "") if orcid_url else None
                name = author.get("display_name", "")
                if not name:
                    continue

                works = author.get("works_count", 0)
                cited = author.get("cited_by_count", 0)
                hi = author.get("summary_stats", {}).get("h_index")

                # Check if this person already exists (via ORCID from GtR)
                if orcid and orcid in existing_orcids:
                    # Update existing record
                    acad_id = existing_orcids[orcid]
                    with conn.cursor() as cur:
                        cur.execute(
                            """UPDATE academics SET openalex_id = %s, works_count = %s,
                               cited_by_count = %s, h_index = %s WHERE id = %s""",
                            (openalex_id, works, cited, hi, acad_id),
                        )
                else:
                    # Parse name parts
                    parsed = author.get("parsed_longest_name", {})
                    first = parsed.get("first_name")
                    last = parsed.get("last_name")

                    batch.append((
                        name,
                        make_slug(name + "-" + openalex_id[-8:]),
                        first,
                        last,
                        openalex_id,
                        orcid,
                        None,  # gtr_id
                        works,
                        cited,
                        hi,
                    ))

                # Affiliations
                for aff in author.get("affiliations", []):
                    inst = aff.get("institution", {})
                    inst_id = (inst.get("id") or "").replace("https://openalex.org/", "")
                    ror = (inst.get("ror") or "").replace("https://ror.org/", "")
                    uni_id = matcher.match(openalex_id=inst_id, ror_id=ror)
                    if uni_id:
                        years = aff.get("years", [])
                        affil_batch.append((openalex_id, orcid, uni_id, years))

                count += 1

            # Flush batch
            if len(batch) >= 2000:
                _flush_batch(conn, batch, affil_batch, existing_orcids)
                batch.clear()
                affil_batch.clear()

            next_cursor = data.get("meta", {}).get("next_cursor")
            if not next_cursor:
                break
            cursor = next_cursor
            save_progress(cursor, count)

            if count % 10000 == 0:
                print(f"  {count:,} authors processed")

            time.sleep(0.05)

        # Final flush
        if batch:
            _flush_batch(conn, batch, affil_batch, existing_orcids)

    print(f"\nDone — {count:,} authors processed")


def _flush_batch(conn, batch, affil_batch, existing_orcids):
    if batch:
        upsert(
            conn, "academics",
            ["name", "slug", "first_name", "last_name", "openalex_id", "orcid", "gtr_id",
             "works_count", "cited_by_count", "h_index"],
            batch,
            conflict_columns=["openalex_id"],
            update_columns=["works_count", "cited_by_count", "h_index"],
        )

    # Link affiliations
    for openalex_id, orcid, uni_id, years in affil_batch:
        # Find the academic
        acad_row = None
        if orcid and orcid in existing_orcids:
            acad_row = {"id": existing_orcids[orcid]}
        if not acad_row:
            acad_row = fetch_one(conn, "SELECT id FROM academics WHERE openalex_id = %s", (openalex_id,))
        if not acad_row:
            continue

        is_current = bool(years and max(years) >= 2024)
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO academic_affiliations (academic_id, university_id, years, is_current)
                   VALUES (%s, %s, %s, %s)
                   ON CONFLICT (academic_id, university_id) DO UPDATE SET years = EXCLUDED.years, is_current = EXCLUDED.is_current""",
                (acad_row["id"], uni_id, years if years else None, is_current),
            )

    conn.commit()


if __name__ == "__main__":
    main()
