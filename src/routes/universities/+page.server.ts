import type { PageServerLoad } from './$types';
import { searchUniversities, getUniversityFilterOptions } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') || undefined;
	const tef = url.searchParams.get('tef') || undefined;
	const group = url.searchParams.get('group') || undefined;
	const region = url.searchParams.get('region') || undefined;
	const sort = url.searchParams.get('sort') || undefined;
	const type = url.searchParams.get('type') || undefined;

	const [universities, filterOptions] = await Promise.all([
		searchUniversities({ q, tef, group, region, sort, type }),
		getUniversityFilterOptions()
	]);

	return {
		universities,
		filters: { q, tef, group, region, sort, type },
		filterOptions
	};
};
