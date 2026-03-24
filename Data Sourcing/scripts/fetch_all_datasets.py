#!/usr/bin/env python3
"""
Pulls sample/full data from all identified UK university data sources.
Saves everything into data/raw/ for inspection.
"""

import csv
import io
import json
import os
import urllib.request
import urllib.parse
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
RAW.mkdir(parents=True, exist_ok=True)


def fetch_json(url: str, headers: dict | None = None) -> dict:
    headers = headers or {}
    if "User-Agent" not in headers:
        headers["User-Agent"] = "UniversityDB/1.0"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_text(url: str, headers: dict | None = None) -> str:
    headers = headers or {}
    if "User-Agent" not in headers:
        headers["User-Agent"] = "UniversityDB/1.0"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8-sig")


def fetch_bytes(url: str, headers: dict | None = None) -> bytes:
    headers = headers or {}
    if "User-Agent" not in headers:
        headers["User-Agent"] = "UniversityDB/1.0"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def save_json(data, filename: str):
    path = RAW / filename
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  -> Saved {path} ({path.stat().st_size:,} bytes)")


def save_bytes(data: bytes, filename: str):
    path = RAW / filename
    path.write_bytes(data)
    print(f"  -> Saved {path} ({len(data):,} bytes)")


# ─── 1. Wikidata SPARQL ───────────────────────────────────────────────────────

def fetch_wikidata():
    print("\n=== WIKIDATA SPARQL ===")
    query = """
    SELECT ?uni ?uniLabel ?website ?students ?founded ?logo ?rorId ?coord WHERE {
      ?uni wdt:P17 wd:Q145 .
      ?uni wdt:P31/wdt:P279* wd:Q3918 .
      OPTIONAL { ?uni wdt:P856 ?website }
      OPTIONAL { ?uni wdt:P2196 ?students }
      OPTIONAL { ?uni wdt:P571 ?founded }
      OPTIONAL { ?uni wdt:P154 ?logo }
      OPTIONAL { ?uni wdt:P6782 ?rorId }
      OPTIONAL { ?uni wdt:P625 ?coord }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    }
    """
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode(
        {"query": query, "format": "json"}
    )
    data = fetch_json(url, {"Accept": "application/json", "User-Agent": "UniversityDB/1.0 (github.com)"})
    results = data.get("results", {}).get("bindings", [])
    print(f"  Got {len(results)} results")
    save_json(results, "wikidata_uk_universities.json")
    # Show sample
    if results:
        r = results[0]
        print(f"  Sample: {r.get('uniLabel', {}).get('value', '?')}")
        for k, v in r.items():
            print(f"    {k}: {v.get('value', '')[:80]}")


# ─── 2. UCAS Algolia ──────────────────────────────────────────────────────────

def fetch_ucas():
    print("\n=== UCAS COURSES (Algolia) ===")
    url = "https://Y3QRV216KL-dsn.algolia.net/1/indexes/*/queries"
    headers = {
        "X-Algolia-Application-Id": "Y3QRV216KL",
        "X-Algolia-API-Key": "c0f72e5c62250ac258c2cf4a3896c19d",
        "Content-Type": "application/json",
    }
    # Grab a broad sample - empty query, just get first 100
    body = json.dumps({
        "requests": [
            {
                "indexName": "prod_courses",
                "params": "query=&hitsPerPage=100&page=0"
            }
        ]
    }).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    results = data.get("results", [{}])[0]
    hits = results.get("hits", [])
    total = results.get("nbHits", 0)
    print(f"  Got {len(hits)} hits (total available: {total:,})")
    save_json(hits, "ucas_courses_sample.json")
    # Show sample
    if hits:
        h = hits[0]
        print(f"  Sample: {h.get('courseTitle', '?')} at {h.get('university', '?')}")
        print(f"  Top-level keys: {list(h.keys())}")
        opts = h.get("options", [])
        if opts:
            print(f"  Options[0] keys: {list(opts[0].keys())}")


# ─── 3. UKRI Gateway to Research ──────────────────────────────────────────────

