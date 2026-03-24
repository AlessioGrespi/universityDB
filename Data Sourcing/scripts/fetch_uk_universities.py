#!/usr/bin/env python3
"""
Fetches the full list of UK universities from data.ac.uk
Source: https://learning-provider.data.ac.uk/
License: Open Data (public domain)

Outputs: data/uk-universities.json
"""

import csv
import json
import io
import urllib.request
from pathlib import Path

DATA_AC_UK_URL = (
    "https://learning-provider.data.ac.uk/data/learning-providers-plus.csv"
)

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "data"
OUTPUT_FILE = OUTPUT_DIR / "uk-universities.json"


def fetch_csv(url: str) -> list[dict]:
    print(f"Fetching {url} ...")
    req = urllib.request.Request(url, headers={"User-Agent": "UniversityDB/1.0"})
    with urllib.request.urlopen(req) as resp:
        text = resp.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    rows = list(reader)
    print(f"  Parsed {len(rows)} providers")
    return rows


def normalise(row: dict) -> dict:
    groups_raw = row.get("GROUPS", "")
    groups = [g.strip() for g in groups_raw.split(",") if g.strip()] if groups_raw else []

    lat = row.get("LATITUDE", "")
    lon = row.get("LONGITUDE", "")

    return {
        "ukprn": row.get("UKPRN") or None,
        "name": row.get("PROVIDER_NAME") or row.get("VIEW_NAME", ""),
        "sort_name": row.get("SORT_NAME", ""),
        "alias": row.get("ALIAS") or None,
        "address": {
            "flat_name_number": row.get("FLAT_NAME_NUMBER") or None,
            "building_name_number": row.get("BUILDING_NAME_NUMBER") or None,
            "locality": row.get("LOCALITY") or None,
            "street": row.get("STREET_NAME") or None,
            "town": row.get("TOWN") or None,
            "postcode": row.get("POSTCODE") or None,
        },
        "website": row.get("WEBSITE_URL") or None,
        "wikipedia": row.get("WIKIPEDIA_URL") or None,
        "groups": groups,
        "location": {
            "latitude": float(lat) if lat else None,
            "longitude": float(lon) if lon else None,
        },
        "hesa_id": row.get("HESA_ID") or None,
        "gtr_id": row.get("GTR_ID") or None,
        "view_name": row.get("VIEW_NAME") or None,
    }


def main():
    rows = fetch_csv(DATA_AC_UK_URL)
    universities = [normalise(r) for r in rows]
    universities.sort(key=lambda u: u["sort_name"])

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(universities, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\nWrote {len(universities)} universities to {OUTPUT_FILE}")

    # Stats
    with_website = sum(1 for u in universities if u["website"])
    with_coords = sum(1 for u in universities if u["location"]["latitude"])
    print(f"\n  With website:     {with_website}")
    print(f"  With coordinates: {with_coords}")

    # Group breakdown
    groups: dict[str, int] = {}
    for u in universities:
        for g in u["groups"]:
            groups[g] = groups.get(g, 0) + 1
    if groups:
        print("  Groups:")
        for name, count in sorted(groups.items(), key=lambda x: -x[1]):
            print(f"    {name}: {count}")


if __name__ == "__main__":
    main()
