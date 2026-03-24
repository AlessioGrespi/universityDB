#!/usr/bin/env python3
"""Load TEF (Teaching Excellence Framework) data from the downloaded CSV."""

import csv
import io
import json
import zipfile
import sys
from config import RAW_DIR
from db import get_conn, fetch_all, bulk_insert, execute
from utils import UniversityMatcher


def main():
    src = RAW_DIR / "tef_csv_all_providers.zip"
    if not src.exists():
        print(f"Run fetch_all_datasets.py first — {src} not found")
        sys.exit(1)

    print("Loading TEF data...")

    # Extract CSV from ZIP
    zf = zipfile.ZipFile(src)
    csv_name = next(n for n in zf.namelist() if n.endswith(".csv"))
    print(f"  Reading {csv_name}...")
    with zf.open(csv_name) as f:
        text = f.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    all_rows = list(reader)
    print(f"  {len(all_rows):,} rows in CSV")

    with get_conn() as conn:
        unis = fetch_all(conn, "SELECT id, name, ukprn FROM universities")
        ukprn_map = {u["ukprn"]: u["id"] for u in unis if u["ukprn"]}

        # Clear existing TEF data
        execute(conn, "DELETE FROM tef_metrics")

        batch = []
        skipped = 0
        for row in all_rows:
            ukprn = row.get("UKPRN", "")
            uni_id = ukprn_map.get(ukprn)
            if not uni_id:
                skipped += 1
                continue

            # Parse numeric values (many are suppressed as "[low]", "[N]", etc.)
            def parse_num(val):
                if not val or val.startswith("["):
                    return None
                try:
                    return float(val)
                except ValueError:
                    return None

            def parse_int(val):
                n = parse_num(val)
                return int(n) if n is not None else None

            batch.append((
                uni_id,
                ukprn,
                row.get("POPULATION_TYPE"),
                row.get("INDICATOR_NAME", ""),
                row.get("MODE"),
                row.get("LEVEL"),
                row.get("SPLIT_IND_TYPE"),
                row.get("SPLIT_IND"),
                row.get("YEAR"),
                parse_num(row.get("INDICATOR")),
                parse_int(row.get("DENOMINATOR")),
                parse_num(row.get("BENCHMARK_VALUE")),
                parse_num(row.get("DIFFERENCE")),
                row.get("MATERIALLY_ABOVE_BENCH"),
                row.get("MATERIALLY_BELOW_BENCH"),
                row.get("INLINE_WITH_BENCH"),
                json.dumps(row),  # raw_data
            ))

            if len(batch) >= 5000:
                bulk_insert(
                    conn, "tef_metrics",
                    ["university_id", "ukprn", "population_type", "indicator_name",
                     "mode", "level", "split_type", "split_value", "year",
                     "indicator_value", "denominator", "benchmark_value", "difference",
                     "materially_above_bench", "materially_below_bench", "inline_with_bench",
                     "raw_data"],
                    batch,
                )
                batch.clear()

        if batch:
            bulk_insert(
                conn, "tef_metrics",
                ["university_id", "ukprn", "population_type", "indicator_name",
                 "mode", "level", "split_type", "split_value", "year",
                 "indicator_value", "denominator", "benchmark_value", "difference",
                 "materially_above_bench", "materially_below_bench", "inline_with_bench",
                 "raw_data"],
                batch,
            )

    total = len(all_rows) - skipped
    print(f"  Done — {total:,} rows loaded ({skipped:,} skipped — UKPRN not in uni list)")


if __name__ == "__main__":
    main()
