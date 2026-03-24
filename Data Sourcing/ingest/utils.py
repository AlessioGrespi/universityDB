"""Shared utilities — slugs, name matching, HTTP helpers."""

import json
import re
import time
import urllib.request
import urllib.parse
from slugify import slugify as _slugify
from rapidfuzz import fuzz


def make_slug(name: str) -> str:
    return _slugify(name, max_length=200)


# ─── Name normalisation for matching ──────────────────────────────────────────

_STRIP_PREFIXES = [
    "the ", "university of ", "university college ",
]
_STRIP_SUFFIXES = [
    ", birmingham", ", london", ", bristol",
    " (the)", " the", " ltd", " limited",
]

def _normalise_name(name: str) -> str:
    n = name.lower().strip()
    for p in _STRIP_PREFIXES:
        if n.startswith(p):
            n = n[len(p):]
    for s in _STRIP_SUFFIXES:
        if n.endswith(s):
            n = n[:-len(s)]
    # Handle "Bristol, UWE" -> "uwe bristol" but only for 2-part names
    # Don't reverse multi-comma names like "Imperial College of Science, Technology and Medicine"
    if n.count(",") == 1:
        parts = n.split(",")
        if len(parts[0].split()) <= 3 and len(parts[1].split()) <= 3:
            n = parts[1].strip() + " " + parts[0].strip()
    n = re.sub(r"[^a-z0-9 ]", "", n)
    return n.strip()


# Known UCAS name -> data.ac.uk name aliases for tricky cases
_NAME_ALIASES = {
    "imperial college london": "imperial college of science technology and medicine",
    "uwe bristol": "the west of england",
    "bristol uwe": "the west of england",
    "ucl university college london": "university college london",
    "lse": "london school of economics political science",
    "soas london": "school of oriental and african studies",
    "city london": "city university",
    "university of london royal holloway": "royal holloway college and bedford new college",
    "london royal holloway": "royal holloway college and bedford new college",
}


class UniversityMatcher:
    """Builds a lookup cache for matching university names/IDs."""

    def __init__(self, universities: list[dict]):
        self._by_id: dict[str, int] = {}  # external_id -> db id
        self._by_norm_name: dict[str, int] = {}
        self._names: list[tuple[str, int]] = []  # (normalised, db_id)

        for u in universities:
            db_id = u["id"]
            for key in ("ukprn", "gtr_id", "ror_id", "openalex_id", "wikidata_id", "ucas_provider_id"):
                val = u.get(key)
                if val:
                    self._by_id[str(val).lower()] = db_id

            norm = _normalise_name(u.get("name", ""))
            self._by_norm_name[norm] = db_id
            self._names.append((norm, db_id))

    def match(self, *, name: str | None = None, **ids) -> int | None:
        """Try to match by any external ID first, then by name."""
        for key, val in ids.items():
            if val:
                db_id = self._by_id.get(str(val).lower())
                if db_id:
                    return db_id

        if name:
            norm = _normalise_name(name)
            # Check alias map first
            if norm in _NAME_ALIASES:
                alias_norm = _NAME_ALIASES[norm]
                if alias_norm in self._by_norm_name:
                    return self._by_norm_name[alias_norm]
            # Exact normalised match
            if norm in self._by_norm_name:
                return self._by_norm_name[norm]
            # Fuzzy match — try token_set_ratio (handles substrings better)
            best_score, best_id = 0, None
            for cand_name, cand_id in self._names:
                score = max(
                    fuzz.token_sort_ratio(norm, cand_name),
                    fuzz.token_set_ratio(norm, cand_name),
                )
                if score > best_score:
                    best_score = score
                    best_id = cand_id
            if best_score >= 85:
                return best_id

        return None

    def add_id(self, external_id: str, db_id: int):
        self._by_id[str(external_id).lower()] = db_id


# ─── HTTP helpers ─────────────────────────────────────────────────────────────

def fetch_json(url: str, headers: dict | None = None, timeout: int = 30) -> dict:
    headers = headers or {}
    if "User-Agent" not in headers:
        headers["User-Agent"] = "UniversityDB/1.0"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def post_json(url: str, data: dict, headers: dict | None = None, timeout: int = 30) -> dict:
    headers = headers or {}
    if "User-Agent" not in headers:
        headers["User-Agent"] = "UniversityDB/1.0"
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_with_retry(url: str, headers: dict | None = None, retries: int = 3, timeout: int = 30) -> dict:
    for attempt in range(retries):
        try:
            return fetch_json(url, headers, timeout)
        except Exception as e:
            if attempt == retries - 1:
                raise
            wait = 2 ** attempt
            print(f"  Retry {attempt+1}/{retries} after {wait}s: {e}")
            time.sleep(wait)
    raise RuntimeError("unreachable")


def paginate_gtr(endpoint: str, page_size: int = 100, max_pages: int | None = None):
    """Yield all items from a GtR paginated endpoint."""
    page = 1
    while True:
        url = f"{endpoint}?p={page}&s={page_size}"
        data = fetch_with_retry(url, headers={"Accept": "application/json"}, timeout=60)

        # GtR returns the items under a key that varies by endpoint
        items = None
        for key in ("project", "person", "organisation", "fund"):
            if key in data:
                items = data[key]
                break
        if items is None:
            break

        yield from items

        total_pages = data.get("totalPages", 1)
        if page >= total_pages:
            break
        if max_pages and page >= max_pages:
            break
        page += 1
        time.sleep(0.1)  # be polite


def paginate_openalex(endpoint: str, per_page: int = 200, max_results: int | None = None):
    """Yield all items from an OpenAlex cursor-paginated endpoint."""
    cursor = "*"
    count = 0
    while cursor:
        sep = "&" if "?" in endpoint else "?"
        url = f"{endpoint}{sep}per_page={per_page}&cursor={cursor}&mailto=universitydb@example.com"
        data = fetch_with_retry(url, timeout=60)
        results = data.get("results", [])
        if not results:
            break
        yield from results
        count += len(results)
        if max_results and count >= max_results:
            break
        cursor = data.get("meta", {}).get("next_cursor")
        time.sleep(0.1)
