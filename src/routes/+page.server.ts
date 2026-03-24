import type { PageServerLoad } from './$types';
import { getFeaturedUniversities, getStats, getPopularSubjects } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const [featuredUniversities, stats, popularSubjects] = await Promise.all([
		getFeaturedUniversities(6),
		getStats(),
		getPopularSubjects(8)
	]);

	return {
		featuredUniversities,
		stats,
		popularSubjects
	};
};
