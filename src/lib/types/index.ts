export interface University {
	slug: string;
	name: string;
	logoUrl: string;
	bannerUrl?: string;
	website: string;
	wikipediaUrl?: string;
	address: string;
	town: string;
	postcode: string;
	country: string;
	lat: number;
	lng: number;
	foundedYear: number | null;
	studentCount: number | null;
	groups: string[];
	tefRating: TefRating;
	worksCount: number | null;
	citedByCount: number | null;
	hIndex: number | null;
	contactEmail?: string;
	contactPhone?: string;
}

export interface EntryRequirements {
	aLevel?: string;
	ucasPoints?: string;
	scottishHigher?: string;
	scottishAdvancedHigher?: string;
	btec?: string;
	[key: string]: string | undefined;
}

export interface SocCode {
	code: string;
	name: string;
	weight: number;
}

export interface CourseOption {
	qualification: string;
	fullQualification?: string;
	studyMode: string;
	duration: string;
	startDate?: string;
	campusLocation?: string;
	entryRequirements: EntryRequirements;
	nssScore?: number;
	averageGraduateSalary?: number;
}

export interface Course {
	slug: string;
	title: string;
	description: string;
	universityName: string;
	universitySlug: string;
	scheme: 'Undergraduate' | 'Postgraduate' | 'Undergraduate (Integrated Masters)';
	subjects: string[];
	qualification: string;
	fullQualification?: string;
	studyMode: string;
	duration: string;
	startDate?: string;
	academicYear?: string;
	campusLocation?: string;
	entryRequirements: EntryRequirements;
	nssScore?: number;
	averageGraduateSalary?: number;
	socCodes?: SocCode[];
	ucasCourseId?: string;
	/** All available study options for this course (populated on detail page) */
	allOptions?: CourseOption[];
}

export type TefRating = 'Gold' | 'Silver' | 'Bronze' | 'Requires Improvement' | null;

// ─── Quiz Types ──────────────────────────────────────────────────────────────

export type QuizScheme = 'Undergraduate' | 'Postgraduate';
export type QuizStudyMode = 'Full-time' | 'Part-time' | null;

export type QuizPriority =
	| 'satisfaction'
	| 'salary'
	| 'research'
	| 'teaching'
	| 'prestige'
	| 'location';

export interface QuizAnswers {
	scheme: QuizScheme | null;
	subjectClusters: string[];
	ucasPoints: number | null;
	degreeClass: string | null;
	priorities: QuizPriority[];
	regions: string[];
	studyMode: QuizStudyMode;
	email: string | null;
}

export interface ScoredCourse extends Course {
	matchScore: number;
	eligibility: 'likely' | 'stretch' | 'ambitious' | null;
	universityTefRating: TefRating;
	universityGroups: string[];
	universityTown: string;
	universityLat: number;
	universityLng: number;
}
