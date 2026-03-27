/**
 * Fetch Shanghai Rankings (ARWU) from their public JSON API.
 * Writes output to src/lib/data/rankings/arwu.json
 *
 * Usage: npx tsx scripts/fetch-arwu.ts [year]
 * Default year: 2025
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const year = process.argv[2] || '2025';
const API_URL = `https://www.shanghairanking.com/api/pub/v1/arwu/rank?version=${year}`;
const OUT_DIR = resolve(import.meta.dirname, '../src/lib/data/rankings');
const OUT_FILE = resolve(OUT_DIR, 'arwu.json');

interface ArwuEntry {
	ranking: string;
	univNameEn: string;
	univUp: string; // slug
	region: string;
	score: string;
	indData: Record<string, { score: string; rank: string }>;
}

interface ArwuResponse {
	data: {
		indicators: { code: string; nameEn: string }[];
		rankings: ArwuEntry[];
	};
}

async function main() {
	console.log(`Fetching ARWU ${year} rankings...`);

	const res = await fetch(API_URL, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; universityDB/1.0)',
			Accept: 'application/json'
		}
	});

	if (!res.ok) {
		throw new Error(`ARWU API returned ${res.status}: ${res.statusText}`);
	}

	const json: ArwuResponse = await res.json();
	const { indicators, rankings } = json.data;

	console.log(`Got ${rankings.length} universities, ${indicators.length} indicators`);

	// Normalize into a flat structure
	const data = rankings.map((r) => ({
		rank: parseInt(r.ranking) || null,
		name: r.univNameEn,
		slug: r.univUp,
		country: r.region,
		overallScore: parseFloat(r.score) || null,
		indicators: Object.fromEntries(
			indicators.map((ind) => [
				ind.code,
				{
					name: ind.nameEn,
					score: r.indData[ind.code]?.score ? parseFloat(r.indData[ind.code].score) : null,
					rank: r.indData[ind.code]?.rank ? parseInt(r.indData[ind.code].rank) : null
				}
			])
		)
	}));

	mkdirSync(dirname(OUT_FILE), { recursive: true });
	writeFileSync(
		OUT_FILE,
		JSON.stringify({ source: 'ARWU', year: parseInt(year), fetchedAt: new Date().toISOString(), count: data.length, data }, null, 2)
	);

	console.log(`Wrote ${data.length} entries to ${OUT_FILE}`);
}

main().catch((err) => {
	console.error('Failed to fetch ARWU rankings:', err);
	process.exit(1);
});
