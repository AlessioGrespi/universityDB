#!/usr/bin/env python3
"""Load all UCAS courses from Algolia API into the database.

Algolia limits search to 1000 hits per query, so we partition by university
(and by scheme for the 12 unis with >1000 courses).
"""

import json
import time
import sys
import urllib.parse
from pathlib import Path
from config import UCAS_ALGOLIA_URL, UCAS_ALGOLIA_APP_ID, UCAS_ALGOLIA_API_KEY, UCAS_ALGOLIA_INDEX, RAW_DIR
from db import get_conn, fetch_all, fetch_one, upsert, bulk_insert, execute
from utils import UniversityMatcher, make_slug, post_json


ALGOLIA_HEADERS = {
    "X-Algolia-Application-Id": UCAS_ALGOLIA_APP_ID,
    "X-Algolia-API-Key": UCAS_ALGOLIA_API_KEY,
    "Content-Type": "application/json",
}

PROGRESS_FILE = RAW_DIR / "ucas_progress.json"


def algolia_query(filters: str, page: int = 0, hits_per_page: int = 1000) -> dict:
    data = post_json(UCAS_ALGOLIA_URL, {
        "requests": [{
            "indexName": UCAS_ALGOLIA_INDEX,
            "params": f"query=&hitsPerPage={hits_per_page}&page={page}&filters={urllib.parse.quote(filters)}"
        }]
    }, headers=ALGOLIA_HEADERS, timeout=60)
    return data["results"][0]


def get_university_facets() -> dict[str, int]:
    """Get all universities and their course counts."""
    data = post_json(UCAS_ALGOLIA_URL, {
        "requests": [{
            "indexName": UCAS_ALGOLIA_INDEX,
            "params": "query=&hitsPerPage=0&facets=[\"university\"]&maxValuesPerFacet=1000"
        }]
    }, headers=ALGOLIA_HEADERS, timeout=60)
    return data["results"][0]["facets"].get("university", {})


def load_progress() -> set:
    if PROGRESS_FILE.exists():
        return set(json.loads(PROGRESS_FILE.read_text()))
    return set()


def save_progress(done: set):
    PROGRESS_FILE.write_text(json.dumps(list(done)))


def fetch_courses_for_uni(uni_name: str, count: int) -> list[dict]:
    """Fetch all courses for a university, splitting by scheme if needed."""
    escaped = uni_name.replace("\\", "\\\\").replace('"', '\\"')
    all_hits = []

    try:
        if count <= 1000:
            result = algolia_query(f'university:"{escaped}"')
            all_hits.extend(result.get("hits", []))
        else:
            # Split by scheme + year to stay under 1000
            for scheme in ["Undergraduate", "Postgraduate"]:
                for year in ["2024", "2025"]:
                    result = algolia_query(f'university:"{escaped}" AND scheme:"{scheme}" AND academicYear:"{year}"')
                    hits = result.get("hits", [])
                    all_hits.extend(hits)
                    if len(hits) >= 1000:
                        print(f"    WARNING: {uni_name} {scheme} {year} still has {result.get('nbHits', '?')} courses, only got 1000")
    except Exception as e:
        print(f"    ERROR fetching {uni_name}: {e} — skipping")
        return []

    return all_hits


