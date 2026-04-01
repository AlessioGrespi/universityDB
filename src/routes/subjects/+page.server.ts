import type { PageServerLoad } from './$types';
import { getAllSubjectsWithCounts } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const subjects = await getAllSubjectsWithCounts();
	return { subjects };
};
