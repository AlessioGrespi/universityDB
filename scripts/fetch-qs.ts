/**
 * Fetch QS World University Rankings from Kaggle dataset.
 *
 * Prerequisites: pip install kaggle && configure ~/.kaggle/kaggle.json
 * OR: manually download from https://www.kaggle.com/datasets/akashbommidi/2026-qs-world-university-rankings
 *       and place the CSV at src/lib/data/rankings/qs-raw.csv
 *
 * Usage: npx tsx scripts/fetch-qs.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { resolve, dirname } from 'path';
import { execFileSync } from 'child_process';

const OUT_DIR = resolve(import.meta.dirname, '../src/lib/data/rankings');
const RAW_CSV = resolve(OUT_DIR, 'qs-raw.csv');
const OUT_FILE = resolve(OUT_DIR, 'qs.json');

const KAGGLE_DATASET = 'akashbommidi/2026-qs-world-university-rankings';

function downloadFromKaggle() {
	console.log('Downloading QS dataset from Kaggle...');
	try {
		mkdirSync(OUT_DIR, { recursive: true });
		execFileSync('kaggle', ['datasets', 'download', '-d', KAGGLE_DATASET, '--unzip', '-p', OUT_DIR], {
			stdio: 'inherit'
		});

		// Find the downloaded CSV (name may vary)
		const files = readdirSync(OUT_DIR).filter((f) => f.endsWith('.csv'));
		const qsCsv = files.find(
			(f) =>
				f.toLowerCase().includes('qs') ||
				f.toLowerCase().includes('ranking') ||
				f.toLowerCase().includes('2026')
		);
		if (qsCsv && resolve(OUT_DIR, qsCsv) !== RAW_CSV) {
			renameSync(resolve(OUT_DIR, qsCsv), RAW_CSV);
		}
	} catch {
		console.error(
			'Kaggle CLI not available. Please either:\n' +
				'  1. Install kaggle: pip install kaggle\n' +
				'  2. Or manually download the CSV from:\n' +
				`     https://www.kaggle.com/datasets/${KAGGLE_DATASET}\n` +
				`     and place it at: ${RAW_CSV}`
		);
		process.exit(1);
	}
}

function parseCSV(text: string): Record<string, string>[] {
	const lines = text.split('\n').filter((l) => l.trim());
	if (lines.length < 2) return [];

	const parseRow = (line: string): string[] => {
		const fields: string[] = [];
		let current = '';
		let inQuotes = false;
		for (const ch of line) {
			if (ch === '"') {
				inQuotes = !inQuotes;
			} else if (ch === ',' && !inQuotes) {
				fields.push(current.trim());
				current = '';
			} else {
				current += ch;
			}
		}
		fields.push(current.trim());
		return fields;
	};

	const headers = parseRow(lines[0]);
	return lines.slice(1).map((line) => {
		const values = parseRow(line);
		const row: Record<string, string> = {};
		headers.forEach((h, i) => {
			row[h] = values[i] || '';
		});
		return row;
	});
}

function main() {
	if (!existsSync(RAW_CSV)) {
		downloadFromKaggle();
	}

	if (!existsSync(RAW_CSV)) {
		console.error(`CSV not found at ${RAW_CSV}`);
		process.exit(1);
	}

	console.log('Parsing QS rankings CSV...');
	const raw = readFileSync(RAW_CSV, 'utf-8');
	const rows = parseCSV(raw);

	console.log(`Parsed ${rows.length} rows. Columns: ${Object.keys(rows[0] || {}).join(', ')}`);

	// Normalize — column names vary by dataset, so we try common patterns
	const data = rows.map((r) => {
		const rankStr =
			r['Rank (2026)'] || r['2026 Rank'] || r['Rank'] || r['RANK'] || r['rank'] || '';
		const rank = parseInt(rankStr.replace(/[^0-9]/g, '')) || null;

		return {
			rank,
			rankDisplay: rankStr || null,
			name:
				r['Institution Name'] ||
				r['institution'] ||
				r['University'] ||
				r['university'] ||
				r['Name'] ||
				'',
			country:
				r['Country/Territory'] || r['Location'] || r['country'] || r['Country'] || '',
			region: r['Region'] || '',
			size: r['Size'] || '',
			focus: r['Focus'] || '',
			researchIntensity: r['Research Intensity'] || r['Res.'] || '',
			status: r['Status'] || '',
			overallScore: parseFloat(r['Overall Score'] || r['SCORE'] || '') || null,
			academicReputation: parseFloat(r['AR Score'] || r['Academic Reputation Score'] || '') || null,
			employerReputation: parseFloat(r['ER Score'] || r['Employer Reputation Score'] || '') || null,
			facultyStudentRatio: parseFloat(r['FSR Score'] || '') || null,
			citationsPerFaculty: parseFloat(r['CPF Score'] || '') || null,
			internationalFaculty: parseFloat(r['IFR Score'] || '') || null,
			internationalStudents: parseFloat(r['ISR Score'] || '') || null,
			internationalResearchNetwork: parseFloat(r['IRN Score'] || '') || null,
			employmentOutcomes: parseFloat(r['EO Score'] || '') || null,
			sustainability: parseFloat(r['SUS Score'] || '') || null
		};
	});

	mkdirSync(dirname(OUT_FILE), { recursive: true });
	writeFileSync(
		OUT_FILE,
		JSON.stringify(
			{
				source: 'QS World University Rankings',
				year: 2026,
				fetchedAt: new Date().toISOString(),
				count: data.length,
				data
			},
			null,
			2
		)
	);

	console.log(`Wrote ${data.length} entries to ${OUT_FILE}`);
}

main();
