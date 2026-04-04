<script lang="ts">
	import type { PageData } from './$types';
	import ResultCard from '$lib/components/quiz/ResultCard.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { answersToParams } from '$lib/stores/quiz';
	import { browser } from '$app/environment';
	import posthog from 'posthog-js';

	let { data }: { data: PageData } = $props();

	const topResults = $derived(data.results.slice(0, 5));
	const remainingResults = $derived(data.results.slice(5));

	// Track quiz completion
	$effect(() => {
		if (browser && data.answers.scheme) {
			posthog.capture('quiz_completed', {
				scheme: data.answers.scheme,
				subject_clusters: data.answers.subjectClusters,
				priorities: data.answers.priorities,
				ucas_points: data.answers.ucasPoints,
				regions: data.answers.regions,
				study_mode: data.answers.studyMode,
				results_count: data.results.length,
				top_match: data.results[0]?.title ?? null
			});
		}
	});
	// Email gate disabled — email sending not configured yet
	// const hasEmail = $derived(!!data.answers.email);
	// let showGated = $state(false);
	// let emailForGate = $state('');
	// let gateError = $state('');

	function shareUrl(): string {
		if (!browser) return '';
		const params = answersToParams(data.answers);
		return `${window.location.origin}/quiz/results?${params}`;
	}

	let copied = $state(false);
	function copyLink() {
		navigator.clipboard.writeText(shareUrl());
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Your Course Matches | UniversityDB</title>
	<meta name="description" content="Personalised course recommendations from UniversityDB." />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<!-- Hero -->
	<div class="mb-8 text-center">
		<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">Your Course Matches</h1>
		{#if data.summaryText}
			<p class="mx-auto mt-3 max-w-lg text-lg text-surface-500">{data.summaryText}</p>
		{/if}
		{#if data.clusterLabels.length > 0}
			<div class="mt-3 flex flex-wrap justify-center gap-1.5">
				{#each data.clusterLabels as label}
					<Badge {label} variant="primary" />
				{/each}
			</div>
		{/if}
	</div>

	{#if data.results.length === 0}
		<!-- Empty state -->
		<div class="rounded-card border border-surface-200 bg-white p-12 text-center shadow-card">
			<div class="mb-4 text-5xl">🔍</div>
			<h2 class="text-xl font-semibold text-surface-800">No matches found</h2>
			<p class="mt-2 text-surface-500">
				Try broadening your subject choices or adjusting your UCAS points.
			</p>
			<a
				href="/quiz/take"
				class="mt-6 inline-flex items-center gap-2 rounded-button bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
			>
				Retake Quiz
			</a>
		</div>
	{:else}
		<!-- Top results -->
		<div class="space-y-4">
			<h2 class="text-sm font-semibold tracking-wider text-surface-400 uppercase">Best Matches</h2>
			{#each topResults as course, i}
				<ResultCard {course} rank={i + 1} />
			{/each}
		</div>

		<!-- Remaining results (email gate disabled) -->
		{#if remainingResults.length > 0}
			<div class="mt-8 space-y-4">
				<h2 class="text-sm font-semibold tracking-wider text-surface-400 uppercase">
					Worth Exploring
				</h2>
				{#each remainingResults as course, i}
					<ResultCard {course} rank={i + 6} />
				{/each}
			</div>
		{/if}

		<!-- Share + Actions -->
		<div class="mt-10 rounded-card border border-surface-100 bg-surface-50 p-6">
			<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
				<div>
					<h3 class="font-semibold text-surface-800">Share your results</h3>
					<p class="text-sm text-surface-500">Let friends find their match too.</p>
				</div>
				<div class="flex gap-2">
					<button
						class="rounded-button border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
						onclick={copyLink}
					>
						{copied ? 'Copied!' : 'Copy link'}
					</button>
				</div>
			</div>
		</div>

		<!-- CTA -->
		<div class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
			<a
				href="/quiz/take"
				class="rounded-button border border-surface-200 bg-white px-6 py-3 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
			>
				Retake Quiz
			</a>
			<a
				href="/courses?scheme={data.answers.scheme}{data.answers.subjectClusters[0]
					? `&subject=${data.answers.subjectClusters[0]}`
					: ''}"
				class="rounded-button bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
			>
				Browse All Courses
			</a>
		</div>
	{/if}
</div>
