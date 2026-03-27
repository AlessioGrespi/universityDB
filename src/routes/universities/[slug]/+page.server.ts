import type { PageServerLoad } from './$types';
import {
	getUniversityBySlug,
	getUniversityIdBySlug,
	getCoursesByUniversityId,
	getUniversityCourseCount
} from '$lib/server/db/queries';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const university = await getUniversityBySlug(params.slug);

	if (!university) {
		error(404, 'University not found');
	}

	const universityId = await getUniversityIdBySlug(params.slug);
	const [courses, totalCourses] = universityId
		? await Promise.all([
				getCoursesByUniversityId(universityId, 10),
				getUniversityCourseCount(universityId)
			])
		: [[], 0];

	return {
		university,
		courses,
		totalCourses
	};
};
