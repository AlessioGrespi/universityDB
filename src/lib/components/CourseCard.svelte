<script lang="ts">
	import type { Course } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';

	function formatSalary(n: number): string {
		return '\u00A3' + n.toLocaleString('en-GB');
	}

	function isValidReq(val: string | undefined): boolean {
		return !!val && val !== 'See entry requirements' && val !== 'N/A';
	}

	let { course }: { course: Course } = $props();

	let schemeLabel = $derived(
		course.scheme === 'Postgraduate'
			? 'PG'
			: course.scheme === 'Undergraduate (Integrated Masters)'
				? 'UG (Integrated Masters)'
				: 'UG'
	);
	let schemeVariant = $derived<'success' | 'default'>(
		course.scheme === 'Postgraduate' ? 'success' : 'default'
	);
	let displayQualification = $derived(course.fullQualification || course.qualification);
</script>

<a
	href="/courses/{course.slug}"
	class="group block rounded-card border border-surface-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
>
	<div>
		<h3
			class="text-lg font-semibold text-surface-800 transition-colors group-hover:text-primary-600"
		>
			{course.title}
		</h3>
		<p class="mt-1 text-sm text-primary-600">{course.universityName}</p>
	</div>

	<div class="mt-3 flex flex-wrap gap-2">
		<Badge label={course.qualification} variant="primary" />
		{#if course.studyMode}
			<Badge label={course.studyMode} variant="default" />
		{/if}
		{#if course.duration}
			<Badge label={course.duration} variant="default" />
		{/if}
		<Badge label={schemeLabel} variant={schemeVariant} />
		{#if course.campusLocation}
			<Badge label={course.campusLocation} variant="default" />
		{/if}
	</div>

	<div class="mt-4 grid grid-cols-2 gap-3">
		{#if isValidReq(course.entryRequirements.aLevel)}
			<div>
				<p class="text-xs text-surface-400">A-Levels</p>
				<p class="text-sm font-medium text-surface-700">{course.entryRequirements.aLevel}</p>
			</div>
		{/if}
		{#if isValidReq(course.entryRequirements.ucasPoints)}
			<div>
				<p class="text-xs text-surface-400">UCAS Points</p>
				<p class="text-sm font-medium text-surface-700">{course.entryRequirements.ucasPoints}</p>
			</div>
		{/if}
		{#if course.nssScore}
			<div>
				<p class="text-xs text-surface-400">NSS Score</p>
				<p class="text-sm font-medium text-surface-700">{course.nssScore}%</p>
			</div>
		{/if}
		{#if course.averageGraduateSalary}
			<div>
				<p class="text-xs text-surface-400">Avg. Salary</p>
				<p class="text-sm font-medium text-surface-700">
					{formatSalary(course.averageGraduateSalary)}
				</p>
			</div>
		{/if}
	</div>
</a>
