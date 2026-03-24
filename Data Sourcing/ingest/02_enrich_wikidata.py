#!/usr/bin/env python3
"""Enrich universities with Wikidata data (founding year, student count, logo, wikidata ID)."""

import json
import re
import sys
from config import RAW_DIR
from db import get_conn, fetch_all
from utils import UniversityMatcher


def parse_coord(coord_str: str) -> tuple[float, float] | None:
    m = re.match(r"Point\(([-\d.]+)\s+([-\d.]+)\)", coord_str)
    if m:
        return float(m.group(2)), float(m.group(1))  # lat, lng
    return None


def main():
    src = RAW_DIR / "wikidata_uk_universities.json"
    if not src.exists():
        print(f"Run fetch_all_datasets.py first — {src} not found")
        sys.exit(1)

    wiki = json.loads(src.read_text(encoding="utf-8"))
    print(f"Enriching from {len(wiki)} Wikidata results...")

    with get_conn() as conn:
        unis = fetch_all(conn, "SELECT id, name, ukprn, ror_id, wikidata_id FROM universities")
        matcher = UniversityMatcher(unis)

        updated = 0
        for w in wiki:
            name = w.get("uniLabel", {}).get("value", "")
            ror = w.get("rorId", {}).get("value")
            wikidata_uri = w.get("uni", {}).get("value", "")
            wikidata_id = wikidata_uri.split("/")[-1] if wikidata_uri else None

            db_id = matcher.match(name=name, ror_id=ror, wikidata_id=wikidata_id)
            if not db_id:
                continue

            founded_raw = w.get("founded", {}).get("value", "")
            founded = int(founded_raw[:4]) if founded_raw and len(founded_raw) >= 4 else None

            students_raw = w.get("students", {}).get("value")
            students = int(float(students_raw)) if students_raw else None

            logo = w.get("logo", {}).get("value")

            sets = []
            params = []
            if wikidata_id:
                sets.append("wikidata_id = %s")
                params.append(wikidata_id)
            if founded:
                sets.append("founded = %s")
                params.append(founded)
            if students:
                sets.append("student_count = %s")
                params.append(students)
            if logo:
                sets.append("logo_url = %s")
                params.append(logo)
            if ror:
                sets.append("ror_id = COALESCE(ror_id, %s)")
                params.append(ror)

            if sets:
                params.append(db_id)
                query = f"UPDATE universities SET {', '.join(sets)} WHERE id = %s"
                with conn.cursor() as cur:
                    cur.execute(query, params)
                updated += 1

        conn.commit()
        print(f"  Done — enriched {updated} universities from Wikidata")


if __name__ == "__main__":
    main()
