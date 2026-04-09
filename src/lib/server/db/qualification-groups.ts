export interface QualificationGroup {
	/** Display label in the filter dropdown */
	label: string;
	/** URL-safe value used as the filter param */
	value: string;
	/**
	 * SQL ILIKE patterns matched against full_qualification.
	 * Prefer prefix patterns (no leading %) for index usage.
	 */
	patterns: string[];
	/**
	 * If set, also requires the course.scheme to match.
	 * Used for Bachelor's group which includes Scottish MA (Hons) —
	 * these have full_qualification "Master of Arts..." but are undergraduate degrees.
	 */
	schemeFilter?: 'Undergraduate' | 'Postgraduate';
}

/** Integrated master prefixes — shared with queries.ts for scheme correction logic */
export const INTEGRATED_MASTER_PREFIXES = [
	'MEng',
	'MChem',
	'MPhys',
	'MSci',
	'Msci',
	'MComp',
	'MMath',
	'MBiol',
	'MBiochem',
	'MBiolSci',
	'MBiomedSci',
	'MGeol',
	'MGeog',
	'MArch',
	'MNatSci',
	'MEarthSci',
	'MEarthPhys',
	'MChemPhys',
	'MEnv',
	'MEnvSci',
	'MMorse',
	'MPharmSci',
	'MPhysPhil',
	'MMet',
	'MMarBiol',
	'MInf',
	'MLang',
	'MChiro',
	'MMathStat',
	'MOptom',
	'MCompu',
	'MHist',
	'MPharm',
	'MVetPhys',
	'MZool',
	'MArts',
	'MLibArts'
];

