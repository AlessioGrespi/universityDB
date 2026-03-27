import {
	pgTable,
	serial,
	integer,
	text,
	boolean,
	numeric,
	doublePrecision,
	bigint,
	timestamp,
	jsonb,
	uniqueIndex,
	index,
	primaryKey
} from 'drizzle-orm/pg-core';

// ─── Universities ─────────────────────────────────────────────────────────────

export const universities = pgTable(
	'universities',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		sortName: text('sort_name'),
		slug: text('slug').notNull().unique(),
		institutionType: text('institution_type'), // 'university', 'college', 'conservatoire', 'specialist', 'other'
		country: text('country').notNull().default('GB'),
		website: text('website'),
		wikipediaUrl: text('wikipedia_url'),
		logoUrl: text('logo_url'),
		imageUrl: text('image_url'),
		founded: integer('founded'),
		studentCount: integer('student_count'),

		// Address
		addressLine1: text('address_line1'),
		addressLine2: text('address_line2'),
		addressLine3: text('address_line3'),
		town: text('town'),
		postcode: text('postcode'),
		latitude: doublePrecision('latitude'),
		longitude: doublePrecision('longitude'),

		// External identifiers
		ukprn: text('ukprn').unique(),
		hesaId: text('hesa_id').unique(),
		gtrId: text('gtr_id').unique(),
		rorId: text('ror_id').unique(),
		openalexId: text('openalex_id').unique(),
		wikidataId: text('wikidata_id').unique(),
		gridId: text('grid_id'),
		ucasProviderId: text('ucas_provider_id'),

		// Research metrics (OpenAlex)
		worksCount: integer('works_count'),
		citedByCount: bigint('cited_by_count', { mode: 'number' }),
		hIndex: integer('h_index'),

		// TEF rating
		tefRating: text('tef_rating'),

		// Groups
		groups: text('groups').array(),

		// Contact
		contactEmail: text('contact_email'),
		contactPhone: text('contact_phone'),

		// Country-specific overflow
		metadata: jsonb('metadata').default({}),

		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('uni_country_idx').on(t.country), index('uni_geo_idx').on(t.latitude, t.longitude)]
);

// ─── Subjects (UCAS CAH + GtR + REF UoA) ─────────────────────────────────────

export const subjects = pgTable('subjects', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	cahCode: text('cah_code'),
	parentId: integer('parent_id'),
	source: text('source') // 'ucas_cah', 'gtr', 'ref_uoa'
});

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = pgTable(
	'courses',
	{
		id: serial('id').primaryKey(),
		universityId: integer('university_id')
			.notNull()
			.references(() => universities.id),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		summary: text('summary'),
		scheme: text('scheme').notNull(), // 'Undergraduate' | 'Postgraduate'
		academicYear: text('academic_year'),

		ucasCourseId: text('ucas_course_id').unique(),

		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(t) => [
		uniqueIndex('course_uni_slug_idx').on(t.universityId, t.slug),
		index('course_uni_idx').on(t.universityId),
		index('course_scheme_idx').on(t.scheme)
	]
);

// ─── Course Options ───────────────────────────────────────────────────────────

export const courseOptions = pgTable(
	'course_options',
	{
		id: serial('id').primaryKey(),
		courseId: integer('course_id')
			.notNull()
			.references(() => courses.id, { onDelete: 'cascade' }),
		ucasOptionId: text('ucas_option_id'),

		qualification: text('qualification'),
		fullQualification: text('full_qualification'),
		studyMode: text('study_mode'),
		duration: text('duration'),
		startDate: text('start_date'),
		location: text('location'),
		postcode: text('postcode'),
		latitude: doublePrecision('latitude'),
		longitude: doublePrecision('longitude'),

		// JSONB for country-flexible entry requirements
		entryRequirements: jsonb('entry_requirements').default({}),

		nssScore: numeric('nss_score', { precision: 5, scale: 2 }),
		avgSalary: integer('avg_salary'),

		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('course_opt_course_idx').on(t.courseId)]
);

// ─── Course <-> Subject ───────────────────────────────────────────────────────

export const courseSubjects = pgTable(
	'course_subjects',
	{
		courseId: integer('course_id')
			.notNull()
			.references(() => courses.id, { onDelete: 'cascade' }),
		subjectId: integer('subject_id')
			.notNull()
			.references(() => subjects.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.courseId, t.subjectId] })]
);