def process_hits(conn, hits: list[dict], matcher: UniversityMatcher, existing_subjects: dict):
    """Process a batch of UCAS course hits into the database."""
    course_rows = []
    option_rows = []
    subject_links = []

    for h in hits:
        ucas_course_id = h.get("courseId")
        uni_name = h.get("university", "")
        provider_id = h.get("providerId", "")

        uni_id = matcher.match(name=uni_name, ucas_provider_id=provider_id)
        if not uni_id:
            continue

        if provider_id:
            matcher.add_id(provider_id, uni_id)

        title = h.get("courseTitle", h.get("course", ""))
        slug = make_slug(f"{title}-{h.get('scheme', '')}-{h.get('academicYear', '')}-{ucas_course_id[:8]}")

        course_rows.append((
            uni_id, title, slug, h.get("summary"),
            h.get("scheme", ""), h.get("academicYear"), ucas_course_id,
        ))

        for opt in h.get("options", []):
            entry_reqs = {}
            if opt.get("entryReq_al"): entry_reqs["a_level"] = opt["entryReq_al"]
            if opt.get("entryReq_sh"): entry_reqs["scottish_higher"] = opt["entryReq_sh"]
            if opt.get("entryReq_bt"): entry_reqs["btec"] = opt["entryReq_bt"]
            if opt.get("ucasPoints") and opt["ucasPoints"] != "N/A":
                entry_reqs["ucas_points"] = opt["ucasPoints"]

            nss = opt.get("nssScore")
            nss_val = float(nss) if nss and nss != "0" else None
            salary = opt.get("avgSalary")
            salary_val = int(salary) if salary and salary != "0" else None

            geoloc = h.get("_geoloc", [{}])
            lat = geoloc[0].get("lat") if geoloc else None
            lng = geoloc[0].get("lng") if geoloc else None

            option_rows.append((
                ucas_course_id,
                opt.get("courseOptionId"),
                opt.get("Qualification"), opt.get("fullQualification"),
                opt.get("studyMode"), opt.get("duration"), opt.get("startDate"),
                opt.get("location"), opt.get("postcode"),
                lat, lng,
                json.dumps(entry_reqs) if entry_reqs else "{}",
                nss_val, salary_val,
            ))

        for s in h.get("subjects", []):
            sname = s.get("name", "").strip()
            if sname:
                subject_links.append((ucas_course_id, make_slug(sname), sname, s.get("cah", [])))

    # Dedupe courses by ucas_course_id (keep latest year)
    seen = {}
    for row in course_rows:
        cid = row[6]
        if cid not in seen or (row[5] or "") > (seen[cid][5] or ""):
            seen[cid] = row
    course_rows = list(seen.values())
    surviving = set(seen.keys())
    option_rows = [o for o in option_rows if o[0] in surviving]
    subject_links = [s for s in subject_links if s[0] in surviving]

    if not course_rows:
        return 0, 0

    # Insert courses
    upsert(
        conn, "courses",
        ["university_id", "title", "slug", "summary", "scheme", "academic_year", "ucas_course_id"],
        course_rows,
        conflict_columns=["ucas_course_id"],
        update_columns=["title", "slug", "summary", "scheme", "academic_year"],
    )

    # Get course IDs back
    ucas_ids = [r[6] for r in course_rows]
    placeholders = ",".join(["%s"] * len(ucas_ids))
    course_id_map = {
        r["ucas_course_id"]: r["id"]
        for r in fetch_all(conn, f"SELECT id, ucas_course_id FROM courses WHERE ucas_course_id IN ({placeholders})", ucas_ids)
    }

    # Insert options
    opt_insert_rows = []
    for opt in option_rows:
        course_db_id = course_id_map.get(opt[0])
        if course_db_id:
            opt_insert_rows.append((course_db_id,) + opt[1:])

    if opt_insert_rows:
        course_ids = list(course_id_map.values())
        ph = ",".join(["%s"] * len(course_ids))
        execute(conn, f"DELETE FROM course_options WHERE course_id IN ({ph})", course_ids)
        bulk_insert(
            conn, "course_options",
            ["course_id", "ucas_option_id", "qualification", "full_qualification",
             "study_mode", "duration", "start_date", "location", "postcode",
             "latitude", "longitude", "entry_requirements", "nss_score", "avg_salary"],
            opt_insert_rows,
        )

    # Insert subjects + links
    for ucas_cid, sslug, sname, cahs in subject_links:
        if sslug not in existing_subjects:
            cah = sorted(cahs)[0] if cahs else None
            upsert(conn, "subjects", ["name", "slug", "cah_code", "source"],
                   [(sname, sslug, cah, "ucas_cah")],
                   conflict_columns=["slug"], update_columns=["name"])
            row = fetch_one(conn, "SELECT id FROM subjects WHERE slug = %s", (sslug,))
            if row:
                existing_subjects[sslug] = row["id"]

        course_db_id = course_id_map.get(ucas_cid)
        subject_db_id = existing_subjects.get(sslug)
        if course_db_id and subject_db_id:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO course_subjects (course_id, subject_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (course_db_id, subject_db_id),
                )
            conn.commit()

    return len(course_rows), len(opt_insert_rows)


def main():
    print("Fetching UCAS courses from Algolia (per-university)...")

    uni_facets = get_university_facets()
    total_available = sum(uni_facets.values())
    print(f"  {len(uni_facets)} universities, {total_available:,} courses total")

    done = load_progress()

    with get_conn() as conn:
        unis = fetch_all(conn, "SELECT id, name, ukprn, ror_id, openalex_id, wikidata_id, ucas_provider_id FROM universities")
        matcher = UniversityMatcher(unis)
        existing_subjects = {
            r["slug"]: r["id"]
            for r in fetch_all(conn, "SELECT id, slug FROM subjects")
        }

        total_courses = 0
        total_options = 0

        for i, (uni_name, count) in enumerate(sorted(uni_facets.items())):
            if uni_name in done:
                continue

            hits = fetch_courses_for_uni(uni_name, count)
            if hits:
                nc, no = process_hits(conn, hits, matcher, existing_subjects)
                total_courses += nc
                total_options += no

            done.add(uni_name)
            save_progress(done)

            if (i + 1) % 20 == 0:
                print(f"  {i+1}/{len(uni_facets)} unis — {total_courses:,} courses, {total_options:,} options")

            time.sleep(0.15)

    print(f"\nDone — {total_courses:,} courses, {total_options:,} options loaded")


if __name__ == "__main__":
    main()
