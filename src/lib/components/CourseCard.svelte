<script lang="ts">
	import type { Course } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';

	function formatSalary(n: number): string {
		return '£' + n.toLocaleString('en-GB');
	}

	let { course }: { course: Course } = $props();

	let schemeLabel = $derived(course.scheme === 'Postgraduate' ? 'PG' : 'UG');
	let schemeVariant = $derived<'success' | 'default'>(
		course.scheme === 'Postgraduate' ? 'success' : 'default'
	);
</script>

<a
	href="/courses/{course.slug}"
	class="group block rounded-card border border-surface-200 bg-white p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
>
	<div>
		<h3
			class="text-lg font-semibold text-surface-800 group-hover:text-primary-600 transition-colors"
		>
			{course.title}
		</h3>
		<p class="text-sm text-primary-600 mt-1">{course.universityName}</p>
	</div>

	<div class="mt-3 flex flex-wrap gap-2">
		<Badge label={course.qualification} variant="primary" />
		<Badge label={course.studyMode} variant="default" />
		<Badge label={course.duration} variant="default" />
		<Badge label={schemeLabel} variant={schemeVariant} />
	</div>

	<div class="mt-4 grid grid-cols-2 gap-3">
		{#if course.entryRequirements.aLevels}
			<div>
				<p class="text-xs text-surface-400">A-Levels</p>
				<p class="text-sm font-medium text-surface-700">{course.entryRequirements.aLevels}</p>
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
		{#if course.entryRequirements.ucasTariff}
			<div>
				<p class="text-xs text-surface-400">UCAS Tariff</p>
				<p class="text-sm font-medium text-surface-700">
					{course.entryRequirements.ucasTariff}
				</p>
			</div>
		{/if}
	</div>
</a>
