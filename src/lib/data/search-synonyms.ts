/**
 * Seed data for search synonyms.
 * Each pair is [term, expandsTo]. Bidirectional pairs have two entries.
 */
export const synonymPairs: [string, string][] = [
	// Bidirectional pairs — common abbreviations & colloquial terms
	['drones', 'aerial robotics'],
	['aerial robotics', 'drones'],

	['ai', 'artificial intelligence'],
	['artificial intelligence', 'ai'],

	['cs', 'computer science'],
	['computer science', 'cs'],
	['compsci', 'computer science'],
	['computer science', 'compsci'],

	['ml', 'machine learning'],
	['machine learning', 'ml'],

	['nlp', 'natural language processing'],
	['natural language processing', 'nlp'],

	['stats', 'statistics'],
	['statistics', 'stats'],

	['maths', 'mathematics'],
	['mathematics', 'maths'],
	['math', 'mathematics'],
	['mathematics', 'math'],

	['bio', 'biology'],
	['biology', 'bio'],

	['chem', 'chemistry'],
	['chemistry', 'chem'],

	['econ', 'economics'],
	['economics', 'econ'],

	['psych', 'psychology'],
	['psychology', 'psych'],

	['polisci', 'political science'],
	['political science', 'polisci'],
	['politics', 'political science'],
	['political science', 'politics'],

	['ee', 'electrical engineering'],
	['electrical engineering', 'ee'],

	['me', 'mechanical engineering'],
	['mechanical engineering', 'me'],

	['ux', 'user experience'],
	['user experience', 'ux'],

	['hci', 'human-computer interaction'],
	['human-computer interaction', 'hci'],

	['ir', 'international relations'],
	['international relations', 'ir'],

	['cv', 'computer vision'],
	['computer vision', 'cv'],

	['infosec', 'cyber security'],
	['cyber security', 'infosec'],
	['cybersecurity', 'cyber security'],
	['cyber security', 'cybersecurity'],

	['bioinformatics', 'computational biology'],
	['computational biology', 'bioinformatics'],

	['robotics', 'mechatronics'],
	['mechatronics', 'robotics'],

	// One-way expansions — colloquial to formal
	['law', 'jurisprudence'],
	['physio', 'physiotherapy'],
	['vet', 'veterinary'],
	['pharma', 'pharmacy'],
	['arch', 'architecture'],
	['enviro', 'environmental science'],
	['astro', 'astrophysics'],
	['biz', 'business'],
	['accounting', 'accountancy'],
	['data science', 'data analytics'],
	['devops', 'software engineering'],
	['programming', 'computer science'],
	['coding', 'computer science'],
	['finance', 'financial mathematics'],
	['games', 'game design'],
	['animation', 'computer animation'],
	['forensics', 'forensic science']
];
