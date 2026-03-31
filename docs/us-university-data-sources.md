# US University Data Sources

Research into complete, programmatically accessible datasets for American universities.

## 1. College Scorecard (U.S. Department of Education)

**Coverage:** ~6,700 institutions, ~3,000 data columns
- Institution names, locations, URLs, accreditation
- Admissions rates, SAT/ACT score ranges
- Tuition and fees (in-state/out-of-state), net price by income bracket
- Completion/graduation rates
- Post-graduation earnings (by program and institution)
- Student demographics (race/ethnicity, age, gender)
- Enrollment numbers
- Financial aid data (Pell Grant rates, federal loan rates, median debt)
- Field of study-level data (earnings, debt by CIP code)

**Access:**
- **REST API** (free key via [api.data.gov](https://api.data.gov/signup/)):
  - Base URL: `https://api.data.gov/ed/collegescorecard/v1/schools`
  - Example: `https://api.data.gov/ed/collegescorecard/v1/schools?api_key=YOUR_KEY&school.name=Harvard`
  - Docs: https://collegescorecard.ed.gov/data/documentation/
- **Bulk CSV download:** https://collegescorecard.ed.gov/data/
  - Annual files going back to 1996, plus a "Most Recent" merged file
  - Field-of-study-level files also available

**Format:** JSON (API), CSV (bulk)

**Limitations:** No individual course/module listings. No faculty/research data. Some fields suppressed for small cohorts (privacy). Data lags ~2 years.

---

## 2. IPEDS (Integrated Postsecondary Education Data System)

**Coverage:** ~6,400+ Title IV institutions (mandatory reporting)
- Institutional characteristics (name, address, sector, Carnegie classification)
- Enrollment by level, attendance status, race/ethnicity, gender
- Completions/degrees awarded by CIP code
- Tuition, fees, room and board
- Financial aid awarded
- Graduation rates (overall and by demographic group)
- Faculty and staff counts, salaries, tenure status
- Institutional finances (revenues, expenditures)
- Admissions data (applicants, admits, enrollees, test scores)

**Access:**
- **Bulk CSV download:** https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx
- **IPEDS Data Explorer (web UI):** https://nces.ed.gov/ipeds/datacenter/
- No official REST API — use Urban Institute API below

**Format:** CSV (with data dictionaries/codebooks)

**Limitations:** No REST API. Complex variable naming (survey-component-based). Requires joining multiple files. Data lags ~1-2 years.

---

## 3. IPEDS via Urban Institute Education Data Portal

Mirrors IPEDS data in a clean, queryable REST API. Also includes College Scorecard data and federal student loan data.

**Access:**
- **REST API** (free, no key required):
  - Base URL: `https://educationdata.urban.org/api/v1/`
  - Directory: `https://educationdata.urban.org/api/v1/college-university/ipeds/directory/2022/`
  - Admissions: `https://educationdata.urban.org/api/v1/college-university/ipeds/admissions-enrollment/2022/`
  - Docs: https://educationdata.urban.org/documentation/
- R and Stata packages also available

**Format:** JSON (API), CSV (downloadable)

**Limitations:** Slight lag behind raw IPEDS releases. Some granular IPEDS tables may not be fully represented.

---

## 4. CIP Codes (Classification of Instructional Programs)

The standardized taxonomy of academic programs used by IPEDS and College Scorecard.
- 2-digit (broad field), 4-digit (intermediate), 6-digit (specific program)
- e.g., CIP 11.0701 = Computer Science

**Access:** https://nces.ed.gov/ipeds/cipcode/

**Format:** Excel/CSV

**Note:** These are classification codes, not course catalogs. You get "University X awarded 150 CS degrees" but not individual course titles or syllabi.

---

## 5. OpenAlex (Research Output)

Free, open catalog of scholarly works, authors, and institutions (replaced Microsoft Academic Graph).

**Coverage:** Publication counts, citation counts, h-index, research areas, associated authors per institution.

**Access:**
- **REST API** (no key needed for polite pool; email-based key for higher rate limits):
  - Base URL: `https://api.openalex.org/`
  - Example: `https://api.openalex.org/institutions?search=MIT`
  - Docs: https://docs.openalex.org/

**Format:** JSON

---

## 6. Rankings

No public API or bulk download for US News rankings (proprietary/paywalled). However, ranking-equivalent metrics can be computed from College Scorecard/IPEDS data (acceptance rate, graduation rate, median earnings, resources per student).

---

## Data Architecture Recommendation

| Data Need | Primary Source | Access Method |
|---|---|---|
| University directory (name, location, type) | College Scorecard | API or bulk CSV |
| Admissions (acceptance rate, SAT/ACT) | College Scorecard | API |
| Tuition/fees/financial aid | College Scorecard | API |
| Programs offered + degrees awarded | IPEDS Completions via Urban Institute | REST API |
| Student demographics/enrollment | IPEDS via Urban Institute | REST API |
| Faculty counts/salaries | IPEDS (bulk CSV) | CSV download |
| Post-graduation earnings by program | College Scorecard (field of study files) | Bulk CSV |
| Research output | OpenAlex | REST API |

### Key Identifiers (for joining across sources)
- **UNITID** — IPEDS institution ID (used by both IPEDS and College Scorecard)
- **OPEID** — federal financial aid ID
- **CIP codes** — for joining program-level data

### Practical Starting Point
The College Scorecard "Most Recent Institution-Level Data" CSV is a single file covering most needs. Download it, filter to degree-granting institutions, and use as the seed for the database. Enrich with IPEDS completions (program listings) and OpenAlex (research metrics) via their APIs.
