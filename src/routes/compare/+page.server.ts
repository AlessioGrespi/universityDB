import { getCoursesBySlugs } from '$lib/server/db/queries';

export const load = async ({ url }: { url: URL }) => {
	const coursesParam = url.searchParams.get('courses') || '';
	const slugs = coursesParam
		.split(',')
		.map((s: string) => s.trim())
		.filter(Boolean)
		.slice(0, 4);

	const courses = slugs.length > 0 ? await getCoursesBySlugs(slugs) : [];

	return { courses };
};