def fetch_gtr():
    print("\n=== UKRI GATEWAY TO RESEARCH ===")
    headers = {"Accept": "application/json"}

    # Projects
    print("  Fetching projects...")
    data = fetch_json("https://gtr.ukri.org/gtr/api/projects?p=1&s=20", headers)
    projects = data.get("project", [])
    total_projects = data.get("totalSize", 0)
    print(f"  Got {len(projects)} projects (total: {total_projects:,})")
    save_json(projects, "gtr_projects_sample.json")
    if projects:
        p = projects[0]
        print(f"  Sample: {p.get('title', '?')[:80]}")
        print(f"  Keys: {list(p.keys())}")

    # Persons
    print("  Fetching persons...")
    data = fetch_json("https://gtr.ukri.org/gtr/api/persons?p=1&s=20", headers)
    persons = data.get("person", [])
    total_persons = data.get("totalSize", 0)
    print(f"  Got {len(persons)} persons (total: {total_persons:,})")
    save_json(persons, "gtr_persons_sample.json")
    if persons:
        p = persons[0]
        print(f"  Sample: {p.get('firstName', '')} {p.get('surname', '')}")
        print(f"  Keys: {list(p.keys())}")

    # Organisations
    print("  Fetching organisations...")
    data = fetch_json("https://gtr.ukri.org/gtr/api/organisations?p=1&s=20", headers)
    orgs = data.get("organisation", [])
    total_orgs = data.get("totalSize", 0)
    print(f"  Got {len(orgs)} organisations (total: {total_orgs:,})")
    save_json(orgs, "gtr_organisations_sample.json")
    if orgs:
        o = orgs[0]
        print(f"  Sample: {o.get('name', '?')}")
        print(f"  Keys: {list(o.keys())}")


# ─── 4. OpenAlex ──────────────────────────────────────────────────────────────

def fetch_openalex():
    print("\n=== OPENALEX ===")

    # UK institutions
    print("  Fetching UK institutions...")
    data = fetch_json(
        "https://api.openalex.org/institutions?filter=country_code:gb,type:education&per_page=50&mailto=universitydb@example.com"
    )
    institutions = data.get("results", [])
    total = data.get("meta", {}).get("count", 0)
    print(f"  Got {len(institutions)} institutions (total: {total})")
    save_json(institutions, "openalex_uk_institutions_sample.json")
    if institutions:
        i = institutions[0]
        print(f"  Sample: {i.get('display_name', '?')} (works: {i.get('works_count', 0):,})")
        print(f"  Keys: {list(i.keys())}")

    # Sample authors from a top UK uni
    print("  Fetching UK authors sample...")
    data = fetch_json(
        "https://api.openalex.org/authors?filter=last_known_institutions.country_code:gb&per_page=20&mailto=universitydb@example.com"
    )
    authors = data.get("results", [])
    total_authors = data.get("meta", {}).get("count", 0)
    print(f"  Got {len(authors)} authors (total: {total_authors:,})")
    save_json(authors, "openalex_uk_authors_sample.json")
    if authors:
        a = authors[0]
        print(f"  Sample: {a.get('display_name', '?').encode('ascii', 'replace').decode()} (cited: {a.get('cited_by_count', 0):,})")
        print(f"  Keys: {list(a.keys())}")


# ─── 5. REF 2021 ──────────────────────────────────────────────────────────────

def fetch_ref():
    print("\n=== REF 2021 RESULTS ===")
    try:
        data = fetch_bytes("https://results2021.ref.ac.uk/profiles/export-all")
        save_bytes(data, "ref2021_results.xlsx")
    except Exception as e:
        print(f"  Failed: {e}")


# ─── 6. TEF Data ──────────────────────────────────────────────────────────────

