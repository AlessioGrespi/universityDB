import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { ilike, or, sql, eq, count, type SQL } from 'drizzle-orm';
import { expandWithSynonyms } from '$lib/server/db/queries';

/** Build an array of ILIKE conditions for a column across all search terms. */
function ilikeAny(column: Parameters<typeof ilike>[0], terms: string[]): SQL[] {
	return terms.map((t) => ilike(column, `%${t}%`));
}

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q || q.length < 2) {
		return json({ universities: [], courses: [], subjects: [] });
	}

	// Expand query with synonyms (e.g. "drones" → ["drones", "aerial robotics"])
	const terms = await expandWithSynonyms(q);

	const [universities, courses, subjects] = await Promise.all([
		db
			.select({
				name: schema.universities.name,
				slug: schema.universities.slug,
				town: schema.universities.town,
				logoUrl: schema.universities.logoUrl
			})
			.from(schema.universities)
			.where(or(...ilikeAny(schema.universities.name, terms)))
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
					...ilikeAny(schema.courses.title, terms),
					...ilikeAny(schema.courses.summary, terms),
					...ilikeAny(schema.subjects.name, terms)
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
			.where(or(...ilikeAny(schema.subjects.name, terms)))
			.groupBy(schema.subjects.id, schema.subjects.name, schema.subjects.slug)
			.orderBy(sql`count(${schema.courseSubjects.courseId}) DESC`)
			.limit(5)
	]);

	return json({ universities, courses, subjects });
};
