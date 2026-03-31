import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
	const [universityRows, courseRows] = await Promise.all([
		db.select({ slug: schema.universities.slug }).from(schema.universities),
		db.select({ slug: schema.courses.slug }).from(schema.courses)
	]);

	const staticPages = [
		{ loc: '/', priority: '1.0', changefreq: 'daily' },
		{ loc: '/universities', priority: '0.9', changefreq: 'weekly' },
		{ loc: '/courses', priority: '0.9', changefreq: 'weekly' },
		{ loc: '/quiz', priority: '0.7', changefreq: 'monthly' }
	];

	const universityPages = universityRows.map((u) => ({
		loc: `/universities/${u.slug}`,
		priority: '0.8',
		changefreq: 'weekly'
	}));

	const coursePages = courseRows.map((c) => ({
		loc: `/courses/${c.slug}`,
		priority: '0.7',
		changefreq: 'weekly'
	}));

	const allPages = [...staticPages, ...universityPages, ...coursePages];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(p) => `  <url>
    <loc>${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