// ─── Topics (OpenAlex taxonomy) ───────────────────────────────────────────────

export const topics = pgTable('topics', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	openalexId: text('openalex_id').unique(),
	subfield: text('subfield'),
	field: text('field'),
	domain: text('domain')
});

// ─── Academics ────────────────────────────────────────────────────────────────

export const academics = pgTable(
	'academics',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		firstName: text('first_name'),
		lastName: text('last_name'),

		// External identifiers
		openalexId: text('openalex_id').unique(),
		orcid: text('orcid').unique(),
		gtrId: text('gtr_id').unique(),

		// Research metrics
		worksCount: integer('works_count'),
		citedByCount: bigint('cited_by_count', { mode: 'number' }),
		hIndex: integer('h_index'),

		metadata: jsonb('metadata').default({}),

		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('academic_slug_idx').on(t.slug)]
);

// ─── Academic Affiliations ────────────────────────────────────────────────────

export const academicAffiliations = pgTable(
	'academic_affiliations',
	{
		id: serial('id').primaryKey(),
		academicId: integer('academic_id')
			.notNull()
			.references(() => academics.id, { onDelete: 'cascade' }),
		universityId: integer('university_id')
			.notNull()
			.references(() => universities.id),
		years: integer('years').array(),
		isCurrent: boolean('is_current').default(false)
	},
	(t) => [
		uniqueIndex('affil_academic_uni_idx').on(t.academicId, t.universityId),
		index('affil_uni_idx').on(t.universityId)
	]
);

// ─── Academic <-> Topic ───────────────────────────────────────────────────────

export const academicTopics = pgTable(
	'academic_topics',
	{
		academicId: integer('academic_id')
			.notNull()
			.references(() => academics.id, { onDelete: 'cascade' }),
		topicId: integer('topic_id')
			.notNull()
			.references(() => topics.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.academicId, t.topicId] })]
);

// ─── Research Projects ────────────────────────────────────────────────────────

export const researchProjects = pgTable(
	'research_projects',
	{
		id: serial('id').primaryKey(),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		abstract: text('abstract'),
		techAbstract: text('tech_abstract'),
		potentialImpact: text('potential_impact'),
		status: text('status'),
		grantCategory: text('grant_category'),
		leadFunder: text('lead_funder'),
		grantReference: text('grant_reference'),
		department: text('department'),

		startDate: timestamp('start_date', { withTimezone: true }),
		endDate: timestamp('end_date', { withTimezone: true }),

		fundingAmount: numeric('funding_amount', { precision: 15, scale: 2 }),
		fundingCurrency: text('funding_currency').default('GBP'),

		gtrId: text('gtr_id').unique(),

		metadata: jsonb('metadata').default({}),

		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('project_slug_idx').on(t.slug), index('project_funder_idx').on(t.leadFunder)]
);

// ─── Project <-> Organisation ─────────────────────────────────────────────────

export const projectOrganisations = pgTable(
	'project_organisations',
	{
		id: serial('id').primaryKey(),
		projectId: integer('project_id')
			.notNull()
			.references(() => researchProjects.id, { onDelete: 'cascade' }),
		universityId: integer('university_id').references(() => universities.id),
		gtrOrgId: text('gtr_org_id'),
		role: text('role').notNull() // 'LEAD_ORG', 'COLLAB_ORG', 'PROJECT_PARTNER'
	},
	(t) => [index('proj_org_project_idx').on(t.projectId)]
);

// ─── Project <-> Researcher ───────────────────────────────────────────────────

export const projectResearchers = pgTable(
	'project_researchers',
	{
		id: serial('id').primaryKey(),
		projectId: integer('project_id')
			.notNull()
			.references(() => researchProjects.id, { onDelete: 'cascade' }),
		academicId: integer('academic_id').references(() => academics.id),
		gtrPersonId: text('gtr_person_id'),
		role: text('role').notNull() // 'PI_PER', 'COI_PER', 'RESEARCHER_COI_PER'
	},
	(t) => [index('proj_res_project_idx').on(t.projectId)]
);

