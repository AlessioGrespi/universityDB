#!/usr/bin/env python3
"""
University Course URL Discovery Tool

Discovers course pages from a university website by pulling its sitemap
and filtering URLs with include/exclude regex patterns.

Usage:
    python scrape_courses.py --url https://www.lboro.ac.uk
    python scrape_courses.py --url https://www.lboro.ac.uk --fetch-titles --output courses.json
    python scrape_courses.py --url https://www.lboro.ac.uk --format csv --verbose
"""

import argparse
import csv
import gzip
import hashlib
import io
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from lxml import etree


# ---------------------------------------------------------------------------
# SitemapFetcher
# ---------------------------------------------------------------------------

SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class SitemapFetcher:
    """Discovers and fetches sitemaps for a given domain."""

    def __init__(self, base_url, session, delay=0.5, timeout=15,
                 cache_dir=None, limit=10000, verbose=False):
        self.base_url = base_url.rstrip("/")
        self.session = session
        self.delay = delay
        self.timeout = timeout
        self.cache_dir = Path(cache_dir) if cache_dir else None
        self.limit = limit
        self.verbose = verbose
        self._collected_urls = []
        self._seen_sitemaps = set()

    def log(self, msg):
        if self.verbose:
            print(f"[sitemap] {msg}", file=sys.stderr)

    # -- Discovery ----------------------------------------------------------

    def discover_sitemaps(self):
        """Find sitemap URLs via robots.txt, then fallback to common paths."""
        sitemap_urls = []

        # 1. Check robots.txt
        robots_url = f"{self.base_url}/robots.txt"
        self.log(f"Checking {robots_url}")
        text = self._fetch_text(robots_url)
        if text:
            for line in text.splitlines():
                line = line.strip()
                if line.lower().startswith("sitemap:"):
                    url = line.split(":", 1)[1].strip()
                    if url:
                        sitemap_urls.append(url)
                        self.log(f"  Found in robots.txt: {url}")

        # 2. Fallback to common paths if robots.txt had nothing
        if not sitemap_urls:
            for path in ["/sitemap.xml", "/sitemap_index.xml"]:
                candidate = f"{self.base_url}{path}"
                self.log(f"Trying {candidate}")
                content = self._fetch_text(candidate)
                if content and "<urlset" in content or content and "<sitemapindex" in content:
                    sitemap_urls.append(candidate)
                    self.log(f"  Found: {candidate}")
                    break

        return sitemap_urls

    # -- Fetching -----------------------------------------------------------

    def _fetch_text(self, url):
        """Fetch a URL and return its text content, or None on failure."""
        cache_path = self._cache_path(url)
        if cache_path and cache_path.exists():
            age_hours = (time.time() - cache_path.stat().st_mtime) / 3600
            if age_hours < 24:
                self.log(f"  Cache hit: {cache_path.name}")
                return cache_path.read_text(encoding="utf-8")

        try:
            resp = self.session.get(url, timeout=self.timeout)
            if resp.status_code == 429 or resp.status_code == 403:
                self.log(f"  Got {resp.status_code}, retrying in 5s...")
                time.sleep(5)
                resp = self.session.get(url, timeout=self.timeout)
            resp.raise_for_status()
        except requests.RequestException as e:
            self.log(f"  Failed to fetch {url}: {e}")
            return None

        # Handle gzip
        content_bytes = resp.content
        if url.endswith(".gz") or resp.headers.get("Content-Type", "").startswith("application/x-gzip"):
            try:
                content_bytes = gzip.decompress(content_bytes)
            except Exception:
                pass

        try:
            text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = content_bytes.decode(resp.apparent_encoding or "latin-1")

        if cache_path:
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            cache_path.write_text(text, encoding="utf-8")

        return text

    def _cache_path(self, url):
        if not self.cache_dir:
            return None
        url_hash = hashlib.sha256(url.encode()).hexdigest()[:16]
        return self.cache_dir / f"{url_hash}.xml"

    # -- Parsing ------------------------------------------------------------

    def _parse_sitemap(self, xml_text):
        """Parse sitemap XML. Returns (page_urls, sub_sitemap_urls)."""
        page_urls = []
        sub_sitemaps = []

        try:
            root = etree.fromstring(xml_text.encode("utf-8"))
        except etree.XMLSyntaxError as e:
            self.log(f"  Malformed XML: {e}")
            return page_urls, sub_sitemaps

        # Detect namespace
        tag = root.tag
        if "sitemapindex" in tag:
            for sitemap_el in root.findall("sm:sitemap/sm:loc", SITEMAP_NS):
                if sitemap_el.text:
                    sub_sitemaps.append(sitemap_el.text.strip())
        elif "urlset" in tag:
            for url_el in root.findall("sm:url/sm:loc", SITEMAP_NS):
                if url_el.text:
                    page_urls.append(url_el.text.strip())
        else:
            # Try without namespace (some sitemaps omit it)
            for loc in root.iter("loc"):
                if loc.text:
                    page_urls.append(loc.text.strip())
            for sitemap_el in root.iter("sitemap"):
                loc = sitemap_el.find("loc")
                if loc is not None and loc.text:
                    sub_sitemaps.append(loc.text.strip())

        return page_urls, sub_sitemaps

    # -- Main entry ---------------------------------------------------------

    def get_all_urls(self):
        """Discover sitemaps and collect all URLs up to the limit."""
        sitemap_urls = self.discover_sitemaps()
        if not sitemap_urls:
            self.log("No sitemaps found.")
            return []

        self._collected_urls = []
        self._seen_sitemaps = set()

        for url in sitemap_urls:
            if len(self._collected_urls) >= self.limit:
                break
            self._process_sitemap(url, depth=0)

        self.log(f"Collected {len(self._collected_urls)} URLs total")
        return self._collected_urls

    def _process_sitemap(self, url, depth):
        if depth > 3:
            self.log(f"  Max depth reached, skipping {url}")
            return
        if url in self._seen_sitemaps:
            return
        if len(self._collected_urls) >= self.limit:
            return

        self._seen_sitemaps.add(url)
        self.log(f"Fetching sitemap: {url}")

        if self.delay > 0:
            time.sleep(self.delay)

        text = self._fetch_text(url)
        if not text:
            return

        page_urls, sub_sitemaps = self._parse_sitemap(text)

        remaining = self.limit - len(self._collected_urls)
        self._collected_urls.extend(page_urls[:remaining])
        self.log(f"  Got {len(page_urls)} URLs, {len(sub_sitemaps)} sub-sitemaps")

        for sub_url in sub_sitemaps:
            if len(self._collected_urls) >= self.limit:
                break
            self._process_sitemap(sub_url, depth + 1)


