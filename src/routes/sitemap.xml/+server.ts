import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { BASE_URL } from '$lib/config';

const COURSES_PER_SITEMAP = 10_000;

export const GET: RequestHandler = async () => {
	const [{ count }] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(schema.courses);

	const courseChunks = Math.ceil(count / COURSES_PER_SITEMAP);

	const sitemaps = [
		`${BASE_URL}/sitemap/static.xml`,
		`${BASE_URL}/sitemap/universities.xml`,
		...Array.from({ length: courseChunks }, (_, i) => `${BASE_URL}/sitemap/courses-${i + 1}.xml`)
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`).join('\n')}
</sitemapindex>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
