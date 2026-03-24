#!/usr/bin/env python3
"""One-off migration: fix ALL-CAPS university names and addresses using view_name from source data."""

import json
import sys
from config import DATA_DIR
from db import get_conn


def _title_case(value: str | None) -> str | None:
    if not value:
        return value
    return value.title()


def main():
    src = DATA_DIR / "uk-universities.json"
    if not src.exists():
        print(f"Source file not found: {src}")
        sys.exit(1)

    unis = json.loads(src.read_text(encoding="utf-8"))
    print(f"Fixing casing for {len(unis)} universities...")

    with get_conn() as conn:
        updated = 0
        with conn.cursor() as cur:
            for u in unis:
                ukprn = u.get("ukprn")
                if not ukprn:
                    continue

                display_name = u.get("view_name") or u["name"]
                addr = u.get("address", {})
                town = _title_case(addr.get("town"))
                addr1 = _title_case(addr.get("building_name_number") or addr.get("flat_name_number"))
                addr2 = _title_case(addr.get("street"))

                cur.execute(
                    """
                    UPDATE universities
                    SET name = %s,
                        town = %s,
                        address_line1 = COALESCE(%s, address_line1),
                        address_line2 = COALESCE(%s, address_line2),
                        updated_at = NOW()
                    WHERE ukprn = %s
                    """,
                    (display_name, town, addr1, addr2, ukprn),
                )
                if cur.rowcount > 0:
                    updated += 1

        conn.commit()
        print(f"  Done — updated {updated} universities")


if __name__ == "__main__":
    main()
