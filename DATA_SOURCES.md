# UK University Data Sources

Comprehensive reference of publicly available datasets for UK universities.
Last verified: 2026-03-23.

---

## 1. UCAS Course Data (via Algolia Search API)

**What it covers:** Courses / programmes -- every undergraduate and postgraduate course listed on UCAS.

| Detail | Value |
|--------|-------|
| **Endpoint** | `POST https://Y3QRV216KL-dsn.algolia.net/1/indexes/*/queries` |
| **Index name** | `prod_courses` |
| **Auth** | Public frontend key (embedded in ucas.com): App ID `Y3QRV216KL`, API Key `c0f72e5c62250ac258c2cf4a3896c19d` |
| **Format** | JSON |
| **Access** | Free, no signup needed (public Algolia key) |
| **Coverage** | All UCAS-listed UK providers |
| **Total records** | ~7,800+ courses for a single subject query; full index likely 50k+ |

### Fields per course hit

| Field | Description |
|-------|-------------|
| `courseId` | UUID |
| `courseTitle` | Display name |
| `course` | Short name |
| `academicYear` | e.g. "2025" |
| `summary` | Full course description (HTML/text) |
| `university` | Provider name |
| `providerId` | Provider UUID |
| `providerWebsite` | URL |
| `providerAddress1..3`, `providerPostcode` | Address |
| `providerContactEmail`, `providerContactPhone` | Contact |
| `scheme` | "Undergraduate" or "Postgraduate" |
| `subjects` | Array with name, id, CAH codes |
| `_geoloc` | Lat/lng coordinates |
| `options[]` | Array of course variants, each containing: |
| -- `Qualification` | e.g. "BSc (Hons)", "MA (Hons)" |
| -- `studyMode` | "Full-time", "Part-time", etc. |
| -- `ucasPoints` | e.g. "108/152" |
| -- `entryReq_al` | A-level requirements (e.g. "BBC") |
| -- `entryReq_sh` | Scottish Higher requirements |
| -- `entryReq_bt` | BTEC requirements |
| -- `nssScore` | NSS satisfaction score |
| -- `avgSalary` | Average graduate salary |
| -- `location`, `postcode` | Campus location |
| -- `startDate`, `duration` | When/how long |

### Example request

```bash
curl -X POST "https://Y3QRV216KL-dsn.algolia.net/1/indexes/*/queries" \
  -H "X-Algolia-Application-Id: Y3QRV216KL" \
  -H "X-Algolia-API-Key: c0f72e5c62250ac258c2cf4a3896c19d" \
  -H "Content-Type: application/json" \
  -d '{"requests":[{"indexName":"prod_courses","params":"query=computer+science&hitsPerPage=10"}]}'
```

> **Note:** This is a public frontend key extracted from ucas.com. It could be rotated at any time. Not an official public API -- use responsibly and cache aggressively.

---

## 2. Discover Uni Dataset (formerly Unistats / KIS)

**What it covers:** Course-level data including NSS results, graduate outcomes, entry qualifications, continuation rates, and LEO (earnings) data for every undergraduate course.

| Detail | Value |
|--------|-------|
| **Download page** | https://www.hesa.ac.uk/support/tools-and-downloads/unistats |
| **Format** | ZIP containing XML + multiple CSV files |
| **Auth** | Free, no signup (direct download from HESA) |
| **Coverage** | All UK HE providers (England, Scotland, Wales, NI) |
| **Update frequency** | Weekly (Wednesday mornings) |
| **Licence** | Open data |

### CSV files in the dataset

| File | Contents |
|------|----------|
| `COMMON.csv` | Core course records (PUBUKPRN, KISCOURSEID, KISMODE, course title, UCAS code, provider) |
| `COURSELOCATION.csv` | Teaching locations per course |
| `COURSESTAGE.csv` | Year-by-year course structure |
| `DEGREECLASS.csv` | Degree classification outcomes (1st, 2:1, 2:2, etc.) |
| `EMPLOYMENT.csv` | Graduate employment outcomes |
| `ENTRY.csv` | Entry tariff/qualification data |
| `NSS.csv` | National Student Survey question-level results per course |
| `CONTINUATION.csv` | Continuation/dropout rates |
| `LEO3.csv` | Longitudinal Education Outcomes -- earnings 3 years after graduation |
| `LEO5.csv` | Earnings 5 years after graduation |
| `LEO3SEC.csv` / `LEO5SEC.csv` | Sector-level LEO data |
| `SALARY.csv` | Graduate salary data |
| `TARIFF.csv` | Entry tariff distributions |

