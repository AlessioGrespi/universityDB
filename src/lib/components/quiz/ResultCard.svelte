<script lang="ts">
	import type { ScoredCourse } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';
	import MatchScoreRing from './MatchScoreRing.svelte';
	import { toggleShortlist, shortlist } from '$lib/stores/shortlist';
	import { toggleCompare, compareList } from '$lib/stores/compare';

	let { course, rank }: { course: ScoredCourse; rank: number } = $props();

	const isShortlisted = $derived($shortlist.some((i) => i.slug === course.slug));
	const isCompared = $derived($compareList.includes(course.slug));

	const eligibilityVariant = $derived(
		course.eligibility === 'likely'
			? 'success'
			: course.eligibility === 'stretch'
				? 'gold'
				: course.eligibility === 'ambitious'
					? 'bronze'
					: 'default'
	);

	function formatSalary(salary: number | undefined): string {
		if (!salary) return '—';
		return `£${salary.toLocaleString('en-GB')}`;
	}

	function tefVariant(rating: string | null): 'gold' | 'silver' | 'bronze' | 'default' {
		if (rating === 'Gold') return 'gold';
		if (rating === 'Silver') return 'silver';
		if (rating === 'Bronze') return 'bronze';
		return 'default';
	}
</script>

<div
	class="group rounded-card border border-surface-200 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover"
>
	<div class="flex items-start gap-4">
		<!-- Rank + Score -->
		<div class="flex flex-col items-center gap-1">
			<span class="text-xs font-medium text-surface-400">#{rank}</span>
			<MatchScoreRing score={course.matchScore} />
		</div>

		<!-- Main content -->
		<div class="min-w-0 flex-1">
			<a
				href="/courses/{course.slug}"
				class="text-lg font-semibold text-surface-800 transition-colors hover:text-primary-600"
			>
				{course.title}
			</a>
			<div class="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-surface-500">
				<a
					href="/universities/{course.universitySlug}"
					class="transition-colors hover:text-primary-600"
				>
					{course.universityName}
				</a>
				{#if course.universityTown}
					<span class="text-surface-300">·</span>
					<span>{course.universityTown}</span>
				{/if}
			</div>

			<!-- Badges row -->
			<div class="mt-3 flex flex-wrap gap-1.5">
				<Badge label={course.qualification} variant="primary" />
				<Badge label={course.studyMode} />
				{#if course.duration}
					<Badge label={course.duration} />
				{/if}
				{#if course.eligibility}
					<Badge
						label={course.eligibility.charAt(0).toUpperCase() + course.eligibility.slice(1)}
						variant={eligibilityVariant}
					/>
				{/if}
				{#if course.universityTefRating}
					<Badge
						label="TEF {course.universityTefRating}"
						variant={tefVariant(course.universityTefRating)}
					/>
				{/if}
			</div>

			<!-- Stats row -->
			<div class="mt-3 flex flex-wrap gap-4 text-sm text-surface-500">
				{#if course.nssScore}
					<span title="Student satisfaction (NSS)">
						😊 {course.nssScore}% satisfied
					</span>
				{/if}
				{#if course.averageGraduateSalary}
					<span title="Average graduate salary">
						💰 {formatSalary(course.averageGraduateSalary)}
					</span>
				{/if}
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex flex-col gap-2">
			<button
				class="rounded-button p-2 transition-colors {isShortlisted
					? 'bg-primary-50 text-primary-600'
					: 'text-surface-300 hover:text-primary-500'}"
				title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
				onclick={() =>
					toggleShortlist({
						slug: course.slug,
						title: course.title,
						universityName: course.universityName,
						universitySlug: course.universitySlug,
						qualification: course.qualification,
						studyMode: course.studyMode
					})}
			>
				<svg
					class="h-5 w-5"
					fill={isShortlisted ? 'currentColor' : 'none'}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
			</button>
			<button
				class="rounded-button p-2 transition-colors {isCompared
					? 'bg-primary-50 text-primary-600'
					: 'text-surface-300 hover:text-primary-500'}"
				title={isCompared ? 'Remove from compare' : 'Add to compare'}
				onclick={() => toggleCompare(course.slug)}
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
					/>
				</svg>
			</button>
		</div>
	</div>
</div>
