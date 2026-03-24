#!/usr/bin/env python3
"""Enrich universities with OpenAlex data (research metrics, images, IDs) and load yearly stats."""

from config import OPENALEX_BASE_URL, OPENALEX_MAILTO
from db import get_conn, fetch_all, bulk_insert, upsert
from utils import UniversityMatcher, paginate_openalex


def main():
    print("Enriching universities from OpenAlex...")

    with get_conn() as conn:
        unis = fetch_all(conn, "SELECT id, name, ukprn, ror_id, openalex_id, wikidata_id FROM universities")
        matcher = UniversityMatcher(unis)

        updated = 0
        yearly_rows = []

        endpoint = f"{OPENALEX_BASE_URL}/institutions?filter=country_code:gb,type:education"
        for inst in paginate_openalex(endpoint, per_page=200):
            ror = inst.get("ror", "").replace("https://ror.org/", "")
            openalex_id = inst.get("id", "").replace("https://openalex.org/", "")
            wikidata_id = inst.get("ids", {}).get("wikidata", "")
            if wikidata_id:
                wikidata_id = wikidata_id.replace("https://www.wikidata.org/entity/", "")

            db_id = matcher.match(
                name=inst.get("display_name"),
                ror_id=ror,
                openalex_id=openalex_id,
                wikidata_id=wikidata_id,
            )
            if not db_id:
                continue

            sets = []
            params = []

            if openalex_id:
                sets.append("openalex_id = %s")
                params.append(openalex_id)
                matcher.add_id(openalex_id, db_id)
            if ror:
                sets.append("ror_id = COALESCE(ror_id, %s)")
                params.append(ror)
            grid = inst.get("ids", {}).get("grid")
            if grid:
                sets.append("grid_id = COALESCE(grid_id, %s)")
                params.append(grid)
            img = inst.get("image_url")
            if img:
                sets.append("image_url = %s")
                params.append(img)
            wc = inst.get("works_count")
            if wc:
                sets.append("works_count = %s")
                params.append(wc)
            cc = inst.get("cited_by_count")
            if cc:
                sets.append("cited_by_count = %s")
                params.append(cc)
            hi = inst.get("summary_stats", {}).get("h_index")
            if hi:
                sets.append("h_index = %s")
                params.append(hi)

            if sets:
                params.append(db_id)
                query = f"UPDATE universities SET {', '.join(sets)} WHERE id = %s"
                with conn.cursor() as cur:
                    cur.execute(query, params)
                updated += 1

            # Yearly stats
            for yr in inst.get("counts_by_year", []):
                yearly_rows.append((
                    db_id,
                    yr.get("year"),
                    yr.get("works_count"),
                    yr.get("cited_by_count"),
                    "openalex",
                ))

        conn.commit()
        print(f"  Enriched {updated} universities from OpenAlex")

        # Load yearly stats — dedupe by (uni_id, year, source), keeping last
        if yearly_rows:
            deduped = {}
            for row in yearly_rows:
                key = (row[0], row[1], row[4])  # uni_id, year, source
                deduped[key] = row
            yearly_rows = list(deduped.values())

            with conn.cursor() as cur:
                cur.execute("DELETE FROM university_stats_by_year WHERE source = 'openalex'")
            conn.commit()
            bulk_insert(
                conn, "university_stats_by_year",
                ["university_id", "year", "works_count", "cited_by_count", "source"],
                yearly_rows,
            )
            print(f"  Loaded {len(yearly_rows)} yearly stat rows")


if __name__ == "__main__":
    main()