def fetch_tef():
    print("\n=== TEF DATA ===")
    urls = {
        "tef_csv_all_providers.zip": "https://blobofsproduks.blob.core.windows.net/files/TEF-data-Feb-2026/TEF_CSV_2025-2_all_providers.zip",
    }
    for filename, url in urls.items():
        try:
            print(f"  Fetching {filename}...")
            data = fetch_bytes(url)
            save_bytes(data, filename)
            # Try to peek inside the zip
            zf = zipfile.ZipFile(io.BytesIO(data))
            print(f"  ZIP contents: {zf.namelist()}")
            # Read first CSV
            for name in zf.namelist():
                if name.endswith(".csv"):
                    with zf.open(name) as f:
                        text = f.read().decode("utf-8-sig")
                    reader = csv.DictReader(io.StringIO(text))
                    rows = list(reader)
                    print(f"  {name}: {len(rows)} rows")
                    if rows:
                        print(f"  Columns: {list(rows[0].keys())}")
                    save_json(rows[:20], f"tef_sample_{name.replace('.csv', '.json')}")
                    break
        except Exception as e:
            print(f"  Failed for {filename}: {e}")


# ─── 7. Discover Uni / Unistats ───────────────────────────────────────────────

def fetch_discover_uni():
    print("\n=== DISCOVER UNI (HESA Unistats) ===")
    # The download page is at hesa.ac.uk - need to find the actual ZIP URL
    # Try the known pattern
    urls_to_try = [
        "https://www.hesa.ac.uk/support/tools-and-downloads/unistats",
    ]
    # HESA blocks direct automated downloads with 403, so let's try to find the actual file URL
    # The dataset is also mirrored/accessible via direct links sometimes
    try:
        print("  Trying HESA Unistats download page...")
        text = fetch_text("https://www.hesa.ac.uk/support/tools-and-downloads/unistats")
        # Look for download links
        import re
        links = re.findall(r'href="([^"]*(?:csv|zip|xml)[^"]*)"', text, re.IGNORECASE)
        if links:
            print(f"  Found {len(links)} download links:")
            for link in links[:5]:
                print(f"    {link}")
        else:
            print("  No direct download links found on page")
    except Exception as e:
        print(f"  HESA page blocked: {e}")
        print("  (HESA blocks automated requests - download manually from browser)")


# ─── 8. NSS Data ──────────────────────────────────────────────────────────────

def fetch_nss():
    print("\n=== NSS RESULTS ===")
    # Try the headline provider results (small file)
    try:
        # The OfS page lists downloads - try the headline file which is small
        print("  Trying OfS NSS headline data...")
        # These URLs are from the OfS download page on Azure blob storage
        url = "https://blobofsproduks.blob.core.windows.net/files/NSS%20data%202025/NSS25%20headline%20provider%20results.xlsx"
        data = fetch_bytes(url)
        save_bytes(data, "nss_headline_2025.xlsx")
    except Exception as e:
        print(f"  Failed: {e}")
        # Try older year
        try:
            url = "https://blobofsproduks.blob.core.windows.net/files/NSS%20data%202024/NSS24%20headline%20provider%20results.xlsx"
            data = fetch_bytes(url)
            save_bytes(data, "nss_headline_2024.xlsx")
        except Exception as e2:
            print(f"  Also failed for 2024: {e2}")


# ─── 9. DfE Education Statistics API ──────────────────────────────────────────

def fetch_dfe():
    print("\n=== DfE EXPLORE EDUCATION STATISTICS ===")
    try:
        data = fetch_json("https://api.education.gov.uk/statistics/v1/publications?search=higher+education&page=1&pageSize=10")
        pubs = data.get("results", [])
        print(f"  Found {len(pubs)} publications matching 'higher education'")
        save_json(pubs, "dfe_he_publications.json")
        for p in pubs[:5]:
            print(f"    - {p.get('title', '?')}")
    except Exception as e:
        print(f"  Failed: {e}")


# ─── Run all ──────────────────────────────────────────────────────────────────

def main():
    print("Pulling data from all sources into data/raw/\n")

    fetch_wikidata()
    fetch_ucas()
    fetch_gtr()
    fetch_openalex()
    fetch_ref()
    fetch_tef()
    fetch_discover_uni()
    fetch_nss()
    fetch_dfe()

    print("\n\n=== DONE ===")
    print(f"All files saved to {RAW}")
    # List all files
    for f in sorted(RAW.iterdir()):
        print(f"  {f.name:45s} {f.stat().st_size:>10,} bytes")


if __name__ == "__main__":
    main()
