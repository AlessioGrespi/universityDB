import type { PageServerLoad } from './$types';
import { getQuizResults /* saveQuizSubmission */ } from '$lib/server/db/queries';
import { paramsToAnswers } from '$lib/stores/quiz';
import { subjectClusters } from '$lib/data/subject-clusters';

export const load: PageServerLoad = async ({ url }) => {
	const answers = paramsToAnswers(url.searchParams);

	// Must have at least a scheme to return results
	if (!answers.scheme) {
		return { results: [], answers, summaryText: '', clusterLabels: [] };
	}

	const results = await getQuizResults(answers);

	// Email saving disabled — email sending not configured yet
	// if (answers.email) {
	// 	const topSlugs = results.slice(0, 5).map((r) => r.slug);
	// 	await saveQuizSubmission(answers.email, answers, topSlugs).catch(() => {
	// 		// non-critical, don't fail the page
	// 	});
	// }

	// Build summary text
	const clusterLabels = subjectClusters
		.filter((c) => answers.subjectClusters.includes(c.id))
		.map((c) => c.label);

	const priorityLabels: Record<string, string> = {
		satisfaction: 'student satisfaction',
		salary: 'graduate salary',
		research: 'research quality',
		teaching: 'teaching excellence',
		prestige: 'university prestige',
		location: 'location'
	};
	const topPriority = answers.priorities[0] ? priorityLabels[answers.priorities[0]] : '';

	let summaryText = `Based on your interest in ${clusterLabels.join(' and ')}`;
	if (topPriority) summaryText += `, with a focus on ${topPriority}`;
	if (answers.ucasPoints) summaryText += ` and ${answers.ucasPoints} UCAS points`;
	summaryText += `.`;

	return {
		results,
		answers,
		summaryText,
		clusterLabels
	};
};
