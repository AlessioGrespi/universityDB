# Available Data for UniversityDB

Overview of all data we have access to, organised by what you'd actually show on the site.

---

## Universities (166 UK, expanding to other countries)

Each university has:

- **Name** + alternative/display names
- **Logo** and **banner image**
- **Website URL**, **Wikipedia URL**
- **Full address** + **postcode**
- **Lat/long coordinates** (for map views)
- **Founded year**
- **Total student count**
- **Group memberships** — Russell Group, University Alliance, Million Plus, etc.
- **Contact email and phone** (from UCAS)

### Research profile (per university)

- **Total publications count** (e.g. Oxford: 576,903)
- **Total citation count** (e.g. Oxford: 59 million)
- **h-index**
- **Publications per year** (historical trend data)
- **Top research topics**
- **Associated research centres/institutes**

### Teaching quality (TEF)

- **TEF rating** — Gold / Silver / Bronze / Requires Improvement
- **Completion rates** — with benchmark comparison
- **Continuation rates** — students staying on course
- **Graduate outcomes** — employment/further study rates
- All split by: full-time / part-time / apprenticeship, undergrad / postgrad

### Research quality (REF 2021)

- **Quality profile per subject area** — % rated 4\*, 3\*, 2\*, 1\*
- **Sub-profiles**: Outputs, Impact, Environment
- **Staff submitted** (FTE) per subject
- Covers 34 subject areas across 157 institutions

---

## Courses (~50,000 for 2025 entry across 398 providers)

Each course has:

- **Title** (e.g. "Aerial Robotics")
- **Full text description** — typically 2-4 paragraphs covering content, facilities, career prospects
- **University** it belongs to
- **Scheme** — Undergraduate or Postgraduate
- **Subjects** with CAH classification codes (can be used for filtering/grouping)

### Per course option (a course can have multiple options)

- **Qualification** — BSc (Hons), MA (Hons), MSc, PgCert, etc.
- **Full qualification name** — e.g. "Master of Arts (with Honours)"
- **Study mode** — Full-time, Part-time
- **Duration** — e.g. "3 Years", "1 Year"
- **Start date**
- **Campus/location** + postcode + coordinates
- **Entry requirements**:
  - A-level grades (e.g. "BBC")
  - Scottish Higher grades (e.g. "BBBB")
  - BTEC grades (e.g. "DDM")
  - UCAS tariff points (e.g. "108/152")
- **NSS score** (student satisfaction, mainly populated for undergrad)
- **Average graduate salary** (mainly populated for undergrad)

### What's NOT available for courses

- Individual **modules/units** within a course — no centralised data source exists for this
- **Tuition fees** — not in the UCAS data
- **Acceptance rates** — not publicly available at course level

---

## Academics / Researchers (~2 million UK-affiliated)

Each academic has:

- **Name**
- **ORCID** (unique researcher ID)
- **Current and past university affiliations** (with years)
- **Total publications count**
- **Total citation count**
- **h-index**
- **Research topics/fields**
- **Publications per year** (historical trend)

---

## Research Projects (~173,000 publicly funded UK projects)

Each project has:

- **Title**
- **Abstract** (often detailed, though some are redacted)
- **Technical abstract**
- **Potential impact statement**
- **Lead funder** — EPSRC, AHRC, BBSRC, MRC, etc.
- **Grant reference number**
- **Status** — Active or Closed
- **Grant category** — Research Grant, Fellowship, Training Grant, etc.
- **Lead organisation + department**
- **Start and end dates**
- **Funding amount**
- **Principal Investigator** (linked to academics)
- **Research subjects and topics** (categorised)
- **Collaborating organisations**

---

## Supplementary / Enrichment Data

### From Wikidata

- University **founding dates**
- **Student counts**
- **Logo images**
- Linkable IDs to other databases (ROR, GeoNames)

### From OpenAlex (institutions)

- **Image/thumbnail URLs** for universities
- **Alternative names** and acronyms
- **Linked repositories** (e.g. Oxford University Research Archive)
- Cross-reference IDs: ROR, GRID, Wikidata, Wikipedia

---

## Data NOT available (would need scraping)

- **Course modules** — every university has their own module catalogue, no standard format
- **Tuition fees** — not in any centralised public dataset
- **Acceptance rates** — not published at course level
- **Student reviews** beyond NSS scores
- **Open days / events**
- **Accommodation info**
- **Specific lecturer-to-course assignments** — we know who researches where, but not who teaches what specific course
