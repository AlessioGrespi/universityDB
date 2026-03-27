# Data Requirements — Features Needing New Data

Items identified during UX review (2026-03-24) that require additional data ingestion before they can be built.

## P0 — Critical Missing Data

### 1. Tuition Fees

- **What**: Home and international fees per course/year
- **Source**: UCAS course data, individual university websites
- **Schema change**: New `course_fees` table or fields on `course_options`
  ```
  course_fees:
    id, course_option_id, fee_type ('home'|'international'|'eu'),
    amount (numeric), currency ('GBP'), academic_year, notes
  ```
- **Display**: Course card, course detail sidebar, comparison view
- **Priority**: Highest — this is the #1 data point for prospective students

### 2. University Rankings

- **What**: QS World, Times/Sunday Times, Guardian, Complete University Guide
- **Source**: Published league tables (may need manual entry or scraping)
- **Schema change**: New `university_rankings` table
  ```
  university_rankings:
    id, university_id, source ('qs_world'|'times'|'guardian'|'cug'),
    year, overall_rank, subject_rank (nullable), subject (nullable)
  ```
- **Display**: University card badge, university detail page, sort option

## P1 — Important Enrichments

### 3. Graduate Employment Rate

- **What**: % employed or in further study within 15 months
- **Source**: HESA Graduate Outcomes survey
- **Schema change**: Field on `course_options` or separate `graduate_outcomes` table
  ```
  graduate_outcomes:
    id, course_option_id, year, employment_rate, further_study_rate,
    median_salary, sample_size
  ```
- **Display**: Course card, course detail stats bar

### 4. Student Satisfaction Breakdown (NSS)

- **What**: Individual NSS question category scores (teaching, assessment, support, etc.)
- **Source**: NSS results published by Office for Students
- **Schema change**: New `nss_results` table
  ```
  nss_results:
    id, university_id, subject, year, question_category,
    score (numeric), respondents (integer)
  ```
- **Display**: University detail page, course detail page

### 5. International Student Percentage

- **What**: % of student body that are international
- **Source**: HESA student data
- **Schema change**: Field on `universities` table: `international_pct`
- **Display**: University card, university detail sidebar

### 6. Acceptance/Offer Rate

- **What**: % of applicants who receive offers
- **Source**: UCAS end-of-cycle data
- **Schema change**: Fields on `universities` or `courses`: `offer_rate`, `acceptance_rate`
- **Display**: University detail page, course detail page

### 7. Student-to-Staff Ratio

- **What**: Number of students per academic staff member
- **Source**: HESA data
- **Schema change**: Field on `universities`: `student_staff_ratio`
- **Display**: University detail sidebar, comparison view

## P2 — Nice-to-Have Enrichments

### 8. Visa Sponsorship Info

- **What**: Whether the university is a licensed Student visa sponsor
- **Source**: UK Visas & Immigration register of sponsors
- **Schema change**: Boolean on `universities`: `is_visa_sponsor`
- **Display**: University detail sidebar badge

### 9. Accommodation Costs

- **What**: Average halls/private rent costs
- **Source**: University websites, NUS/Unipol accommodation survey
- **Schema change**: New `accommodation` table or fields on `universities`
- **Display**: University detail page

### 10. Cost of Living by Area

- **What**: Estimated monthly living costs by city/town
- **Source**: Various surveys (NUS, Save the Student)
- **Schema change**: New `area_costs` table or JSONB on `universities.metadata`
- **Display**: University detail page

### 11. Application Deadlines

- **What**: UCAS deadline dates per course type
- **Source**: UCAS (mostly standard: Jan 15, Oct 15 for Oxbridge/medicine)
- **Schema change**: Field on `course_options`: `application_deadline`
- **Display**: Course detail sidebar, course card

### 12. Course Modules

- **What**: List of modules/units studied per year
- **Source**: University websites, UCAS course pages
- **Schema change**: New `course_modules` table
  ```
  course_modules:
    id, course_id, year (integer), name, description (nullable), credits (nullable), is_optional (boolean)
  ```
- **Display**: Course detail page, expandable section

## Already in DB but Not Surfaced

These tables exist in the schema but aren't shown in the UI yet:

- **REF Results** (`ref_results`) — Research quality ratings by subject
- **TEF Metrics** (`tef_metrics`) — Detailed teaching quality indicators
- **University Stats by Year** (`university_stats_by_year`) — Publication trends
- **Academics** (`academics`) — Researcher profiles
- **Research Projects** (`research_projects`) — Funded projects
- **Topics** (`topics`) — OpenAlex research taxonomy

These should be surfaced with UI work only (no new data needed).