# ---------------------------------------------------------------------------
# CourseURLFilter
# ---------------------------------------------------------------------------

class CourseURLFilter:
    """Filters URLs to identify course pages using include/exclude patterns."""

    # For titles: standard word-boundary matching
    DEGREE_PATTERN = re.compile(
        r"\b(?:"
        r"MScR?|BSc|BA|MA|MBA|PhD|MPhil|BEng|MEng|LLB|LLM|BBA|BMus|MArch|"
        r"PGCE|PGDip|PGCert|DPhil|MRes|FdA|FdSc|HND|HNC|CertHE|DipHE"
        r")\b",
        re.IGNORECASE,
    )

    # For URLs: two tiers of degree matching.
    # "Safe" degrees are long/unique enough to match as path segments (/bsc/, /msc-...)
    DEGREE_URL_SAFE = re.compile(
        r"(?:^|[/\-_])"
        r"(?:MScR?|BSc|MBA|PhD|MPhil|BEng|MEng|LLB|LLM|BBA|BMus|"
        r"PGCE|PGDip|PGCert|DPhil|MRes|FdA|FdSc|HND|HNC|CertHE|DipHE)"
        r"(?:$|[/\-_?\s])",
        re.IGNORECASE,
    )
    # "Ambiguous" degrees (BA, MA, MArch) only match when hyphen-adjacent
    # e.g. "ba-history", "march-architecture" but NOT "/march/" or "/ba/"
    DEGREE_URL_AMBIGUOUS = re.compile(
        r"(?:(?:^|[/\-_])(?:BA|MA|MArch)(?=\-)|(?<=\-)(?:BA|MA|MArch)(?:$|[/\-_?\s]))",
        re.IGNORECASE,
    )

    # Strong course path indicators - these directly indicate course listings
    COURSE_PATH_STRONG = re.compile(
        r"/(?:courses?|programmes?|degrees?|masters-degrees|research-degrees)(?:/|$|\?)",
        re.IGNORECASE,
    )

    # Weak indicators - only count as course pages when combined with strong
    # indicators or degree qualifications in the same URL
    COURSE_PATH_WEAK = re.compile(
        r"/(?:study(?:ing)?|undergraduate|postgraduate)(?:/|$|\?)",
        re.IGNORECASE,
    )

    # Combined: a weak path + a strong path or degree in the same URL
    COURSE_PATH_PATTERN = COURSE_PATH_STRONG  # for backward compat in _url_has_course_segment

    EXCLUDE_FRAGMENT = re.compile(r"#")

    EXCLUDE_EXTENSION = re.compile(
        r"\.(?:pdf|jpe?g|png|gif|css|js|xml|json|svg|ico|woff2?|ttf|eot|"
        r"mp[34]|zip|docx?|xlsx?|pptx?)(?:\?|$)",
        re.IGNORECASE,
    )

    EXCLUDE_PATH = re.compile(
        r"/(?:"
        r"staff|news|blog|events?|about|contact|privacy|cookies?|login|"
        r"search|sitemap|tags?|categor(?:y|ies)|archives?|feeds?|"
        r"wp-content|wp-admin|assets?|images?|css|js|"
        r"downloads?|accessibility|terms|disclaimer|"
        r"careers?|jobs?|vacancies|library|alumni|"
        r"accommodation|open-days?|apply|funding|scholarships?|"
        r"student-stories|student-life|support|international/country|"
        r"programme-specifications|entry-requirements|entryrequirements|"
        r"how-to-apply|fees-and-funding|fees-funding|fees|financial|"
        r"clearing|visit|campus|facilities|placement|"
        r"student-experience|testimonials|profiles?|"
        r"our-students|what-our-students-say|student-voices|"
        r"open-days?|applicants?|partners?|partnerships?|"
        r"school-college-liaison|parents?-and-guardians?|"
        r"ug-offer|pg-offer|visit-days?|life-at|"
        r"subjects/[^/]+/undergraduate|subjects/[^/]+/postgraduate|"
        r"access-edinburgh|widening-(?:access|participation)|"
        r"applying|your-application|making-an-application|"
        r"fees-finance|tuition|loans|mature|childcare|"
        r"open-days?-events|mailing-list|settling-in|"
        r"your-fees|future-career|overseas-exchange|"
        r"customcss|customjs|"
        r"news-events|enterprise|services|"
        r"selfservice|homeimages|"
        r"why-study-here|how-it-works|"
        r"entry-requirements[\-_]|"
        r"subject-areas?|"
        r"he-unboxed|stemlab|campaigns?|"
        r"our-commitment|welcome|outreach|"
        r"ludus|janus|digilabs|case-studies|"
        r"international-students|visit-us|about-our-courses|"
        r"impact-report|access-participation|"
        r"research-areas?|past-themes|past-summits|past-spotlight|"
        r"phd-opportunities|phd-vacancies|completed-phds|"
        r"professional-education|employability|"
        r"advance-your-career|order-prospectus|order-mini-guide|"
        r"teaching-learning|thinking-about|"
        r"web-chats?|chat|internal|"
        r"postgraduate-taught|recruit|"
        r"subjects|current-researchers?|"
        r"students/welcome|students/handbook|"
        r"our-commitment-to-you|"
        r"email-(?:alert|updates?)|register-email|course-feed|"
        r"course-search|portal-unavailable|"
        r"transparency-info|ug-to-pg|"
        r"doctoral-research|types-research|"
        r"masters/(?!a-z)[a-z]|subject-approval|"
        r"virtual-?tour|where-lboro|"
        r"media-centre|press-releases|"
        r"arts/whats-on|"
        r"cultural-hub|working-while|"
        r"exhibitions|short-courses|research/ias|phd-alerts|"
        r"admin-services|human-resources|"
        r"stats-advice|members-only|"
        r"success-guide|attributes-and-aspirations|"
        r"student-records|for-current-students|"
        r"research-and-innovation|support-for-staff|"
        r"scholarly-communication|open-access|"
        r"course-assets|study-widget|compare|"
        r"year-in-enterprise|internship|"
        r"careers-employability|graduate-profiles|"
        r"homecardsprimary|footer-site|"
        r"industrylinks|ourstudents|ourcourses|"
        r"contact-us|email-alert|register-email|"
        r"loughborough-campus|outstanding-campus|"
        r"international-foundation|international-study|"
        r"maths-support|induction|study-support|"
        r"visit-day|booking-confirmation|"
        r"types-masters|previous-degree|"
        r"spotlight|women-in-sport|"
        r"world-cant-wait|emiot"
        r")(?:/|$|\?)",
        re.IGNORECASE,
    )

    EXCLUDE_RESEARCH_STANDALONE = re.compile(
        r"/research(?:/|$|\?)",
        re.IGNORECASE,
    )

    EXCLUDE_EXTERNAL = re.compile(
        r"(?:facebook|twitter|linkedin|instagram|youtube|x)\.com",
        re.IGNORECASE,
    )

    def _url_has_course_segment(self, url):
        """Check if the URL path contains a course-related segment."""
        return bool(self.COURSE_PATH_PATTERN.search(url))

    # Paths that indicate a non-academic context for /courses/
    # (e.g. department training, admin, research group pages)
    # Top-level paths that indicate non-academic/non-course contexts.
    # /courses/ under these paths = internal training, not degree programmes.
    # Top-level paths that indicate non-academic contexts.
    # /courses/ or /programmes/ under these = internal training, not degrees.
    # Note: /departments/ is NOT here because many unis put courses there.
    NON_ACADEMIC_PREFIX = re.compile(
        r"^https?://[^/]+/(?:"
        r"admin[\-_]?services|human-resources|"
        r"research-and-innovation|support-for-staff|"
        r"students(?!/study)|"  # /students/ but not /students/study/
        r"a-z-research"
        r")(?:/|$)",
        re.IGNORECASE,
    )

    # Faculty/division paths where /courses/ means dept training, not degrees.
    # Only applies when the URL doesn't also contain /study/ or /undergraduate/ etc.
    FACULTY_PREFIX = re.compile(
        r"^https?://[^/]+/(?:"
        r"engineering|natural-sciences|medicine|"
        r"science|arts|humanities|"
        r"social-sciences|business|law"
        r")/(?:departments?|divisions?|centres?|sections?|groups?)/",
        re.IGNORECASE,
    )

    def _is_academic_context(self, url):
        """Check if the URL is in an academic/study context vs admin/dept internal."""
        has_study_path = bool(self.COURSE_PATH_WEAK.search(url))

        # Non-academic admin/research paths
        if self.NON_ACADEMIC_PREFIX.search(url):
            return has_study_path

        # Faculty/dept paths -- only non-academic if they don't contain
        # /study/, /undergraduate/, /postgraduate/
        if self.FACULTY_PREFIX.search(url):
            return has_study_path

        return True

    def matches_include(self, url, title=None):
        """Returns (matched, match_type) if URL or title matches an INCLUDE pattern."""
        has_degree_url = bool(self.DEGREE_URL_SAFE.search(url) or self.DEGREE_URL_AMBIGUOUS.search(url))
        is_academic = self._is_academic_context(url)

        # Strong course path (/courses/, /programmes/, /degree/)
        # but only in academic context
        if self.COURSE_PATH_STRONG.search(url) and is_academic:
            return True, "course_path"

        # Weak path (/study/, /undergraduate/, /postgraduate/) only counts
        # when combined with a strong path or degree abbreviation
        if self.COURSE_PATH_WEAK.search(url):
            if self.COURSE_PATH_STRONG.search(url):
                return True, "course_path"
            if has_degree_url:
                return True, "course_path_degree"

        # Degree in URL without any study/course path -- only in academic context
        if has_degree_url and is_academic:
            return True, "degree_qualification"

        # Title-based matching
        if title:
            if self.COURSE_PATH_STRONG.search(title):
                return True, "course_path_title"
            if self.DEGREE_PATTERN.search(title):
                return True, "degree_qualification_title"

        return False, None

    def matches_exclude(self, url, title=None):
        """Returns True if URL or title matches any EXCLUDE pattern."""
        if self.EXCLUDE_FRAGMENT.search(url):
            return True
        if self.EXCLUDE_EXTENSION.search(url):
            return True
        if self.EXCLUDE_EXTERNAL.search(url):
            return True
        if self.EXCLUDE_PATH.search(url):
            return True
        # Exclude /research only if URL doesn't also have a course segment
        if self.EXCLUDE_RESEARCH_STANDALONE.search(url) and not self._url_has_course_segment(url):
            return True
        return False

    def filter_urls(self, urls, titles=None):
        """Apply exclude-first, then include filters, then dedupe sub-pages."""
        results = []
        titles = titles or {}
        for url in urls:
            title = titles.get(url)
            if self.matches_exclude(url, title):
                continue
            matched, match_type = self.matches_include(url, title)
            if matched:
                results.append({
                    "url": url,
                    "title": title,
                    "matched_by": match_type,
                })
        return self._dedupe_subpages(results)

    # Sub-page path segments that indicate a detail/info page about a course,
    # not a separate course itself.
    SUBPAGE_SEGMENTS = re.compile(
        r"/(?:"
        # Loughborough-style camelCase sub-pages
        r"overview|whatyoullstudy|howyoullstudy|howyoullbeassessed|"
        r"whereyoullstudy|whychooseus|whystudythis(?:course|degree)|"
        r"yourfuturecareer|yourdevelopment|ouracademics|"
        r"professionalrecognition|relatedcourses|relateddegrees|"
        r"studyabroad|placementyear|companiesaftergraduating|"
        r"yearinenterprise|yearinindustry|"
        # Generic hyphenated sub-pages
        r"how-assessed|how-you-learn|how-you(?:ll)?-study|"
        r"what-you(?:ll)?-study|where-you(?:ll)?-study|"
        r"why-choose|why-study|why-this|"
        r"your-future|career-prospects|graduate-destinations|"
        r"study-abroad|year-abroad|placement-year|"
        r"related-courses|related-degrees|similar-courses|"
        r"our-academics|our-staff|meet-the-team|"
        r"student-profiles?|our-students|"
        # Temporal/structural segments
        r"year-?\d+|semester-?\d|final-?year|"
        r"summer-?\d{4}|semester\d+\d{4}|"
        # CMS/layout artefacts
        r"footer-?section|customcss-?section|customjs-?section|"
        r"section\d+|sidebar|richboxes|"
        r"column\d+|cards?|accolades|"
        # Course detail tabs
        r"key-facts|entry-requirements|fees|funding|"
        r"modules|timetable|assessment|teaching|"
        r"accreditation|recognition|"
        r"why-choose-us|how-to-apply|apply-now|"
        r"our-doctoral-researchers?|our-research-areas?|"
        r"studentsprojectwork|naturalsciencespathways|"
        r"msc-[\w-]+-overview|banner|"
        # Imperial-style sub-pages with year suffix
        r"entry-requirements[\-_]+\d{4}|"
        r"how-to-apply[\-_]+\d{4}|"
        r"tuition-fees[\-_]+\d{4}|"
        # General sub-pages
        r"prospective-students|current-students|"
        r"selected-publications|pastoral-support|"
        r"mitigating-circumstances|scholarships|"
        r"phd-studentships"
        r")(?:/|$)",
        re.IGNORECASE,
    )

    # Patterns for pages that list research students (not courses)
    RESEARCH_STUDENT_PARENT = re.compile(
        r"/(?:phd|mphil|research-degrees)/(?:students|profiles?|people)?/?$",
        re.IGNORECASE,
    )

    @classmethod
    def _dedupe_subpages(cls, results):
        """Collapse sub-page URLs to their root course page.

        Removes a URL if:
        1. It is a child of another result URL AND the extra path segments
           look like course sub-pages (overview, whatyoullstudy, etc.)
        2. It is a child of a /phd/ or /research-degrees/phd/ page and looks
           like a student profile (person name, not a course).
        """
        url_set = {r["url"].rstrip("/") for r in results}
        kept = []

        for item in results:
            url = item["url"].rstrip("/")
            parts = url.split("/")
            is_subpage = False

            for i in range(len(parts) - 1, 3, -1):
                parent = "/".join(parts[:i])
                if parent in url_set and parent != url:
                    extra = url[len(parent):]
                    # Check known sub-page patterns
                    if cls.SUBPAGE_SEGMENTS.search(extra):
                        is_subpage = True
                        break
                    # Check if parent is a PhD/research listing and child is
                    # a student profile (single segment, no course keywords)
                    if (parent.rstrip("/").endswith(("/phd", "/mphil"))
                            and extra.count("/") <= 2):
                        child_seg = extra.strip("/")
                        if not cls.COURSE_PATH_PATTERN.search(extra) and \
                           not cls.DEGREE_URL_SAFE.search(extra):
                            is_subpage = True
                            break

            if not is_subpage:
                kept.append(item)

        return cls._dedupe_entry_years(kept)

    @staticmethod
    def _dedupe_entry_years(results):
        """Deduplicate courses that appear under multiple entry years.

        e.g. /courses/undergraduate/2026/computing/ and
             /courses/undergraduate/2027/computing/
        Keeps only the latest year for each course.
        """
        year_pattern = re.compile(r"(/20\d{2})(/|$)")
        by_canonical = {}  # canonical URL -> (year, item)

        for item in results:
            url = item["url"]
            m = year_pattern.search(url)
            if m:
                year = int(m.group(1)[1:])  # e.g. 2027
                canonical = url[:m.start()] + url[m.end()-1:]  # remove year segment
                if canonical not in by_canonical or year > by_canonical[canonical][0]:
                    by_canonical[canonical] = (year, item)
            else:
                # No year in URL, keep as-is
                by_canonical[url] = (0, item)

        return [item for _, item in by_canonical.values()]