// ─── Project <-> Subject ──────────────────────────────────────────────────────

export const projectSubjects = pgTable(
	'project_subjects',
	{
		projectId: integer('project_id')
			.notNull()
			.references(() => researchProjects.id, { onDelete: 'cascade' }),
		subjectId: integer('subject_id')
			.notNull()
			.references(() => subjects.id, { onDelete: 'cascade' }),
		percentage: numeric('percentage', { precision: 5, scale: 2 })
	},
	(t) => [primaryKey({ columns: [t.projectId, t.subjectId] })]
);

// ─── TEF Metrics ──────────────────────────────────────────────────────────────

export const tefMetrics = pgTable(
	'tef_metrics',
	{
		id: serial('id').primaryKey(),
		universityId: integer('university_id')
			.notNull()
			.references(() => universities.id),
		ukprn: text('ukprn').notNull(),
		populationType: text('population_type'),
		indicatorName: text('indicator_name').notNull(),
		mode: text('mode'),
		level: text('level'),
		splitType: text('split_type'),
		splitValue: text('split_value'),
		year: text('year'),

		indicatorValue: numeric('indicator_value', { precision: 7, scale: 2 }),
		denominator: integer('denominator'),
		benchmarkValue: numeric('benchmark_value', { precision: 7, scale: 2 }),
		difference: numeric('difference', { precision: 7, scale: 2 }),
		materiallyAboveBench: text('materially_above_bench'),
		materiallyBelowBench: text('materially_below_bench'),
		inlineWithBench: text('inline_with_bench'),

		rawData: jsonb('raw_data'),

		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('tef_uni_indicator_idx').on(t.universityId, t.indicatorName)]
);

// ─── REF 2021 Results ─────────────────────────────────────────────────────────

export const refResults = pgTable(
	'ref_results',
	{
		id: serial('id').primaryKey(),
		universityId: integer('university_id')
			.notNull()
			.references(() => universities.id),
		unitOfAssessment: text('unit_of_assessment').notNull(),
		uoaNumber: integer('uoa_number'),
		profileType: text('profile_type').notNull(), // 'Overall', 'Outputs', 'Impact', 'Environment'
		staffFte: numeric('staff_fte', { precision: 8, scale: 2 }),

		pct4star: numeric('pct_4star', { precision: 5, scale: 2 }),
		pct3star: numeric('pct_3star', { precision: 5, scale: 2 }),
		pct2star: numeric('pct_2star', { precision: 5, scale: 2 }),
		pct1star: numeric('pct_1star', { precision: 5, scale: 2 }),
		pctUnclassified: numeric('pct_unclassified', { precision: 5, scale: 2 }),

		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('ref_uni_uoa_idx').on(t.universityId, t.uoaNumber)]
);

// ─── SOC Codes (Standard Occupational Classification) ────────────────────────

export const socCodes = pgTable('soc_codes', {
	id: serial('id').primaryKey(),
	code: text('code').notNull(),
	name: text('name').notNull()
});

export const courseSocCodes = pgTable(
	'course_soc_codes',
	{
		courseId: integer('course_id')
			.notNull()
			.references(() => courses.id, { onDelete: 'cascade' }),
		socCodeId: integer('soc_code_id')
			.notNull()
			.references(() => socCodes.id, { onDelete: 'cascade' }),
		weight: integer('weight')
	},
	(t) => [primaryKey({ columns: [t.courseId, t.socCodeId] })]
);

// ─── University Stats by Year ─────────────────────────────────────────────────

export const universityStatsByYear = pgTable(
	'university_stats_by_year',
	{
		id: serial('id').primaryKey(),
		universityId: integer('university_id')
			.notNull()
			.references(() => universities.id),
		year: integer('year').notNull(),
		worksCount: integer('works_count'),
		citedByCount: bigint('cited_by_count', { mode: 'number' }),
		source: text('source').default('openalex')
	},
	(t) => [uniqueIndex('uni_stats_year_idx').on(t.universityId, t.year, t.source)]
);
