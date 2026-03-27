import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { ilike, or, sql, eq, count } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q || q.length < 2) {
		return json({ universities: [], courses: [], subjects: [] });
	}

	const [universities, courses, subjects] = await Promise.all([
		db
			.select({
				name: schema.universities.name,
				slug: schema.universities.slug,
				town: schema.universities.town,
				logoUrl: schema.universities.logoUrl
			})
			.from(schema.universities)
			.where(ilike(schema.universities.name, `%${q}%`))
			.orderBy(sql`coalesce(${schema.universities.sortName}, ${schema.universities.name})`)
			.limit(5),
		db
			.selectDistinct({
				title: schema.courses.title,
				slug: schema.courses.slug,
				universityName: schema.universities.name
			})
			.from(schema.courses)
			.innerJoin(schema.universities, eq(schema.courses.universityId, schema.universities.id))
			.leftJoin(schema.courseSubjects, eq(schema.courseSubjects.courseId, schema.courses.id))
			.leftJoin(schema.subjects, eq(schema.courseSubjects.subjectId, schema.subjects.id))
			.where(
				or(
					ilike(schema.courses.title, `%${q}%`),
					ilike(schema.courses.summary, `%${q}%`),
					ilike(schema.subjects.name, `%${q}%`)
				)
			)
			.orderBy(schema.courses.title)
			.limit(8),
		db
			.select({
				name: schema.subjects.name,
				slug: schema.subjects.slug,
				courseCount: count(schema.courseSubjects.courseId)
			})
			.from(schema.subjects)
			.innerJoin(schema.courseSubjects, eq(schema.subjects.id, schema.courseSubjects.subjectId))
			.where(ilike(schema.subjects.name, `%${q}%`))
			.groupBy(schema.subjects.id, schema.subjects.name, schema.subjects.slug)
			.orderBy(sql`count(${schema.courseSubjects.courseId}) DESC`)
			.limit(5)
	]);

	return json({ universities, courses, subjects });
};
