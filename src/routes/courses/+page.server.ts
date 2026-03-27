import type { PageServerLoad } from './$types';
import { searchCourses, getCourseFilterOptions } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') || undefined;
	const university = url.searchParams.get('university') || undefined;
	const subject = url.searchParams.get('subject') || undefined;
	const qualification = url.searchParams.get('qualification') || undefined;
	const studyMode = url.searchParams.get('studyMode') || undefined;
	const scheme = url.searchParams.get('scheme') || undefined;
	const sort = url.searchParams.get('sort') || undefined;
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = 50;

	const [{ courses, total }, filterOptions] = await Promise.all([
		searchCourses({
			q,
			university,
			subject,
			qualification,
			studyMode,
			scheme,
			sort,
			limit,
			offset: (page - 1) * limit
		}),
		getCourseFilterOptions()
	]);

	return {
		courses,
		total,
		page,
		limit,
		filters: { q, university, subject, qualification, studyMode, scheme, sort },
		filterOptions
	};
};
