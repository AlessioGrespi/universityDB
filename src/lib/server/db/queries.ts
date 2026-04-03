import { eq, desc, asc, sql, count, inArray, ilike, and, or, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import type {
	University,
	Course,
	CourseOption,
	TefRating,
	EntryRequirements,
	SocCode,
	QuizAnswers,
	QuizPriority,
	ScoredCourse
} from '$lib/types';
import { getCahPrefixesForClusters } from '$lib/data/subject-clusters';
import { regions as regionData, distanceMiles } from '$lib/data/regions';

// ─── Simple TTL cache ────────────────────────────────────────────────────────

function cached<T>(fn: () => Promise<T>, ttlMs: number): () => Promise<T> {
	let value: T | undefined;
	let expiresAt = 0;
	return async () => {
		if (Date.now() < expiresAt && value !== undefined) return value;
		value = await fn();
		expiresAt = Date.now() + ttlMs;
		return value;
	};
}

const FIVE_MINUTES = 5 * 60 * 1000;

/** In-memory synonym map, loaded once from DB. Keys are lowercase terms. */
let synonymMap: Map<string, string[]> | null = null;

async function getSynonymMap(): Promise<Map<string, string[]>> {
	if (synonymMap) return synonymMap;
	const rows = await db
		.select({ term: schema.searchSynonyms.term, expandsTo: schema.searchSynonyms.expandsTo })
		.from(schema.searchSynonyms);
	synonymMap = new Map();
	for (const { term, expandsTo } of rows) {
		const key = term.toLowerCase();
		const existing = synonymMap.get(key);
		if (existing) existing.push(expandsTo);
		else synonymMap.set(key, [expandsTo]);
	}
	return synonymMap;
}

/** Look up synonym expansions for a term. Returns the original term plus any expansions. */
export async function expandWithSynonyms(term: string): Promise<string[]> {
	const map = await getSynonymMap();
	const expansions = map.get(term.toLowerCase());
	return expansions ? [term, ...expansions] : [term];
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapUniversity(row: typeof schema.universities.$inferSelect): University {
	return {
		slug: row.slug,
		name: row.name,
		logoUrl: row.logoUrl ?? row.imageUrl ?? '',
		bannerUrl: row.imageUrl ?? undefined,
		website: row.website ?? '',
		wikipediaUrl: row.wikipediaUrl ?? undefined,
		address: [row.addressLine1, row.addressLine2, row.addressLine3, row.town]
			.filter(Boolean)
			.join(', '),
		town: row.town ?? '',
		postcode: row.postcode ?? '',
		country: row.country,
		lat: row.latitude ?? 0,
		lng: row.longitude ?? 0,
		foundedYear: row.founded ?? null,
		studentCount: row.studentCount ?? null,
		groups: row.groups ?? [],
		tefRating: (row.tefRating as TefRating) ?? null,
		worksCount: row.worksCount ?? null,
		citedByCount: row.citedByCount ?? null,
		hIndex: row.hIndex ?? null,
		contactEmail: row.contactEmail ?? undefined,
		contactPhone: row.contactPhone ?? undefined
	};
}

function mapEntryRequirements(raw: Record<string, string> | null | undefined): EntryRequirements {
	if (!raw || Object.keys(raw).length === 0) return {};
	return {
		aLevel: raw.a_level ?? raw.aLevels ?? undefined,
		ucasPoints: raw.ucas_points ?? raw.ucasTariff ?? undefined,
		scottishHigher: raw.scottish_higher ?? undefined,
		scottishAdvancedHigher: raw.scottish_advanced_higher ?? undefined,
		btec: raw.btec ?? undefined
	};
}

// UK Integrated Masters are undergraduate degrees despite the "M" prefix.
// UCAS data mislabels most of them as Postgraduate.
const INTEGRATED_MASTER_PREFIXES = [
	'MEng',
	'MChem',
	'MPhys',
	'MSci',
	'Msci',
	'MComp',
	'MMath',
	'MBiol',
	'MBiochem',
	'MBiolSci',
	'MBiomedSci',
	'MGeol',
	'MGeog',
	'MArch',
	'MNatSci',
	'MEarthSci',
	'MEarthPhys',
	'MChemPhys',
	'MEnv',
	'MEnvSci',
	'MMorse',
	'MPharmSci',
	'MPhysPhil',
	'MMet',
	'MMarBiol',
	'MInf',
	'MLang',
	'MChiro',
	'MMathStat',
	'MOptom',
	'MCompu',
	'MHist',
	'MPharm',
	'MVetPhys',
	'MZool',
	'MArts',
	'MLibArts'
];

function isIntegratedMasters(qualification: string): boolean {
	if (!qualification) return false;
	const base = qualification.replace(/\s*\(.*\)$/, '');
	return INTEGRATED_MASTER_PREFIXES.includes(base);
}

function correctScheme(
	scheme: string,
	qualification: string
): 'Undergraduate' | 'Postgraduate' | 'Undergraduate (Integrated Masters)' {
	if (scheme === 'Postgraduate' && isIntegratedMasters(qualification)) {
		return 'Undergraduate (Integrated Masters)';
	}
	return scheme as 'Undergraduate' | 'Postgraduate';
}

/** Extract a readable short qualification from full_qualification, e.g. "MSc" from "Master of Science - MSc" */
function displayQualification(qualification: string, fullQualification?: string | null): string {
	if (!fullQualification) return qualification;
	// Full qualification often ends with "- ShortForm", extract it
	const dashMatch = fullQualification.match(/- (.+)$/);
	if (dashMatch) return dashMatch[1];
	return fullQualification;
}

function mapOption(opt: typeof schema.courseOptions.$inferSelect): CourseOption {
	return {
		qualification: displayQualification(opt.qualification ?? '', opt.fullQualification),
		fullQualification: opt.fullQualification ?? undefined,
		studyMode: opt.studyMode ?? 'Full-time',
		duration: opt.duration ?? '',
		startDate: opt.startDate ?? undefined,
		campusLocation: opt.location ?? undefined,
		entryRequirements: mapEntryRequirements(opt.entryRequirements as Record<string, string> | null),
		nssScore: opt.nssScore ? Number(opt.nssScore) : undefined,
		averageGraduateSalary: opt.avgSalary ?? undefined
	};
}

function mapCourse(
	course: typeof schema.courses.$inferSelect,
	university: { name: string; slug: string },
	option: typeof schema.courseOptions.$inferSelect | null,
	subjectNames: string[],
	socCodes?: SocCode[],
	allRawOptions?: (typeof schema.courseOptions.$inferSelect)[]
): Course {
	const entryReqs = mapEntryRequirements(
		option?.entryRequirements as Record<string, string> | null
	);
	const qual = option?.qualification ?? '';
	const fullQual = option?.fullQualification ?? undefined;
	return {
		slug: course.slug,
		title: course.title,
		description: course.summary ?? '',
		universityName: university.name,
		universitySlug: university.slug,
		scheme: correctScheme(course.scheme, qual),
		subjects: subjectNames,
		qualification: displayQualification(qual, fullQual),
		fullQualification: fullQual,
		studyMode: option?.studyMode ?? 'Full-time',
		duration: option?.duration ?? '',
		startDate: option?.startDate ?? undefined,
		academicYear: course.academicYear ?? undefined,
		campusLocation: option?.location ?? undefined,
		entryRequirements: entryReqs,
		nssScore: option?.nssScore ? Number(option.nssScore) : undefined,
		averageGraduateSalary: option?.avgSalary ?? undefined,
		socCodes: socCodes ?? undefined,
		ucasCourseId: course.ucasCourseId ?? undefined,
		allOptions: allRawOptions && allRawOptions.length > 1 ? allRawOptions.map(mapOption) : undefined
	};
}

// ─── Batch helpers ───────────────────────────────────────────────────────────

async function batchCourseDetails(courseIds: number[]) {
	if (courseIds.length === 0)
		return {
			optionsByCourse: new Map(),
			allOptionsByCourse: new Map(),
			subjectsByCourse: new Map()
		};

	const [allOptions, allSubjects] = await Promise.all([
		db.select().from(schema.courseOptions).where(inArray(schema.courseOptions.courseId, courseIds)),
		db
			.select({
				courseId: schema.courseSubjects.courseId,
				subjectName: schema.subjects.name
			})
			.from(schema.courseSubjects)
			.innerJoin(schema.subjects, eq(schema.courseSubjects.subjectId, schema.subjects.id))
			.where(inArray(schema.courseSubjects.courseId, courseIds))
	]);

	const optionsByCourse = new Map<number, (typeof allOptions)[0]>();
	const allOptionsByCourse = new Map<number, typeof allOptions>();
	for (const opt of allOptions) {
		// Track all options
		if (!allOptionsByCourse.has(opt.courseId)) {
			allOptionsByCourse.set(opt.courseId, []);
		}
		allOptionsByCourse.get(opt.courseId)!.push(opt);

		// Pick primary option (prefer Full-time)
		const existing = optionsByCourse.get(opt.courseId);
		if (!existing) {
			optionsByCourse.set(opt.courseId, opt);
		} else if (opt.studyMode === 'Full-time' && existing.studyMode !== 'Full-time') {
			optionsByCourse.set(opt.courseId, opt);
		}
	}

	const subjectsByCourse = new Map<number, string[]>();
	for (const sub of allSubjects) {
		if (!subjectsByCourse.has(sub.courseId)) {
			subjectsByCourse.set(sub.courseId, []);
		}
		subjectsByCourse.get(sub.courseId)!.push(sub.subjectName);
	}

	return { optionsByCourse, allOptionsByCourse, subjectsByCourse };
}

async function batchSocCodes(courseIds: number[]): Promise<Map<number, SocCode[]>> {
	if (courseIds.length === 0) return new Map();

	const rows = await db
		.select({
			courseId: schema.courseSocCodes.courseId,
			code: schema.socCodes.code,
			name: schema.socCodes.name,
			weight: schema.courseSocCodes.weight
		})
		.from(schema.courseSocCodes)
		.innerJoin(schema.socCodes, eq(schema.courseSocCodes.socCodeId, schema.socCodes.id))
		.where(inArray(schema.courseSocCodes.courseId, courseIds))
		.orderBy(desc(schema.courseSocCodes.weight));

	const byCourse = new Map<number, SocCode[]>();
	for (const row of rows) {
		if (!byCourse.has(row.courseId)) {
			byCourse.set(row.courseId, []);
		}
		byCourse.get(row.courseId)!.push({
			code: row.code,
			name: row.name,
			weight: row.weight ?? 0
		});
	}

	return byCourse;
}

// ─── Query Functions ─────────────────────────────────────────────────────────

export async function getUniversities(limit?: number) {
	const query = db
		.select()
		.from(schema.universities)
		.orderBy(sql`coalesce(${schema.universities.sortName}, ${schema.universities.name})`);

	const rows = limit ? await query.limit(limit) : await query;
	return rows.map(mapUniversity);
}

export async function getUniversityBySlug(slug: string) {
	const [row] = await db
		.select()
		.from(schema.universities)
		.where(eq(schema.universities.slug, slug))
		.limit(1);

	return row ? mapUniversity(row) : null;
}

const _getFeaturedUniversities = cached(async () => {
	const rows = await db
		.select()
		.from(schema.universities)
		.where(sql`${schema.universities.studentCount} IS NOT NULL`)
		.orderBy(desc(schema.universities.studentCount))
		.limit(6);

	return rows.map(mapUniversity);
}, FIVE_MINUTES);

export async function getFeaturedUniversities(_limit = 6) {
	return _getFeaturedUniversities();
}

export async function getCourses(limit = 100) {
	const courseRows = await db
		.select({
			course: schema.courses,
			universityName: schema.universities.name,
			universitySlug: schema.universities.slug
		})
		.from(schema.courses)
		.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
		.orderBy(schema.courses.title)
		.limit(limit);

	const courseIds = courseRows.map((r) => r.course.id);
	const { optionsByCourse, subjectsByCourse } = await batchCourseDetails(courseIds);

	return courseRows.map((row) =>
		mapCourse(
			row.course,
			{ name: row.universityName, slug: row.universitySlug },
			optionsByCourse.get(row.course.id) ?? null,
			subjectsByCourse.get(row.course.id) ?? []
		)
	);
}

export interface CourseSearchParams {
	q?: string;
	university?: string;
	subject?: string;
	qualification?: string;
	studyMode?: string;
	scheme?: string;
	sort?: string;
	limit?: number;
	offset?: number;
}

export async function searchCourses(params: CourseSearchParams) {
	const {
		q,
		university,
		subject,
		qualification,
		studyMode,
		scheme,
		sort,
		limit = 50,
		offset = 0
	} = params;

	// Build WHERE conditions
	const conditions: SQL[] = [];
	if (q) {
		// Split query into words so "robotics loughborough" matches
		// courses with "robotics" in title AND "loughborough" in university name
		const words = q.trim().split(/\s+/).filter(Boolean);

		// Expand each word with synonyms (e.g. "drones" → ["drones", "aerial robotics"])
		const expandedWords = await Promise.all(words.map((w) => expandWithSynonyms(w)));

		for (const terms of expandedWords) {
			// Each word (+ its synonyms) must match in title, summary, or university name
			const wordConditions = terms.flatMap((t) => [
				ilike(schema.courses.title, `%${t}%`),
				ilike(schema.courses.summary, `%${t}%`),
				ilike(schema.universities.name, `%${t}%`)
			]);
			conditions.push(sql`(${or(...wordConditions)})`);
		}
	}
	if (university) conditions.push(eq(schema.universities.slug, university));
	if (scheme) conditions.push(eq(schema.courses.scheme, scheme));

	// Subject filter needs a subquery to avoid joining in the main query
	if (subject) {
		conditions.push(
			sql`${schema.courses.id} IN (
				SELECT ${schema.courseSubjects.courseId} FROM ${schema.courseSubjects}
				INNER JOIN ${schema.subjects} ON ${schema.courseSubjects.subjectId} = ${schema.subjects.id}
				WHERE ${eq(schema.subjects.slug, subject)}
			)`
		);
	}

	// Qualification + studyMode filter via subquery on courseOptions
	if (qualification || studyMode) {
		const optConditions: SQL[] = [sql`${schema.courseOptions.courseId} = ${schema.courses.id}`];
		if (qualification) optConditions.push(eq(schema.courseOptions.qualification, qualification));
		if (studyMode) optConditions.push(eq(schema.courseOptions.studyMode, studyMode));

		conditions.push(
			sql`EXISTS (
				SELECT 1 FROM ${schema.courseOptions}
				WHERE ${and(...optConditions)}
			)`
		);
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const courseOrder =
		sort === 'university' ? asc(schema.universities.name) : asc(schema.courses.title);

	const [courseRows, [{ total }]] = await Promise.all([
		db
			.select({
				course: schema.courses,
				universityName: schema.universities.name,
				universitySlug: schema.universities.slug
			})
			.from(schema.courses)
			.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
			.where(where)
			.orderBy(courseOrder)
			.limit(limit)
			.offset(offset),
		db
			.select({ total: count() })
			.from(schema.courses)
			.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
			.where(where)
	]);

	const courseIds = courseRows.map((r) => r.course.id);
	const { optionsByCourse, subjectsByCourse } = await batchCourseDetails(courseIds);

	const courses = courseRows.map((row) =>
		mapCourse(
			row.course,
			{ name: row.universityName, slug: row.universitySlug },
			optionsByCourse.get(row.course.id) ?? null,
			subjectsByCourse.get(row.course.id) ?? []
		)
	);

	return { courses, total };
}

export async function getCourseFilterOptions() {
	const [subjects, qualifications, studyModes] = await Promise.all([
		db
			.select({
				name: schema.subjects.name,
				slug: schema.subjects.slug,
				courseCount: count(schema.courseSubjects.courseId)
			})
			.from(schema.subjects)
			.innerJoin(schema.courseSubjects, eq(schema.subjects.id, schema.courseSubjects.subjectId))
			.groupBy(schema.subjects.id, schema.subjects.name, schema.subjects.slug)
			.orderBy(schema.subjects.name),
		db
			.selectDistinct({ qualification: schema.courseOptions.qualification })
			.from(schema.courseOptions)
			.where(sql`${schema.courseOptions.qualification} IS NOT NULL`)
			.orderBy(schema.courseOptions.qualification),
		db
			.selectDistinct({ studyMode: schema.courseOptions.studyMode })
			.from(schema.courseOptions)
			.where(sql`${schema.courseOptions.studyMode} IS NOT NULL`)
			.orderBy(schema.courseOptions.studyMode)
	]);

	return {
		subjects: subjects.map((s) => ({ name: s.name, slug: s.slug, courseCount: s.courseCount })),
		qualifications: qualifications
			.map((q) => q.qualification)
			.filter((q): q is string => q !== null),
		studyModes: studyModes.map((s) => s.studyMode).filter((s): s is string => s !== null)
	};
}

export interface UniversitySearchParams {
	q?: string;
	tef?: string;
	group?: string;
	region?: string;
	sort?: string;
	type?: string;
}

export async function searchUniversities(params: UniversitySearchParams) {
	const { q, tef, group, region, sort, type } = params;
	const conditions: SQL[] = [];

	if (q) {
		conditions.push(ilike(schema.universities.name, `%${q}%`));
	}
	if (type) {
		conditions.push(eq(schema.universities.institutionType, type));
	}
	if (tef) {
		conditions.push(eq(schema.universities.tefRating, tef));
	}
	if (group) {
		conditions.push(sql`${group} = ANY(${schema.universities.groups})`);
	}
	if (region) {
		conditions.push(eq(schema.universities.town, region));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	function getOrderBy(s: string | undefined) {
		switch (s) {
			case 'students':
				return desc(schema.universities.studentCount);
			case 'founded':
				return asc(schema.universities.founded);
			case 'research':
				return desc(schema.universities.citedByCount);
			default:
				return sql`coalesce(${schema.universities.sortName}, ${schema.universities.name})`;
		}
	}

	const rows = await db.select().from(schema.universities).where(where).orderBy(getOrderBy(sort));

	return rows.map(mapUniversity);
}

export async function getUniversityFilterOptions() {
	const regions = await db
		.selectDistinct({ region: schema.universities.town })
		.from(schema.universities)
		.where(sql`${schema.universities.town} IS NOT NULL`)
		.orderBy(schema.universities.town);

	return {
		regions: regions.map((r) => r.region).filter((r): r is string => r !== null)
	};
}

export async function getCoursesByUniversityId(universityId: number, limit = 50) {
	const courseRows = await db
		.select({
			course: schema.courses,
			universityName: schema.universities.name,
			universitySlug: schema.universities.slug
		})
		.from(schema.courses)
		.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
		.where(eq(schema.courses.universityId, universityId))
		.orderBy(schema.courses.title)
		.limit(limit);

	const courseIds = courseRows.map((r) => r.course.id);
	const { optionsByCourse, subjectsByCourse } = await batchCourseDetails(courseIds);

	return courseRows.map((row) =>
		mapCourse(
			row.course,
			{ name: row.universityName, slug: row.universitySlug },
			optionsByCourse.get(row.course.id) ?? null,
			subjectsByCourse.get(row.course.id) ?? []
		)
	);
}

export async function getCourseBySlug(slug: string) {
	const [row] = await db
		.select({
			course: schema.courses,
			universityName: schema.universities.name,
			universitySlug: schema.universities.slug
		})
		.from(schema.courses)
		.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
		.where(eq(schema.courses.slug, slug))
		.limit(1);

	if (!row) return null;

	const [{ optionsByCourse, allOptionsByCourse, subjectsByCourse }, socCodeMap] = await Promise.all(
		[batchCourseDetails([row.course.id]), batchSocCodes([row.course.id])]
	);

	return {
		course: mapCourse(
			row.course,
			{ name: row.universityName, slug: row.universitySlug },
			optionsByCourse.get(row.course.id) ?? null,
			subjectsByCourse.get(row.course.id) ?? [],
			socCodeMap.get(row.course.id),
			allOptionsByCourse.get(row.course.id)
		),
		universityId: row.course.universityId,
		courseId: row.course.id,
		subjectIds: await getSubjectIdsForCourse(row.course.id)
	};
}

async function getSubjectIdsForCourse(courseId: number) {
	const rows = await db
		.select({ subjectId: schema.courseSubjects.subjectId })
		.from(schema.courseSubjects)
		.where(eq(schema.courseSubjects.courseId, courseId));

	return rows.map((r) => r.subjectId);
}

export async function getRelatedCourses(
	courseId: number,
	universityId: number,
	subjectIds: number[],
	limit = 3
) {
	// Get courses from the same university (excluding the current course)
	const sameUniRows = await db
		.select({
			course: schema.courses,
			universityName: schema.universities.name,
			universitySlug: schema.universities.slug
		})
		.from(schema.courses)
		.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
		.where(eq(schema.courses.universityId, universityId))
		.limit(limit + 1);

	let relatedRows = sameUniRows.filter((r) => r.course.id !== courseId);

	// If we need more, get courses with shared subjects
	if (relatedRows.length < limit && subjectIds.length > 0) {
		const sharedSubjectCourseIds = await db
			.select({ courseId: schema.courseSubjects.courseId })
			.from(schema.courseSubjects)
			.where(inArray(schema.courseSubjects.subjectId, subjectIds));

		const candidateIds = [
			...new Set(
				sharedSubjectCourseIds
					.map((r) => r.courseId)
					.filter((id) => id !== courseId && !relatedRows.some((r) => r.course.id === id))
			)
		].slice(0, limit - relatedRows.length);

		if (candidateIds.length > 0) {
			const extraRows = await db
				.select({
					course: schema.courses,
					universityName: schema.universities.name,
					universitySlug: schema.universities.slug
				})
				.from(schema.courses)
				.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
				.where(inArray(schema.courses.id, candidateIds))
				.limit(limit - relatedRows.length);

			relatedRows = [...relatedRows, ...extraRows];
		}
	}

	relatedRows = relatedRows.slice(0, limit);

	const courseIds = relatedRows.map((r) => r.course.id);
	const { optionsByCourse, subjectsByCourse } = await batchCourseDetails(courseIds);

	return relatedRows.map((row) =>
		mapCourse(
			row.course,
			{ name: row.universityName, slug: row.universitySlug },
			optionsByCourse.get(row.course.id) ?? null,
			subjectsByCourse.get(row.course.id) ?? []
		)
	);
}

export const getStats = cached(async () => {
	const [
		[uniCount],
		[totalInstitutions],
		[courseCount],
		[academicCount],
		[projectCount],
		[subjectCount]
	] = await Promise.all([
		db
			.select({ value: count() })
			.from(schema.universities)
			.where(eq(schema.universities.institutionType, 'university')),
		db.select({ value: count() }).from(schema.universities),
		db.select({ value: count() }).from(schema.courses),
		db.select({ value: count() }).from(schema.academics),
		db.select({ value: count() }).from(schema.researchProjects),
		db.select({ value: count() }).from(schema.subjects)
	]);

	return {
		universities: formatCount(uniCount?.value ?? 0),
		institutions: formatCount(totalInstitutions?.value ?? 0),
		courses: formatCount(courseCount?.value ?? 0),
		academics: formatCount(academicCount?.value ?? 0),
		researchProjects: formatCount(projectCount?.value ?? 0),
		subjects: formatCount(subjectCount?.value ?? 0)
	};
}, FIVE_MINUTES);

function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
	if (n >= 1_000) return `${Math.floor(n / 1_000)}k+`;
	return n.toLocaleString('en-GB');
}

export async function getSubjectBySlug(slug: string) {
	const rows = await db
		.select({
			id: schema.subjects.id,
			name: schema.subjects.name,
			slug: schema.subjects.slug,
			courseCount: count(schema.courseSubjects.courseId)
		})
		.from(schema.subjects)
		.leftJoin(schema.courseSubjects, eq(schema.subjects.id, schema.courseSubjects.subjectId))
		.where(eq(schema.subjects.slug, slug))
		.groupBy(schema.subjects.id, schema.subjects.name, schema.subjects.slug);

	if (rows.length === 0) return null;
	return rows[0];
}

export async function getAllSubjectsWithCounts() {
	const rows = await db
		.select({
			name: schema.subjects.name,
			slug: schema.subjects.slug,
			courseCount: count(schema.courseSubjects.courseId)
		})
		.from(schema.subjects)
		.innerJoin(schema.courseSubjects, eq(schema.subjects.id, schema.courseSubjects.subjectId))
		.groupBy(schema.subjects.id, schema.subjects.name, schema.subjects.slug)
		.orderBy(asc(schema.subjects.name));

	return rows;
}

export async function getTopUniversitiesForSubject(subjectSlug: string, limit = 6) {
	const rows = await db
		.select({
			name: schema.universities.name,
			slug: schema.universities.slug,
			town: schema.universities.town,
			tefRating: schema.universities.tefRating,
			courseCount: count(schema.courses.id)
		})
		.from(schema.universities)
		.innerJoin(schema.courses, eq(schema.universities.id, schema.courses.universityId))
		.innerJoin(schema.courseSubjects, eq(schema.courses.id, schema.courseSubjects.courseId))
		.innerJoin(schema.subjects, eq(schema.courseSubjects.subjectId, schema.subjects.id))
		.where(eq(schema.subjects.slug, subjectSlug))
		.groupBy(
			schema.universities.id,
			schema.universities.name,
			schema.universities.slug,
			schema.universities.town,
			schema.universities.tefRating
		)
		.orderBy(desc(count(schema.courses.id)))
		.limit(limit);

	return rows;
}

export async function getRelatedSubjects(subjectSlug: string, limit = 8) {
	// Find subjects that share courses with the given subject
	const rows = await db.execute<{
		name: string;
		slug: string;
		course_count: number;
	}>(sql`
		SELECT s2.name, s2.slug, COUNT(DISTINCT cs2.course_id)::int AS course_count
		FROM subjects s1
		INNER JOIN course_subjects cs1 ON s1.id = cs1.subject_id
		INNER JOIN course_subjects cs2 ON cs1.course_id = cs2.course_id AND cs2.subject_id != s1.id
		INNER JOIN subjects s2 ON cs2.subject_id = s2.id
		WHERE s1.slug = ${subjectSlug}
		GROUP BY s2.id, s2.name, s2.slug
		ORDER BY course_count DESC
		LIMIT ${limit}
	`);

	return [...rows] as Array<{ name: string; slug: string; course_count: number }>;
}

const _getPopularSubjects = cached(async () => {
	const rows = await db
		.select({
			name: schema.subjects.name,
			slug: schema.subjects.slug,
			courseCount: count(schema.courseSubjects.courseId)
		})
		.from(schema.subjects)
		.innerJoin(schema.courseSubjects, eq(schema.subjects.id, schema.courseSubjects.subjectId))
		.groupBy(schema.subjects.id, schema.subjects.name, schema.subjects.slug)
		.orderBy(desc(count(schema.courseSubjects.courseId)))
		.limit(8);

	return rows.map((r) => ({
		name: r.name,
		slug: r.slug,
		courseCount: r.courseCount
	}));
}, FIVE_MINUTES);

export async function getPopularSubjects(_limit = 8) {
	return _getPopularSubjects();
}

export async function getCoursesBySlugs(slugs: string[]) {
	if (slugs.length === 0) return [];

	const courseRows = await db
		.select({
			course: schema.courses,
			universityName: schema.universities.name,
			universitySlug: schema.universities.slug,
			tefRating: schema.universities.tefRating
		})
		.from(schema.courses)
		.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
		.where(inArray(schema.courses.slug, slugs));

	const courseIds = courseRows.map((r) => r.course.id);
	const { optionsByCourse, subjectsByCourse } = await batchCourseDetails(courseIds);

	const courses = courseRows.map((row) => ({
		...mapCourse(
			row.course,
			{ name: row.universityName, slug: row.universitySlug },
			optionsByCourse.get(row.course.id) ?? null,
			subjectsByCourse.get(row.course.id) ?? []
		),
		tefRating: row.tefRating as string | null
	}));

	// Preserve the order of the input slugs
	return slugs
		.map((slug) => courses.find((c) => c.slug === slug))
		.filter((c): c is (typeof courses)[0] => c !== undefined);
}

export async function getUniversityIdBySlug(slug: string) {
	const [row] = await db
		.select({ id: schema.universities.id })
		.from(schema.universities)
		.where(eq(schema.universities.slug, slug))
		.limit(1);

	return row?.id ?? null;
}

export async function getUniversityCourseCount(universityId: number) {
	const [row] = await db
		.select({ value: count() })
		.from(schema.courses)
		.where(eq(schema.courses.universityId, universityId));

	return row?.value ?? 0;
}

// ─── Quiz Scoring Engine ────────────────────────────────────────────────────

interface RawQuizRow {
	course: typeof schema.courses.$inferSelect;
	option: typeof schema.courseOptions.$inferSelect;
	universityName: string;
	universitySlug: string;
	universityTown: string | null;
	universityLat: number | null;
	universityLng: number | null;
	universityTefRating: string | null;
	universityGroups: string[] | null;
	universityHIndex: number | null;
}

function parseUcasPoints(raw: Record<string, string> | null | undefined): number | null {
	if (!raw) return null;
	const pts = raw.ucas_points ?? raw.ucasTariff;
	if (!pts) return null;
	const num = parseInt(pts, 10);
	return isNaN(num) ? null : num;
}

export async function getQuizResults(answers: QuizAnswers): Promise<ScoredCourse[]> {
	// Phase 1: Build filter conditions
	const conditions: SQL[] = [];

	// Scheme filter — include integrated masters for UG
	if (answers.scheme === 'Undergraduate') {
		conditions.push(
			sql`(${schema.courses.scheme} = 'Undergraduate' OR ${schema.courses.scheme} = 'Postgraduate')`
		);
	} else if (answers.scheme === 'Postgraduate') {
		conditions.push(eq(schema.courses.scheme, 'Postgraduate'));
	}

	// Subject cluster filter via CAH codes
	if (answers.subjectClusters.length > 0) {
		const cahPrefixes = getCahPrefixesForClusters(answers.subjectClusters);
		if (cahPrefixes.length > 0) {
			const likeConditions = cahPrefixes.map(
				(p) => sql`${schema.subjects.cahCode} LIKE ${p + '%'}`
			);
			conditions.push(
				sql`${schema.courses.id} IN (
					SELECT ${schema.courseSubjects.courseId} FROM ${schema.courseSubjects}
					INNER JOIN ${schema.subjects} ON ${schema.courseSubjects.subjectId} = ${schema.subjects.id}
					WHERE (${sql.join(likeConditions, sql` OR `)})
				)`
			);
		}
	}

	// Study mode filter
	if (answers.studyMode) {
		conditions.push(eq(schema.courseOptions.studyMode, answers.studyMode));
	}

	// Region filter via bounding boxes
	if (answers.regions.length > 0) {
		const selectedRegions = regionData.filter((r) => answers.regions.includes(r.id));
		if (selectedRegions.length > 0) {
			const regionConditions = selectedRegions.map((r) => {
				const [south, west, north, east] = r.bounds;
				return sql`(${schema.universities.latitude} BETWEEN ${south} AND ${north} AND ${schema.universities.longitude} BETWEEN ${west} AND ${east})`;
			});
			conditions.push(sql`(${sql.join(regionConditions, sql` OR `)})`);
		}
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	// Fetch candidate courses with their primary option and university data
	const rows: RawQuizRow[] = await db
		.select({
			course: schema.courses,
			option: schema.courseOptions,
			universityName: schema.universities.name,
			universitySlug: schema.universities.slug,
			universityTown: schema.universities.town,
			universityLat: schema.universities.latitude,
			universityLng: schema.universities.longitude,
			universityTefRating: schema.universities.tefRating,
			universityGroups: schema.universities.groups,
			universityHIndex: schema.universities.hIndex
		})
		.from(schema.courses)
		.innerJoin(schema.courseOptions, eq(schema.courses.id, schema.courseOptions.courseId))
		.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
		.where(where)
		.limit(2000);

	// For UG scheme, fix integrated masters: keep only if qualification is integrated
	let filtered = rows;
	if (answers.scheme === 'Undergraduate') {
		filtered = rows.filter(
			(r) =>
				r.course.scheme === 'Undergraduate' ||
				(r.course.scheme === 'Postgraduate' && isIntegratedMasters(r.option.qualification ?? ''))
		);
	}

	// Deduplicate: keep one option per course (prefer Full-time)
	const courseMap = new Map<number, RawQuizRow>();
	for (const row of filtered) {
		const existing = courseMap.get(row.course.id);
		if (!existing) {
			courseMap.set(row.course.id, row);
		} else if (row.option.studyMode === 'Full-time' && existing.option.studyMode !== 'Full-time') {
			courseMap.set(row.course.id, row);
		}
	}

	const candidates = [...courseMap.values()];

	// Entry requirements filter (generous: allow up to +16 stretch)
	let eligibleCandidates = candidates;
	if (answers.ucasPoints !== null) {
		eligibleCandidates = candidates.filter((r) => {
			const reqPoints = parseUcasPoints(
				r.option.entryRequirements as Record<string, string> | null
			);
			if (reqPoints === null) return true; // no requirement = include
			return answers.ucasPoints! + 16 >= reqPoints; // allow stretch
		});
		// Only fall back if zero results (not just < 5) to avoid
		// recommending courses far below the user's level
		if (eligibleCandidates.length === 0) eligibleCandidates = candidates;
	}

	// Phase 2: Score and rank
	// Collect stats for normalisation
	const salaries = eligibleCandidates
		.map((r) => r.option.avgSalary)
		.filter((s): s is number => s !== null);
	const minSalary = Math.min(...(salaries.length ? salaries : [0]));
	const maxSalary = Math.max(...(salaries.length ? salaries : [1]));
	const salaryRange = maxSalary - minSalary || 1;

	const hIndexes = eligibleCandidates
		.map((r) => r.universityHIndex)
		.filter((h): h is number => h !== null);
	const minH = Math.min(...(hIndexes.length ? hIndexes : [0]));
	const maxH = Math.max(...(hIndexes.length ? hIndexes : [1]));
	const hRange = maxH - minH || 1;

	// Priority weights
	const weights: Record<QuizPriority, number> = {
		satisfaction: 0,
		salary: 0,
		research: 0,
		teaching: 0,
		prestige: 0,
		location: 0
	};
	const priorityWeights = [0.5, 0.3, 0.2];
	for (let i = 0; i < answers.priorities.length && i < 3; i++) {
		weights[answers.priorities[i]] = priorityWeights[i];
	}

	// Region center for location scoring
	let regionCenter: { lat: number; lng: number } | null = null;
	if (answers.regions.length > 0) {
		const selectedRegions = regionData.filter((r) => answers.regions.includes(r.id));
		if (selectedRegions.length > 0) {
			regionCenter = {
				lat: selectedRegions.reduce((s, r) => s + r.lat, 0) / selectedRegions.length,
				lng: selectedRegions.reduce((s, r) => s + r.lng, 0) / selectedRegions.length
			};
		}
	}

	// Get subject names for all courses
	const courseIds = eligibleCandidates.map((r) => r.course.id);
	const subjectRows =
		courseIds.length > 0
			? await db
					.select({
						courseId: schema.courseSubjects.courseId,
						subjectName: schema.subjects.name
					})
					.from(schema.courseSubjects)
					.innerJoin(schema.subjects, eq(schema.courseSubjects.subjectId, schema.subjects.id))
					.where(inArray(schema.courseSubjects.courseId, courseIds))
			: [];
	const subjectsByCourse = new Map<number, string[]>();
	for (const row of subjectRows) {
		if (!subjectsByCourse.has(row.courseId)) subjectsByCourse.set(row.courseId, []);
		subjectsByCourse.get(row.courseId)!.push(row.subjectName);
	}

	// Score each candidate
	const scored: ScoredCourse[] = eligibleCandidates.map((r) => {
		// Dimension scores (0-1)
		const nss = r.option.nssScore ? Number(r.option.nssScore) / 100 : 0.5;
		const salary = r.option.avgSalary ? (r.option.avgSalary - minSalary) / salaryRange : 0.3;
		const research = r.universityHIndex ? (r.universityHIndex - minH) / hRange : 0.3;

		let teaching = 0.2;
		if (r.universityTefRating === 'Gold') teaching = 1.0;
		else if (r.universityTefRating === 'Silver') teaching = 0.7;
		else if (r.universityTefRating === 'Bronze') teaching = 0.4;

		let prestige = 0.3;
		const groups = r.universityGroups ?? [];
		if (groups.includes('Russell Group')) prestige = 1.0;
		else if (groups.length > 0) prestige = 0.6;

		let location = 0.5;
		if (regionCenter && r.universityLat && r.universityLng) {
			const dist = distanceMiles(
				regionCenter.lat,
				regionCenter.lng,
				r.universityLat,
				r.universityLng
			);
			if (dist <= 30) location = 1.0;
			else if (dist >= 200) location = 0.0;
			else location = 1.0 - (dist - 30) / 170;
		}

		const dimensionScores: Record<QuizPriority, number> = {
			satisfaction: nss,
			salary,
			research,
			teaching,
			prestige,
			location
		};

		let score = 0;
		for (const priority of Object.keys(weights) as QuizPriority[]) {
			score += weights[priority] * dimensionScores[priority];
		}
		// Normalise to 0-100
		const matchScore = Math.round(Math.min(100, Math.max(0, score * 100)));

		// Eligibility
		let eligibility: ScoredCourse['eligibility'] = null;
		if (answers.ucasPoints !== null) {
			const reqPoints = parseUcasPoints(
				r.option.entryRequirements as Record<string, string> | null
			);
			if (reqPoints !== null) {
				if (answers.ucasPoints >= reqPoints) eligibility = 'likely';
				else if (answers.ucasPoints >= reqPoints - 16) eligibility = 'stretch';
				else eligibility = 'ambitious';
			}
		}

		const entryReqs = mapEntryRequirements(
			r.option.entryRequirements as Record<string, string> | null
		);
		const qual = r.option.qualification ?? '';
		const fullQual = r.option.fullQualification ?? undefined;

		return {
			slug: r.course.slug,
			title: r.course.title,
			description: r.course.summary ?? '',
			universityName: r.universityName,
			universitySlug: r.universitySlug,
			scheme: correctScheme(r.course.scheme, qual),
			subjects: subjectsByCourse.get(r.course.id) ?? [],
			qualification: displayQualification(qual, fullQual),
			fullQualification: fullQual,
			studyMode: r.option.studyMode ?? 'Full-time',
			duration: r.option.duration ?? '',
			startDate: r.option.startDate ?? undefined,
			academicYear: r.course.academicYear ?? undefined,
			campusLocation: r.option.location ?? undefined,
			entryRequirements: entryReqs,
			nssScore: r.option.nssScore ? Number(r.option.nssScore) : undefined,
			averageGraduateSalary: r.option.avgSalary ?? undefined,
			matchScore,
			eligibility,
			universityTefRating: (r.universityTefRating as TefRating) ?? null,
			universityGroups: r.universityGroups ?? [],
			universityTown: r.universityTown ?? '',
			universityLat: r.universityLat ?? 0,
			universityLng: r.universityLng ?? 0
		};
	});

	// Sort by match score descending
	scored.sort((a, b) => b.matchScore - a.matchScore);

	// Cap results per university to avoid e.g. 8 Imperial CS variants flooding the list
	const MAX_PER_UNI = 3;
	const uniCounts = new Map<string, number>();
	const capped: ScoredCourse[] = [];
	for (const course of scored) {
		const count = uniCounts.get(course.universitySlug) ?? 0;
		if (count >= MAX_PER_UNI) continue;
		uniCounts.set(course.universitySlug, count + 1);
		capped.push(course);
		if (capped.length >= 20) break;
	}

	return capped;
}

export async function saveQuizSubmission(
	email: string | null,
	answers: QuizAnswers,
	topCourses: string[]
): Promise<string> {
	const shareToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
	await db.insert(schema.quizSubmissions).values({
		email,
		answers,
		topCourses,
		shareToken
	});
	return shareToken;
}
