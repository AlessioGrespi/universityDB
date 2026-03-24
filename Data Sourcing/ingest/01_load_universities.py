#!/usr/bin/env python3
"""Load universities from data.ac.uk JSON into the database."""

import json
import sys
from config import DATA_DIR
from db import get_conn, upsert
from utils import make_slug


def _title_case(value: str | None) -> str | None:
    """Convert an ALL-CAPS string to title case, handling common edge cases."""
    if not value:
        return value
    return value.title()


def _dedup_gtr(gtr_id, seen):
    if not gtr_id or gtr_id in seen:
        return None
    seen.add(gtr_id)
    return gtr_id


def main():
    src = DATA_DIR / "uk-universities.json"
    if not src.exists():
        print(f"Run fetch_uk_universities.py first — {src} not found")
        sys.exit(1)

    unis = json.loads(src.read_text(encoding="utf-8"))
    print(f"Loading {len(unis)} universities from data.ac.uk...")

    columns = [
        "name", "sort_name", "slug", "country",
        "website", "wikipedia_url",
        "address_line1", "address_line2", "town", "postcode",
        "latitude", "longitude",
        "ukprn", "hesa_id", "gtr_id",
        "groups",
    ]
    rows = []
    seen_gtr_ids = set()
    for u in unis:
        addr = u.get("address", {})
        display_name = u.get("view_name") or u["name"]
        rows.append((
            display_name,
            u.get("sort_name", ""),
            make_slug(display_name),
            "GB",
            u.get("website"),
            u.get("wikipedia"),
            _title_case(addr.get("building_name_number") or addr.get("flat_name_number")),
            _title_case(addr.get("street")),
            _title_case(addr.get("town")),
            addr.get("postcode"),
            u.get("location", {}).get("latitude"),
            u.get("location", {}).get("longitude"),
            u.get("ukprn"),
            u.get("hesa_id"),
            _dedup_gtr(u.get("gtr_id"), seen_gtr_ids),
            u.get("groups") or [],
        ))

    with get_conn() as conn:
        upsert(
            conn, "universities", columns, rows,
            conflict_columns=["ukprn"],
            update_columns=[c for c in columns if c != "ukprn"],
        )

    print(f"  Done — {len(rows)} universities upserted")


if __name__ == "__main__":
    main()