### Key linking fields
- `PUBUKPRN` -- UK Provider Reference Number (links to your university list)
- `KISCOURSEID` -- Unique course identifier
- `KISMODE` -- Full-time (1) or Part-time (2)

### Documentation
- File structure: https://www.hesa.ac.uk/collection/c25061/discover_uni_dataset_file_structure
- Coding manual: https://www.hesa.ac.uk/collection/c25061/introduction

---

## 3. UKRI Gateway to Research (GtR) API

**What it covers:** All publicly funded UK research -- projects, grants, people, organisations, and outcomes (publications, impact, products).

| Detail | Value |
|--------|-------|
| **Base URL** | `https://gtr.ukri.org/gtr/api/` |
| **Format** | JSON or XML (set via Accept header) |
| **Auth** | None required -- fully public |
| **Coverage** | 173,200 projects, 142,277 persons, 89,912 organisations |
| **Page size** | 10-100 per page |
| **Status** | Officially "unsupported" but functional |

### Endpoints (verified working)

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/projects` | Research projects | `?p=1&s=10` |
| `/persons` | Researchers/PIs | `?p=1&s=10` |
| `/organisations` | Universities & companies | `?p=1&s=10` |
| `/funds` | Funding awards | |
| `/outcomes/*` | Research outputs | |

### Project fields
`id`, `title`, `status`, `grantCategory`, `leadFunder`, `leadOrganisationDepartment`, `abstractText`, `techAbstractText`, `potentialImpact`, `start`, `end`, `participantValues` (funding amounts), `researchSubjects`, `researchTopics`, `healthCategories`, `identifiers` (grant reference)

### Person fields
`id`, `firstName`, `surname`, `otherNames`, `email`, `orcidId`, plus links to their projects and organisations

### Organisation fields
`id`, `name`, `addresses` (postCode, region), plus links to projects and employees

### Example request
```bash
curl -H "Accept: application/json" "https://gtr.ukri.org/gtr/api/projects?p=1&s=10"
```

### Documentation
- API guide: https://gtr.ukri.org/resources/gtrapi2.html
- PDF spec: https://gtr.ukri.org/resources/GtR-2-API-v1.7.5.pdf

---

## 4. OpenAlex API

**What it covers:** Academic publications, authors, institutions, topics -- the largest open scholarly metadata catalogue.

| Detail | Value |
|--------|-------|
| **Base URL** | `https://api.openalex.org/` |
| **Format** | JSON |
| **Auth** | Free, no key required (polite pool: add `mailto=you@email.com` param) |
| **UK education institutions** | 566 |
| **UK-affiliated authors** | 1,989,510 |
| **Coverage** | Global, but filterable to UK |

### Endpoints (verified working)

| Endpoint | Filter for UK | Description |
|----------|--------------|-------------|
| `/institutions` | `?filter=country_code:gb,type:education` | UK universities |
| `/authors` | `?filter=last_known_institutions.country_code:gb` | UK-based academics |
| `/works` | `?filter=institutions.country_code:gb` | Publications by UK institutions |
| `/topics` | | Research topics taxonomy |
| `/sources` | | Journals/conferences |

### Institution fields
`id`, `ror`, `display_name`, `country_code`, `type`, `homepage_url`, `image_url`, `works_count`, `cited_by_count`, `summary_stats`, `geo` (city, lat/lng, country), `topics`, `counts_by_year`, `associated_institutions`, `ids` (ROR, Wikidata, GRID, etc.)

### Author fields
`id`, `orcid`, `display_name`, `works_count`, `cited_by_count`, `affiliations`, `last_known_institutions`, `topics`, `counts_by_year`

### Example
```bash
curl "https://api.openalex.org/institutions?filter=country_code:gb,type:education&per_page=10"
```

### Documentation
- https://docs.openalex.org/

---

## 5. HESA Open Data Tables

**What it covers:** Official UK HE statistics -- students, staff, and finances broken down by provider.

| Detail | Value |
|--------|-------|
| **Base URL** | https://www.hesa.ac.uk/data-and-analysis/ |
| **Format** | CSV downloads (some very large, 100s of MB zipped) |
| **Auth** | Free, no signup |
| **Coverage** | All UK HE providers |
| **Licence** | CC BY 4.0 |
| **Time range** | 2014/15 to 2024/25 (varies by table) |

### Student data tables
- **Table 1**: Enrolments by HE provider, level, mode, sex -- https://www.hesa.ac.uk/data-and-analysis/students/table-1
- **Table 28**: Non-UK students by provider and country -- https://www.hesa.ac.uk/data-and-analysis/students/table-28
- **Table 49**: Enrolments by provider and subject -- https://www.hesa.ac.uk/data-and-analysis/students/table-49
- **Table 52**: Enrolments by subject and domicile -- https://www.hesa.ac.uk/data-and-analysis/students/table-52
- Full list: https://www.hesa.ac.uk/data-and-analysis/students/releases

### Staff data tables
- **Table 11**: Staff FTE by provider and cost centre -- https://www.hesa.ac.uk/data-and-analysis/staff/table-11
- **Table 15**: Academic staff by cost centre and salary -- https://www.hesa.ac.uk/data-and-analysis/staff/table-15
- Full list: https://www.hesa.ac.uk/data-and-analysis/staff

### Finance data tables
- **Table 1**: Consolidated income and expenditure -- https://www.hesa.ac.uk/data-and-analysis/finances/table-1
- **Table 8**: Expenditure by provider, activity, cost centre -- https://www.hesa.ac.uk/data-and-analysis/finances/table-8
- **Table 14**: Key Financial Indicators -- https://www.hesa.ac.uk/data-and-analysis/finances/table-14
- Full list: https://www.hesa.ac.uk/data-and-analysis/finances

### Graduate Outcomes
- Open data repository: https://www.hesa.ac.uk/data-and-analysis/graduates/releases
- Coverage: UK HEPs and FECs, surveyed ~15 months after completion

---

## 6. NSS (National Student Survey) Results

**What it covers:** Student satisfaction scores at course and provider level across 27 questions.

| Detail | Value |
|--------|-------|
| **Download page** | https://www.officeforstudents.org.uk/data-and-analysis/national-student-survey-data/download-the-nss-data/ |
| **Format** | XLSX and CSV (in ZIP) |
| **Auth** | Free, direct download from Azure blob storage |
| **Coverage** | All English registered providers + devolved nations |
| **Latest** | 2025 results (published July 2025) |

### Available downloads

| File | Size | Format |
|------|------|--------|
| Full results (single CSV) | 307.5 MB | ZIP/CSV |
| Full results (segmented CSVs) | 325.5 MB | ZIP/CSV |
| Provider-level detailed workbooks | 520.4 MB | ZIP/XLSX |
| Headline provider results | 37 KB | XLSX |
| Student characteristics summary | 97 MB | XLSX |
| Student characteristics CSV | 66 MB | ZIP/CSV |

### Download URLs (2026 data release - February 2026 vintage)
Files served from `blobofsproduks.blob.core.windows.net/files/`.

### Archive
Historical data (2024, 2023, earlier): https://www.officeforstudents.org.uk/data-and-analysis/national-student-survey-data/nss-data-archive/

---

## 7. TEF (Teaching Excellence Framework) Data

**What it covers:** TEF ratings and underlying student outcome metrics per provider.

| Detail | Value |
|--------|-------|
| **Download page** | https://www.officeforstudents.org.uk/data-and-analysis/tef-data-dashboard/get-the-data/ |
| **Format** | Excel (ZIP) and CSV (ZIP) |
| **Auth** | Free, direct download |
| **Coverage** | English HE providers assessed under TEF |
| **Latest** | February 2026 release |

### Download URLs (verified)

| File | URL |
|------|-----|
| TEF Excel workbook | `https://blobofsproduks.blob.core.windows.net/files/TEF-data-Feb-2026/TEF_workbook.zip` |
| TEF CSV (by provider) | `https://blobofsproduks.blob.core.windows.net/files/TEF-data-Feb-2026/TEF_CSV_2025-2_by_provider.zip` |
| TEF CSV (all providers) | `https://blobofsproduks.blob.core.windows.net/files/TEF-data-Feb-2026/TEF_CSV_2025-2_all_providers.zip` |

### Data includes
- Student outcomes and experience measures
- Benchmark comparisons
- Split by provider and education level

---

## 8. REF 2021 Results (Research Excellence Framework)

**What it covers:** Research quality assessment for every UK university, across 34 subject areas.

| Detail | Value |
|--------|-------|
| **Download URL** | https://results2021.ref.ac.uk/profiles/export-all |
| **Format** | XLSX (Excel spreadsheet, ~509 KB) |
| **Auth** | Free, direct download |
| **Coverage** | 157 UK HEIs across 34 Units of Assessment |

### Data includes
- Overall quality profile per institution per UoA (% at 4*, 3*, 2*, 1*, unclassified)
- Sub-profiles: Outputs, Impact, Environment
- FTE of Category A staff submitted
- Filterable by institution and unit of assessment

### Additional databases
- **Impact case studies**: https://results2021.ref.ac.uk/impact (searchable, individual case studies)
- **Environment statements**: https://results2021.ref.ac.uk/environment

---

## 9. DfE Explore Education Statistics API

**What it covers:** Government education statistics including HE participation, graduate outcomes (LEO), widening participation.

| Detail | Value |
|--------|-------|
| **Base URL** | `https://api.education.gov.uk/statistics/v1/` |
| **Format** | JSON (API) / CSV (downloads, gzip-compressed) |
| **Auth** | Free, no key required |
| **Docs** | https://api.education.gov.uk/statistics/docs/ |

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /publications?search=...` | Search for publication series |
| `GET /data-sets/{id}/csv` | Download entire dataset as CSV |

### Relevant HE datasets available
- Foundation year participation and outcomes
- LEO Graduate and Postgraduate Outcomes
- Graduate labour market statistics
- Participation measures in higher education
- Widening participation in higher education
- Higher Level Learners in England
- Education and training statistics for the UK (includes HE Students table)

### Data catalogue (browse)
https://explore-education-statistics.service.gov.uk/data-catalogue

---

## 10. ORCID Public API

**What it covers:** Academic researcher profiles -- affiliations, publications, grants.

| Detail | Value |
|--------|-------|
| **Base URL** | `https://pub.orcid.org/v3.0/` |
| **Format** | JSON or XML |
| **Auth** | Free public API (no key for search; OAuth for full record reads) |
| **Coverage** | Global; ~51,000 records affiliated with Oxford alone |

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/search?q=affiliation-org-name:"University of Oxford"` | Search by affiliation |
| `/{orcid-id}/record` | Full researcher profile |
| `/{orcid-id}/works` | Publications list |
| `/{orcid-id}/employments` | Employment history |

### Example
```bash
curl -H "Accept: application/json" \
  "https://pub.orcid.org/v3.0/search?q=affiliation-org-name:%22University%20of%20Oxford%22&rows=10"
```

---

## 11. Wikidata SPARQL

**What it covers:** Structured data about UK universities -- founding dates, student counts, locations, affiliations, notable alumni/staff, logos.

| Detail | Value |
|--------|-------|
| **Endpoint** | `https://query.wikidata.org/sparql` |
| **GUI** | https://query.wikidata.org/ |
| **Format** | JSON, CSV, TSV (via Accept header or `&format=json`) |
| **Auth** | Free, no signup |
| **Licence** | CC0 public domain |

### Example query: All UK universities with properties

```sparql
SELECT ?uni ?uniLabel ?website ?students ?founded ?logo WHERE {
  ?uni wdt:P17 wd:Q145 .          # country: United Kingdom
  ?uni wdt:P31/wdt:P279* wd:Q3918 . # instance of: university
  OPTIONAL { ?uni wdt:P856 ?website }
  OPTIONAL { ?uni wdt:P2196 ?students }
  OPTIONAL { ?uni wdt:P571 ?founded }
  OPTIONAL { ?uni wdt:P154 ?logo }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
```

### Useful Wikidata properties for universities
- `P17` -- country
- `P31` -- instance of
- `P856` -- official website
- `P2196` -- number of students
- `P571` -- inception/founding date
- `P154` -- logo image
- `P159` -- headquarters location
- `P625` -- coordinate location
- `P463` -- member of (Russell Group, etc.)
- `P1566` -- GeoNames ID
- `P6782` -- ROR ID
- `P2862` -- Wikidata Cranfield academic ID

---

## 12. Office for Students -- Other Datasets

**What it covers:** Sector-wide data on access, participation, financial returns, student numbers.

| Detail | Value |
|--------|-------|
| **Portal** | https://www.officeforstudents.org.uk/data-and-analysis/ |
| **Format** | Excel and CSV downloads |
| **Auth** | Free |

### Available dashboards/data
- **Access and Participation Data Dashboard** -- breakdown by provider, demographics
- **Student Outcomes Data Dashboard** -- regulatory measures
- **Size and Shape of Provision** -- student population composition
- **Student Number Data** -- enrollment by registered provider
- **TRAC Data** -- Transparent Approach to Costing (financial)
- **Annual Financial Return** -- sector-level financial data
- **Degree Classifications** -- grade inflation analysis, 2010-11 to 2023-24
- **POLAR/TUNDRA** -- Young participation by area (postcode-level deprivation data)

---

## Summary: Best Sources by Category

| Need | Best Source(s) | Programmatic? |
|------|---------------|---------------|
| **Courses / programmes** | UCAS Algolia API, Discover Uni dataset | Yes |
| **Entry requirements** | UCAS Algolia (`entryReq_al`, `ucasPoints`), Discover Uni ENTRY.csv | Yes |
| **Modules** | No public dataset exists -- would need scraping individual university sites | No |
| **Academics / staff** | OpenAlex authors API, GtR persons API, ORCID public API, HESA staff tables | Yes |
| **Research outputs** | OpenAlex works API, GtR outcomes API | Yes |
| **Research grants** | GtR projects API (173k projects) | Yes |
| **Research quality (REF)** | REF 2021 XLSX download | Partial |
| **Student satisfaction (NSS)** | OfS NSS download, Discover Uni NSS.csv | Yes |
| **Graduate outcomes** | HESA Graduate Outcomes, Discover Uni EMPLOYMENT/LEO CSVs, DfE LEO API | Yes |
| **Student numbers** | HESA student tables, OfS student number data | Yes |
| **Rankings / TEF** | OfS TEF CSV download | Yes |
| **Financial data** | HESA finance tables, OfS TRAC/AFR data | Yes |
| **University metadata** | Wikidata SPARQL, data.ac.uk (you already have this) | Yes |

---

## Notes

1. **Module-level data**: There is no centralised UK source for individual module data. Some universities expose module catalogues through their websites, but there is no standard API or dataset.

2. **UCAS Algolia key**: This is a frontend public key extracted from the UCAS website. It is not an officially documented API. The key could change. Use it for initial data seeding, not as a live dependency.

3. **HESA website blocks automated crawlers** (returns 403 for many programmatic requests). The CSV downloads are available through the web interface but may require a browser session. The actual data files, once found, can be downloaded directly.

4. **Linking identifiers across datasets**:
   - `UKPRN` (UK Provider Reference Number) -- used by HESA, OfS, Discover Uni
   - `ROR ID` -- used by OpenAlex, Wikidata
   - `ORCID` -- links researchers across GtR, OpenAlex, ORCID
   - `UCAS provider code` -- used by UCAS
   - Wikidata `Q-ID` -- can link to all of the above via properties

5. **Rate limits**: OpenAlex requests a polite `mailto` parameter. GtR has no documented rate limits but is "unsupported". Wikidata SPARQL limits concurrent queries.
