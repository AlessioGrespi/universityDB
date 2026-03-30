export interface SubjectCluster {
	id: string;
	label: string;
	description: string;
	/** UCAS CAH level-1 prefixes that map to this cluster */
	cahPrefixes: string[];
}

/**
 * Maps broad subject areas to UCAS Common Aggregation Hierarchy (CAH) codes.
 * CAH codes follow the pattern CAH01-01-01 where the first segment is the broad area.
 * See: https://www.hesa.ac.uk/support/documentation/jacs/cah
 */
export const subjectClusters: SubjectCluster[] = [
	{
		id: 'medicine-health',
		label: 'Medicine & Health',
		description: 'Medicine, nursing, dentistry, pharmacy, health sciences',
		cahPrefixes: ['CAH01', 'CAH02']
	},
	{
		id: 'science',
		label: 'Science',
		description: 'Biology, chemistry, physics, maths, geography, environmental science',
		cahPrefixes: ['CAH03', 'CAH05', 'CAH06', 'CAH07', 'CAH08', 'CAH09']
	},
	{
		id: 'engineering',
		label: 'Engineering & Technology',
		description: 'Mechanical, electrical, civil, chemical engineering',
		cahPrefixes: ['CAH10']
	},
	{
		id: 'computing',
		label: 'Computing',
		description: 'Computer science, software engineering, AI, data science, IT',
		cahPrefixes: ['CAH11']
	},
	{
		id: 'business',
		label: 'Business & Management',
		description: 'Accounting, finance, marketing, economics, management',
		cahPrefixes: ['CAH15', 'CAH17']
	},
	{
		id: 'law-social',
		label: 'Law & Social Sciences',
		description: 'Law, politics, sociology, psychology, criminology',
		cahPrefixes: ['CAH16', 'CAH18', 'CAH19', 'CAH20']
	},
	{
		id: 'arts-humanities',
		label: 'Arts & Humanities',
		description: 'English, history, philosophy, languages, art, design, music, media',
		cahPrefixes: ['CAH21', 'CAH22', 'CAH23', 'CAH24', 'CAH25', 'CAH26', 'CAH27']
	},
	{
		id: 'education',
		label: 'Education',
		description: 'Teaching, education studies, childhood studies',
		cahPrefixes: ['CAH13']
	}
];

/** Look up which cluster IDs a given CAH code belongs to */
export function getClusterForCahCode(cahCode: string): string | undefined {
	if (!cahCode) return undefined;
	for (const cluster of subjectClusters) {
		if (cluster.cahPrefixes.some((prefix) => cahCode.startsWith(prefix))) {
			return cluster.id;
		}
	}
	return undefined;
}

/** Get all CAH prefixes for the given cluster IDs */
export function getCahPrefixesForClusters(clusterIds: string[]): string[] {
	return subjectClusters.filter((c) => clusterIds.includes(c.id)).flatMap((c) => c.cahPrefixes);
}