export const QUALIFICATION_GROUPS: QualificationGroup[] = [
	{
		label: "Bachelor's Degrees",
		value: 'bachelors',
		schemeFilter: 'Undergraduate',
		patterns: [
			'Bachelor %',
			'BA %',
			'BA',
			'BSc %',
			'BSc',
			'BEng %',
			'BEng',
			'LLB %',
			'LLB',
			'BMus %',
			'BMus',
			'BN %',
			'BN',
			'BD %',
			'BD',
			'BOst%',
			'BFA%',
			'BMid%',
			'BEd%',
			'BDes%',
			'BArch%',
			'BAcc%',
			'BASc%',
			'BAEcon%',
			'BBA%',
			'BBL%',
			'BHSc%',
			'BIFin%',
			'BMedS%',
			'BNurs%',
			'BPT%',
			'BSocS%',
			'BSW%',
			'BTh%',
			'Bar Prof%',
			'BEngTec%',
			'BASS',
			'BPhil',
			'BP',
			// Scottish MA (Hons) — undergraduate degree at Scottish universities
			'Master of Arts (with Honours)%',
			'MA (Hons)%'
		]
	},
	{
		label: 'Medicine, Dentistry & Veterinary',
		value: 'medicine',
		patterns: [
			// Medicine
			'Bachelor of Medicine%',
			'MB ChB%',
			'MB BS%',
			'MBBS%',
			'MB BCh%',
			'BMBCh%',
			'BMBS%',
			'MB',
			// Dentistry
			'Bachelor of Dental%',
			'BDS%',
			'BChD%',
			'BDTBDT%',
			// Veterinary
			'Bachelor of Veterinary%',
			'BVSc%',
			'BVMS%',
			'BVetMed%',
			'BVMSci%',
			'BVMBVS%'
		]
	},
	{
		label: 'Integrated Masters',
		value: 'integrated-masters',
		patterns: INTEGRATED_MASTER_PREFIXES.map((p) => `${p}%`)
	},
	{
		label: "Master's (Taught)",
		value: 'masters-taught',
		patterns: [
			'Master of Science %',
			'Master of Arts %',
			'Master of Engineering%',
			'Master of Law%',
			'Master of Education%',
			'Master of Fine Art%',
			'Master of Music%',
			'Master of Nursing%',
			'Master of Public%',
			'Master of Philosophy%', // MPhil — taught at Cambridge
			'Master of%',
			'MSc',
			'MA',
			'LLM%',
			'MPhil%',
			'MEd%',
			'MMus%',
			'MLitt%',
			'MPA%',
			'MPH%',
			'MSW%',
			'MFA%',
			'MLaw%',
			'MFin%',
			'MPlan%',
			'MPerf%',
			'MBus%',
			'MOst%',
			'MPsych%',
			'MNutr%',
			'MDes',
			'MDiet%',
			'MNurs%',
			'MMid%',
			'MAcc%',
			'MSt',
			'MASt%',
			'MIM',
			'MLA',
			'MD',
			'BCL', // Oxford BCL — postgrad law degree despite B-prefix
			'MClinDent%',
			'MMedSci%',
			'MusM%',
			'MTh%',
			'MEnt%',
			'MProf%',
			'MBM%',
			'MCh%',
			'MAgr%',
			'MJur%',
			'MClinEd%',
			'MClinRes%',
			'MPP%',
			'MEM%',
			'MDA%',
			'MCD',
			'MS',
			'DM',
			'ChM%',
			'International Master%',
			'European Master%',
			'Executive Master%',
			'MSc %',
			'MA %'
		]
	},
	{
		label: "Master's (Research)",
		value: 'masters-research',
		patterns: [
			'Master of Research%',
			'Masters in Research%',
			'MRes%',
			// MPhil intentionally NOT here — it's taught at Cambridge
			'%(Res)%',
			'%(Research)%',
			'ResM%'
		]
	},
	{
		label: 'MBA',
		value: 'mba',
		patterns: ['Master of Business Administration%', 'MBA%']
	},
	{
		label: 'PhD / Doctoral',
		value: 'doctoral',
		patterns: [
			'Doctor%',
			'PhD%',
			'DPhil%',
			'DBA%',
			'EdD%',
			'EngD%',
			'DProf%',
			'DClin%',
			'DMan%',
			'DMus%',
			'DSocSc%',
			'DPsych%',
			'DVM%',
			'DVet%',
			'DAppEd%',
			'DEdPsy%',
			'DEdChPsy%',
			'DHealth%',
			'DForenPsy%',
			'DCounsP%',
			'DCounsE%',
			'DDSc%',
			'DChDent%',
			'DClinRes%',
			'DPM%',
			'DBS%',
			'DTh%',
			'EntD%',
			'Professional Doctorate%',
			'ForenPsyD%',
			'ClinPsyD%',
			'PsychD%'
		]
	},
	{
		label: 'PGCE',
		value: 'pgce',
		patterns: [
			'PGCE%',
			'Postgraduate Certificate in Education%',
			'Professional Graduate Certificate in Education%',
			'Professional Graduate Diploma in Education%'
		]
	},
	{
		label: 'Postgraduate Certificate',
		value: 'pg-cert',
		patterns: ['Postgraduate Certificate%', 'PgCert%', 'Postgraduate Advanced Cert%']
	},
	{
		label: 'Postgraduate Diploma',
		value: 'pg-dip',
		patterns: [
			'Postgraduate Diploma%',
			'PgDip%',
			'PgDipEd%',
			'Postgraduate Advanced Diploma%',
			'Advanced Postgraduate Diploma%'
		]
	},
	{
		label: 'Foundation',
		value: 'foundation',
		patterns: ['Foundation%', 'Fd%', 'FdSc%', 'FdA%', 'FdEng%', 'FdEd%']
	},
	{
		label: 'HNC / HND',
		value: 'hnc-hnd',
		patterns: ['Higher National%', 'HNC%', 'HND%']
	},
	{
		label: 'Other Certificates & Diplomas',
		value: 'cert-dip',
		patterns: [
			'Certificate%',
			'CertHE%',
			'CertEd%',
			'Diploma%',
			'DipHE%',
			'Graduate Diploma%',
			'Grad Dip%',
			'Graduate Certificate%',
			'Advanced Diploma%',
			'Advanced Certificate%',
			'Professional Diploma%',
			'Prof Dip%',
			'CPD%',
			'Short Course%',
			'Pre-Master%',
			'Conversion Diploma%',
			'Legal Practice%',
			'LPC%',
			'Artist Diploma%',
			'Additional Teaching%',
			'Executive Diploma%',
			'Professional Certificate%',
			'Professional Qualification%',
			'Professional Stage%',
			'Professional Award%',
			'Professional Development%',
			'Professional Postgraduate%',
			'Advanced Professional%',
			'Qualifying Award%',
			'Post-Qualifying%',
			'Postgraduate Award%',
			'Postgraduate Credits%',
			'No award%'
		]
	}
];
