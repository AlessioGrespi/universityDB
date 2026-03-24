#!/usr/bin/env python3
"""Load subject taxonomy from UCAS sample data (subjects + CAH codes)."""

import json
import sys
from config import RAW_DIR
from db import get_conn, upsert
from utils import make_slug


def main():
    src = RAW_DIR / "ucas_courses_sample.json"
    if not src.exists():
        print(f"Run fetch_all_datasets.py first — {src} not found")
        sys.exit(1)

    courses = json.loads(src.read_text(encoding="utf-8"))

    # We'll collect subjects from the full UCAS pull later,
    # but bootstrap the taxonomy from what we have now
    seen = {}  # name -> set of cah codes
    for c in courses:
        for s in c.get("subjects", []):
            name = s.get("name", "").strip()
            if not name:
                continue
            if name not in seen:
                seen[name] = set()
            for cah in s.get("cah", []):
                seen[name].add(cah)

    print(f"Found {len(seen)} unique subjects from sample data")
    print("  (Full subjects will be loaded during UCAS course ingestion)")

    columns = ["name", "slug", "cah_code", "source"]
    rows = []
    for name, cahs in sorted(seen.items()):
        # Use first CAH code as the primary one
        cah = sorted(cahs)[0] if cahs else None
        rows.append((name, make_slug(name), cah, "ucas_cah"))

    with get_conn() as conn:
        upsert(
            conn, "subjects", columns, rows,
            conflict_columns=["slug"],
            update_columns=["name", "cah_code", "source"],
        )

    print(f"  Done — {len(rows)} subjects upserted")


if __name__ == "__main__":
    main()