# ---------------------------------------------------------------------------
# TitleFetcher
# ---------------------------------------------------------------------------

class TitleFetcher:
    """Fetches page titles by streaming only the first 32KB of each page."""

    def __init__(self, session, delay=0.5, timeout=15, verbose=False):
        self.session = session
        self.delay = delay
        self.timeout = timeout
        self.verbose = verbose

    def log(self, msg):
        if self.verbose:
            print(f"[titles] {msg}", file=sys.stderr)

    def fetch_title(self, url):
        """Fetch a single page title. Returns title string or None."""
        try:
            resp = self.session.get(url, timeout=self.timeout, stream=True)
            resp.raise_for_status()
            # Read only first 32KB
            chunks = []
            total = 0
            for chunk in resp.iter_content(chunk_size=8192, decode_unicode=True):
                chunks.append(chunk)
                total += len(chunk)
                if total >= 32768:
                    break
            resp.close()
            html = "".join(chunks)
            soup = BeautifulSoup(html, "lxml")
            title_tag = soup.find("title")
            if title_tag and title_tag.string:
                return title_tag.string.strip()
        except Exception as e:
            self.log(f"  Failed to fetch title for {url}: {e}")
        return None

    def fetch_titles_batch(self, urls):
        """Fetch titles for a list of URLs. Returns {url: title} dict."""
        titles = {}
        total = len(urls)
        for i, url in enumerate(urls):
            if self.verbose and (i % 50 == 0 or i == total - 1):
                self.log(f"  Fetching title {i+1}/{total}")
            title = self.fetch_title(url)
            if title:
                titles[url] = title
            if self.delay > 0:
                time.sleep(self.delay)
        return titles


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def format_json(results):
    return json.dumps(results, indent=2, ensure_ascii=False)


