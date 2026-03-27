/**
 * Parse US News university rankings from Kaggle dataset.
 *
 * Prerequisites: pip install kaggle && configure ~/.kaggle/kaggle.json
 * OR: manually download from https://www.kaggle.com/datasets/theriley106/university-statistics
 *       and place the CSV at src/lib/data/rankings/usnews-raw.csv
 *
 * Usage: npx tsx scripts/fetch-usnews.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { resolve, dirname } from 'path';
import { execFileSync } from 'child_process';

const OUT_DIR = resolve(import.meta.dirname, '../src/lib/data/rankings');
const RAW_CSV = resolve(OUT_DIR, 'usnews-raw.csv');
const OUT_FILE = resolve(OUT_DIR, 'usnews.json');

const KAGGLE_DATASET = 'theriley106/university-statistics';

function downloadFromKaggle() {
	console.log('Downloading US News dataset from Kaggle...');
	try {
		mkdirSync(OUT_DIR, { recursive: true });
		execFileSync('kaggle', ['datasets', 'download', '-d', KAGGLE_DATASET, '--unzip', '-p', OUT_DIR], {
			stdio: 'inherit'
		});

		// Find the downloaded CSV
		const files = readdirSync(OUT_DIR).filter((f) => f.endsWith('.csv'));
		const newsCsv = files.find(
			(f) =>
				f.toLowerCase().includes('usnews') ||
				f.toLowerCase().includes('university-statistics') ||
				f.toLowerCase().includes('schoolinfo')
		);
		if (newsCsv && resolve(OUT_DIR, newsCsv) !== RAW_CSV) {
			renameSync(resolve(OUT_DIR, newsCsv), RAW_CSV);
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

	console.log('Parsing US News rankings CSV...');
	const raw = readFileSync(RAW_CSV, 'utf-8');
	const rows = parseCSV(raw);

	console.log(`Parsed ${rows.length} rows. Columns: ${Object.keys(rows[0] || {}).join(', ')}`);

	const data = rows.map((r) => {
		const rankStr = r['rank'] || r['Rank'] || r['ranking'] || r['overallRank'] || '';
		const rank = parseInt(rankStr.replace(/[^0-9]/g, '')) || null;

		return {
			rank,
			rankDisplay: rankStr || null,
			name: r['displayName'] || r['name'] || r['Name'] || r['institution'] || '',
			city: r['city'] || '',
			state: r['state'] || '',
			country: r['country'] || r['Country'] || 'United States',
			type: r['type'] || r['institutionalControl'] || '',
			founded: parseInt(r['founded'] || r['yearFounded'] || '') || null,
			enrollment:
				parseInt((r['enrollment'] || r['totalEnrollment'] || '').replace(/,/g, '')) || null,
			tuitionInState:
				parseInt((r['tuitionAndFees'] || r['inStateTuition'] || '').replace(/[$,]/g, '')) ||
				null,
			tuitionOutState:
				parseInt((r['outOfStateTuition'] || '').replace(/[$,]/g, '')) || null,
			acceptanceRate:
				parseFloat((r['acceptanceRate'] || r['admissionRate'] || '').replace(/%/, '')) ||
				null,
			satAvg: parseInt(r['satAvg'] || r['satComposite'] || '') || null,
			actAvg: parseInt(r['actAvg'] || r['actComposite'] || '') || null,
			graduationRate:
				parseFloat((r['graduationRate'] || r['4yrGradRate'] || '').replace(/%/, '')) || null,
			studentFacultyRatio: r['studentFacultyRatio'] || r['studentToFacultyRatio'] || null,
			website: r['website'] || null,
			overallScore: parseFloat(r['overallScore'] || r['score'] || '') || null
		};
	});

	mkdirSync(dirname(OUT_FILE), { recursive: true });
	writeFileSync(
		OUT_FILE,
		JSON.stringify(
			{
				source: 'US News & World Report',
				year: 2024,
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
