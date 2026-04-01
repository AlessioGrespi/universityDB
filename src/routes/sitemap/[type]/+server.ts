import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { sql, asc } from 'drizzle-orm';
import { BASE_URL } from '$lib/config';

const COURSES_PER_SITEMAP = 10_000;

interface SitemapEntry {
	loc: string;
	lastmod?: string;
	changefreq: string;
	priority: string;
}

function toXml(entries: SitemapEntry[]): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(e) => `  <url>
    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;
}

function formatDate(d: Date | null | undefined): string | undefined {
	if (!d) return undefined;
	return d.toISOString().split('T')[0];
}

export const GET: RequestHandler = async ({ params }) => {
	const { type } = params;

	let entries: SitemapEntry[];

	if (type === 'static.xml') {
		entries = [
			{ loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
			{ loc: `${BASE_URL}/universities`, changefreq: 'weekly', priority: '0.9' },
			{ loc: `${BASE_URL}/courses`, changefreq: 'weekly', priority: '0.9' },
			{ loc: `${BASE_URL}/quiz`, changefreq: 'monthly', priority: '0.7' }
		];
	} else if (type === 'universities.xml') {
		const rows = await db
			.select({
				slug: schema.universities.slug,
				updatedAt: schema.universities.updatedAt
			})
			.from(schema.universities)
			.orderBy(asc(schema.universities.slug));

		entries = rows.map((u) => ({
			loc: `${BASE_URL}/universities/${u.slug}`,
			lastmod: formatDate(u.updatedAt),
			changefreq: 'weekly',
			priority: '0.8'
		}));
	} else if (type.startsWith('courses-') && type.endsWith('.xml')) {
		const pageNum = parseInt(type.replace('courses-', '').replace('.xml', ''), 10);
		if (isNaN(pageNum) || pageNum < 1) error(404, 'Invalid sitemap page');

		const offset = (pageNum - 1) * COURSES_PER_SITEMAP;

		const rows = await db
			.select({
				slug: schema.courses.slug,
				updatedAt: schema.courses.updatedAt
			})
			.from(schema.courses)
			.orderBy(asc(schema.courses.slug))
			.limit(COURSES_PER_SITEMAP)
			.offset(offset);

		if (rows.length === 0) error(404, 'Sitemap page out of range');

		entries = rows.map((c) => ({
			loc: `${BASE_URL}/courses/${c.slug}`,
			lastmod: formatDate(c.updatedAt),
			changefreq: 'weekly',
			priority: '0.7'
		}));
	} else if (type === 'subjects.xml') {
		const rows = await db
			.select({ slug: schema.subjects.slug })
			.from(schema.subjects)
			.orderBy(asc(schema.subjects.slug));

		entries = rows.map((s) => ({
			loc: `${BASE_URL}/subjects/${s.slug}`,
			changefreq: 'weekly',
			priority: '0.8'
		}));
	} else {
		error(404, 'Unknown sitemap type');
	}

	return new Response(toXml(entries), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
