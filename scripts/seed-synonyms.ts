/**
 * Seed the search_synonyms table.
 *
 * Usage: npx tsx scripts/seed-synonyms.ts
 *
 * Requires DATABASE_URL in .env
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { searchSynonyms } from '../src/lib/server/db/schema';
import { synonymPairs } from '../src/lib/data/search-synonyms';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set. Copy .env.example to .env and fill in credentials.');
	process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
	console.log(`Seeding ${synonymPairs.length} synonym mappings...`);

	// Clear existing synonyms and re-insert
	await db.delete(searchSynonyms);

	const rows = synonymPairs.map(([term, expandsTo]) => ({
		term: term.toLowerCase(),
		expandsTo: expandsTo.toLowerCase()
	}));

	await db.insert(searchSynonyms).values(rows);

	console.log(`Done. Inserted ${rows.length} rows into search_synonyms.`);
	await client.end();
}

main().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
