import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # Data Sourcing/
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    # Try reading from .env in project root
    env_path = ROOT.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set — check .env or environment")

# UCAS Algolia
UCAS_ALGOLIA_APP_ID = "Y3QRV216KL"
UCAS_ALGOLIA_API_KEY = "c0f72e5c62250ac258c2cf4a3896c19d"
UCAS_ALGOLIA_INDEX = "prod_courses"
UCAS_ALGOLIA_URL = f"https://{UCAS_ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/*/queries"

# GtR
GTR_BASE_URL = "https://gtr.ukri.org/gtr/api"

# OpenAlex
OPENALEX_BASE_URL = "https://api.openalex.org"
OPENALEX_MAILTO = "universitydb@example.com"

# Wikidata
WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"
