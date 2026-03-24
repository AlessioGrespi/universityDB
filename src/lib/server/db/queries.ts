import { eq, desc, sql, count, inArray, ilike, and, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import type { University, Course, TefRating } from '$lib/types';

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapUniversity(row: typeof schema.universities.$inferSelect): University {
	return {
		slug: row.slug,
		name: row.name,
		logoUrl: row.logoUrl ?? row.imageUrl ?? '',
		bannerUrl: row.imageUrl ?? undefined,
		website: row.website ?? '',
		address: [row.addressLine1, row.addressLine2, row.addressLine3, row.town]
			.filter(Boolean)
			.join(', '),
		postcode: row.postcode ?? '',
		lat: row.latitude ?? 0,
		lng: row.longitude ?? 0,
		foundedYear: row.founded ?? 0,
		studentCount: row.studentCount ?? 0,
		groups: row.groups ?? [],
		tefRating: (row.tefRating as TefRating) ?? null,
		totalPublications: row.worksCount ?? 0,
		hIndex: row.hIndex ?? 0,
		contactEmail: row.contactEmail ?? undefined,
		contactPhone: row.contactPhone ?? undefined,
		region: row.town ?? ''
	};
}

function mapCourse(
	course: typeof schema.courses.$inferSelect,
	university: { name: string; slug: string },
	option: typeof schema.courseOptions.$inferSelect | null,
	subjectNames: string[]
): Course {
	const entryReqs = (option?.entryRequirements as Record<string, string>) ?? {};
	return {
		slug: course.slug,
		title: course.title,
		description: course.summary ?? '',
		universityName: university.name,
		universitySlug: university.slug,
		scheme: course.scheme as 'Undergraduate' | 'Postgraduate',
		subjects: subjectNames,
		qualification: option?.qualification ?? '',
		studyMode: (option?.studyMode ?? 'Full-time') as 'Full-time' | 'Part-time',
		duration: option?.duration ?? '',
		startDate: option?.startDate ?? undefined,
		campusLocation: option?.location ?? undefined,
		entryRequirements: {
			aLevels: entryReqs.aLevels ?? entryReqs.entryReq_al ?? undefined,
			ucasTariff: entryReqs.ucasTariff ?? entryReqs.ucasPoints ?? undefined
		},
		nssScore: option?.nssScore ? Number(option.nssScore) : undefined,
		averageGraduateSalary: option?.avgSalary ?? undefined
	};
}

// ─── Batch helpers ───────────────────────────────────────────────────────────

async function batchCourseDetails(courseIds: number[]) {
	if (courseIds.length === 0) return { optionsByCourse: new Map(), subjectsByCourse: new Map() };

	const [allOptions, allSubjects] = await Promise.all([
		db
			.select()
			.from(schema.courseOptions)
			.where(inArray(schema.courseOptions.courseId, courseIds)),
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
	for (const opt of allOptions) {
		if (!optionsByCourse.has(opt.courseId)) {
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

	return { optionsByCourse, subjectsByCourse };
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

export async function getFeaturedUniversities(limit = 6) {
	const rows = await db
		.select()
		.from(schema.universities)
		.orderBy(desc(schema.universities.worksCount))
		.limit(limit);

	return rows.map(mapUniversity);
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
	limit?: number;
	offset?: number;
}

export async function searchCourses(params: CourseSearchParams) {
	const { q, university, subject, qualification, studyMode, scheme, limit = 50, offset = 0 } = params;

	// Build WHERE conditions
	const conditions: SQL[] = [];
	if (q) {
		conditions.push(
			sql`(${ilike(schema.courses.title, `%${q}%`)} OR ${ilike(schema.universities.name, `%${q}%`)})`
		);
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
		const optConditions: SQL[] = [
			sql`${schema.courseOptions.courseId} = ${schema.courses.id}`
		];
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
			.orderBy(schema.courses.title)
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
	const [subjects, qualifications] = await Promise.all([
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
			.orderBy(schema.courseOptions.qualification)
	]);

	return {
		subjects: subjects.map((s) => ({ name: s.name, slug: s.slug, courseCount: s.courseCount })),
		qualifications: qualifications
			.map((q) => q.qualification)
			.filter((q): q is string => q !== null)
	};
}

export interface UniversitySearchParams {
	q?: string;
	tef?: string;
	group?: string;
	region?: string;
}

export async function searchUniversities(params: UniversitySearchParams) {
	const { q, tef, group, region } = params;
	const conditions: SQL[] = [];

	if (q) {
		conditions.push(ilike(schema.universities.name, `%${q}%`));
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

	const rows = await db
		.select()
		.from(schema.universities)
		.where(where)
		.orderBy(sql`coalesce(${schema.universities.sortName}, ${schema.universities.name})`);

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

	const { optionsByCourse, subjectsByCourse } = await batchCourseDetails([row.course.id]);

	return {
		course: mapCourse(
			row.course,
			{ name: row.universityName, slug: row.universitySlug },
			optionsByCourse.get(row.course.id) ?? null,
			subjectsByCourse.get(row.course.id) ?? []
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

export async function getStats() {
	const [[uniCount], [courseCount], [academicCount], [projectCount]] = await Promise.all([
		db.select({ value: count() }).from(schema.universities),
		db.select({ value: count() }).from(schema.courses),
		db.select({ value: count() }).from(schema.academics),
		db.select({ value: count() }).from(schema.researchProjects)
	]);

	return {
		universities: formatCount(uniCount?.value ?? 0),
		courses: formatCount(courseCount?.value ?? 0),
		academics: formatCount(academicCount?.value ?? 0),
		researchProjects: formatCount(projectCount?.value ?? 0)
	};
}

function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(0).replace(/\.0$/, '')},000+`;
	return n.toLocaleString('en-GB');
}

export async function getPopularSubjects(limit = 8) {
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
		.limit(limit);

	return rows.map((r) => ({
		name: r.name,
		slug: r.slug,
		courseCount: r.courseCount
	}));
}

export async function getUniversityIdBySlug(slug: string) {
	const [row] = await db
		.select({ id: schema.universities.id })
		.from(schema.universities)
		.where(eq(schema.universities.slug, slug))
		.limit(1);

	return row?.id ?? null;
}
