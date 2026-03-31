/**
 * Validates the synonym pairs data for completeness and consistency.
 * Run: npx tsx scripts/test-synonyms.ts
 */

import { synonymPairs } from '../src/lib/data/search-synonyms.ts';

let passed = 0;
let failed = 0;
let warnings = 0;

function assert(name: string, ok: boolean, detail?: string) {
	if (ok) {
		passed++;
		console.log(`  ✓ ${name}`);
	} else {
		failed++;
		console.log(`  ✗ ${name}`);
		if (detail) console.log(`    ${detail}`);
	}
}

function warn(name: string, detail: string) {
	warnings++;
	console.log(`  ⚠ ${name}: ${detail}`);
}

console.log('Validating synonym pairs:\n');

// Build a lookup map (same logic as queries.ts getSynonymMap)
const synonymMap = new Map<string, string[]>();
for (const [term, expandsTo] of synonymPairs) {
	const key = term.toLowerCase();
	const existing = synonymMap.get(key);
	if (existing) {
		existing.push(expandsTo.toLowerCase());
	} else {
		synonymMap.set(key, [expandsTo.toLowerCase()]);
	}
}

// Test: key synonym triggers exist and expand correctly
const expectedMappings: [string, string][] = [
	['drones', 'aerial robotics'],
	['ai', 'artificial intelligence'],
	['maths', 'mathematics'],
	['cyber security', 'cybersecurity'],
	['compsci', 'computer science'],
	['physio', 'physiotherapy'],
	['ee', 'electrical engineering'],
	['bio', 'biology'],
	['psych', 'psychology'],
	['ml', 'machine learning'],
	['uav', 'drones'],
	['biomed', 'biomedical science'],
	['ppe', 'philosophy politics and economics'],
	['slt', 'speech and language therapy']
];

for (const [term, expected] of expectedMappings) {
	const expansions = synonymMap.get(term.toLowerCase());
	const found = expansions?.includes(expected.toLowerCase());
	assert(`"${term}" → includes "${expected}"`, !!found, `got: ${JSON.stringify(expansions)}`);
}

// Test: no empty terms
const emptyTerms = synonymPairs.filter(([t, e]) => !t.trim() || !e.trim());
assert(`no empty terms`, emptyTerms.length === 0, `found ${emptyTerms.length} empty entries`);

// Test: no self-referencing pairs
const selfRefs = synonymPairs.filter(([t, e]) => t.toLowerCase() === e.toLowerCase());
assert(
	`no self-referencing pairs`,
	selfRefs.length === 0,
	`found: ${selfRefs.map(([t]) => t).join(', ')}`
);

// Check: bidirectional coverage (warn if one-way pairs exist that could be bidirectional)
let missingReverse = 0;
for (const [term, expandsTo] of synonymPairs) {
	const reverse = synonymMap.get(expandsTo.toLowerCase());
	if (!reverse?.includes(term.toLowerCase())) {
		// One-way is intentional for some (e.g., "coding" → "computer science" but not reverse)
		missingReverse++;
	}
}
if (missingReverse > 0) {
	warn('bidirectional coverage', `${missingReverse} one-way pairs (may be intentional)`);
}

console.log(
	`\n${passed} passed, ${failed} failed, ${warnings} warnings (${synonymPairs.length} total pairs)`
);
process.exit(failed > 0 ? 1 : 0);