def format_csv(results):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["url", "title", "matched_by"])
    writer.writeheader()
    writer.writerows(results)
    return output.getvalue()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def make_session():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "UniversityDB-CourseScraper/1.0 (+https://github.com/AlessioGrespi/universityDB)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate",
    })
    return session


def main():
    parser = argparse.ArgumentParser(
        description="Discover course pages from a university website via its sitemap.",
    )
    parser.add_argument("--url", required=True, help="University website URL")
    parser.add_argument("--fetch-titles", action="store_true",
                        help="Fetch <title> from each candidate URL (slow)")
    parser.add_argument("--format", choices=["json", "csv"], default="json",
                        help="Output format (default: json)")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--limit", type=int, default=10000,
                        help="Max URLs to process from sitemap (default: 10000)")
    parser.add_argument("--delay", type=float, default=0.5,
                        help="Seconds between HTTP requests (default: 0.5)")
    parser.add_argument("--timeout", type=int, default=15,
                        help="HTTP request timeout in seconds (default: 15)")
    parser.add_argument("--verbose", action="store_true",
                        help="Print progress info to stderr")
    parser.add_argument("--cache-dir", help="Directory to cache fetched sitemaps")
    args = parser.parse_args()

    # Normalise URL
    url = args.url
    if not url.startswith("http"):
        url = "https://" + url

    session = make_session()

    # 1. Fetch sitemap URLs
    fetcher = SitemapFetcher(
        base_url=url,
        session=session,
        delay=args.delay,
        timeout=args.timeout,
        cache_dir=args.cache_dir,
        limit=args.limit,
        verbose=args.verbose,
    )

    try:
        all_urls = fetcher.get_all_urls()
    except KeyboardInterrupt:
        print("\nInterrupted. Outputting results so far.", file=sys.stderr)
        all_urls = fetcher._collected_urls

    if not all_urls:
        print("No sitemap URLs found.", file=sys.stderr)
        sys.exit(1)

    if args.verbose:
        print(f"[main] {len(all_urls)} URLs from sitemap", file=sys.stderr)

    # 2. Optionally fetch titles (before filtering, to use in filter)
    titles = {}
    if args.fetch_titles:
        # Pre-filter to reduce title fetches: only fetch for URLs that
        # pass a loose include check OR don't match excludes
        course_filter = CourseURLFilter()
        candidates = [u for u in all_urls if not course_filter.matches_exclude(u)]
        if args.verbose:
            print(f"[main] {len(candidates)} candidates after exclude pre-filter", file=sys.stderr)

        title_fetcher = TitleFetcher(
            session=session,
            delay=args.delay,
            timeout=args.timeout,
            verbose=args.verbose,
        )
        try:
            titles = title_fetcher.fetch_titles_batch(candidates)
        except KeyboardInterrupt:
            print("\nTitle fetch interrupted. Using titles collected so far.", file=sys.stderr)

    # 3. Filter
    course_filter = CourseURLFilter()
    results = course_filter.filter_urls(all_urls, titles)

    if args.verbose:
        print(f"[main] {len(results)} course URLs found", file=sys.stderr)

    # 4. Output
    if args.format == "csv":
        output_text = format_csv(results)
    else:
        output_text = format_json(results)

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output_text, encoding="utf-8")
        if args.verbose:
            print(f"[main] Written to {args.output}", file=sys.stderr)
    else:
        print(output_text)


if __name__ == "__main__":
    main()
