import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getSubjectBySlug,
	searchCourses,
	getTopUniversitiesForSubject,
	getRelatedSubjects,
	getCourseFilterOptions
} from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ params, url }) => {
	const subject = await getSubjectBySlug(params.subject);
	if (!subject) error(404, 'Subject not found');

	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const sort = url.searchParams.get('sort') || 'relevance';
	const scheme = url.searchParams.get('scheme') || undefined;
	const qualification = url.searchParams.get('qualification') || undefined;
	const studyMode = url.searchParams.get('studyMode') || undefined;
	const limit = 50;
	const offset = (page - 1) * limit;

	const [courseResults, topUniversities, relatedSubjects, filterOptions] = await Promise.all([
		searchCourses({
			subject: params.subject,
			scheme,
			qualification,
			studyMode,
			sort,
			limit,
			offset
		}),
		getTopUniversitiesForSubject(params.subject),
		getRelatedSubjects(params.subject),
		getCourseFilterOptions()
	]);

	return {
		subject,
		courses: courseResults.courses,
		totalCourses: courseResults.total,
		topUniversities,
		relatedSubjects,
		filterOptions,
		page,
		totalPages: Math.ceil(courseResults.total / limit)
	};
};
