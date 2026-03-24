export interface University {
	slug: string;
	name: string;
	logoUrl: string;
	bannerUrl?: string;
	website: string;
	address: string;
	postcode: string;
	lat: number;
	lng: number;
	foundedYear: number;
	studentCount: number;
	groups: string[];
	tefRating: TefRating;
	totalPublications: number;
	hIndex: number;
	contactEmail?: string;
	contactPhone?: string;
	region: string;
}

export interface Course {
	slug: string;
	title: string;
	description: string;
	universityName: string;
	universitySlug: string;
	scheme: 'Undergraduate' | 'Postgraduate';
	subjects: string[];
	qualification: string;
	studyMode: 'Full-time' | 'Part-time';
	duration: string;
	startDate?: string;
	campusLocation?: string;
	entryRequirements: {
		aLevels?: string;
		ucasTariff?: string;
	};
	nssScore?: number;
	averageGraduateSalary?: number;
}

export type TefRating = 'Gold' | 'Silver' | 'Bronze' | 'Requires Improvement' | null;
