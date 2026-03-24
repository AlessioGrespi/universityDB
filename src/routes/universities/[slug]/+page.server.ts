import type { PageServerLoad } from './$types';
import {
	getUniversityBySlug,
	getUniversityIdBySlug,
	getCoursesByUniversityId
} from '$lib/server/db/queries';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const university = await getUniversityBySlug(params.slug);

	if (!university) {
		error(404, 'University not found');
	}

	const universityId = await getUniversityIdBySlug(params.slug);
	const courses = universityId ? await getCoursesByUniversityId(universityId, 10) : [];

	return {
		university,
		courses
	};
};
