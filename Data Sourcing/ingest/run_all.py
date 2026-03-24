#!/usr/bin/env python3
"""Run all ingestion scripts in order."""

import subprocess
import sys
import time
from pathlib import Path

SCRIPTS = [
    ("01_load_universities.py", "Loading universities from data.ac.uk"),
    ("02_enrich_wikidata.py", "Enriching from Wikidata"),
    ("03_enrich_openalex.py", "Enriching from OpenAlex institutions"),
    ("04_load_subjects.py", "Loading subject taxonomy"),
    ("05_load_ucas_courses.py", "Loading UCAS courses (76k — takes a few minutes)"),
    ("06_load_gtr.py", "Loading GtR orgs/persons/projects (300k+ — takes 30-60 min)"),
    ("07_load_openalex_authors.py", "Loading OpenAlex authors (2M — takes 20-30 min)"),
    ("08_load_tef.py", "Loading TEF data"),
    ("09_load_ref.py", "Loading REF 2021 results"),
]

HERE = Path(__file__).parent


def main():
    start_from = 1
    if len(sys.argv) > 1:
        start_from = int(sys.argv[1])

    total_start = time.time()

    for script, desc in SCRIPTS:
        num = int(script.split("_")[0])
        if num < start_from:
            print(f"Skipping {script}")
            continue

        print(f"\n{'='*60}")
        print(f"[{num}/9] {desc}")
        print(f"{'='*60}\n")

        result = subprocess.run(
            [sys.executable, str(HERE / script)],
            cwd=str(HERE),
            env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"},
        )
        if result.returncode != 0:
            print(f"\nERROR: {script} failed with exit code {result.returncode}")
            print(f"Fix the issue and re-run: python run_all.py {num}")
            sys.exit(1)

    elapsed = time.time() - total_start
    print(f"\n{'='*60}")
    print(f"All done in {elapsed/60:.1f} minutes")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
