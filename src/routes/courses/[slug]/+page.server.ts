import type { PageServerLoad } from './$types';
import { getCourseBySlug, getRelatedCourses, getUniversityBySlug } from '$lib/server/db/queries';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const result = await getCourseBySlug(params.slug);

	if (!result) {
		error(404, 'Course not found');
	}

	const { course, universityId, courseId, subjectIds } = result;

	const [university, relatedCourses] = await Promise.all([
		getUniversityBySlug(course.universitySlug),
		getRelatedCourses(courseId, universityId, subjectIds, 3)
	]);

	return {
		course,
		university: university ?? null,
		relatedCourses
	};
};
