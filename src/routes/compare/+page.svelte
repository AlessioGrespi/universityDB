<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { compareList, removeFromCompare, clearCompare } from '$lib/stores/compare';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function removeCourse(slug: string) {
		removeFromCompare(slug);
		const remaining = data.courses.filter((c) => c.slug !== slug).map((c) => c.slug);
		if (remaining.length > 0) {
			goto(`/compare?courses=${remaining.join(',')}`, { replaceState: true });
		} else {
			goto('/compare', { replaceState: true });
		}
	}

	function clearAll() {
		clearCompare();
		goto('/compare', { replaceState: true });
	}

	function formatSalary(n: number): string {
		return '\u00A3' + n.toLocaleString('en-GB');
	}

	function tefVariant(rating: string | null): 'gold' | 'silver' | 'bronze' | 'default' {
		if (rating === 'Gold') return 'gold';
		if (rating === 'Silver') return 'silver';
		if (rating === 'Bronze') return 'bronze';
		return 'default';
	}

	function isValidReq(val: string | undefined): boolean {
		return !!val && val !== 'See entry requirements' && val !== 'N/A';
	}

	interface CompareRow {
		label: string;
		getValue: (course: (typeof data.courses)[0]) => string | number | null | undefined;
		format?: 'salary' | 'percentage' | 'badge';
	}

	const rows: CompareRow[] = [
		{
			label: 'University',
			getValue: (c) => c.universityName
		},
		{
			label: 'TEF Rating',
			getValue: (c) => (c as any).tefRating,
			format: 'badge'
		},
		{
			label: 'Qualification',
			getValue: (c) => c.qualification
		},
		{
			label: 'Study Mode',
			getValue: (c) => c.studyMode
		},
		{
			label: 'Duration',
			getValue: (c) => c.duration
		},
		{
			label: 'A-Level Entry',
			getValue: (c) => (isValidReq(c.entryRequirements.aLevel) ? c.entryRequirements.aLevel : null)
		},
		{
			label: 'UCAS Points',
			getValue: (c) =>
				isValidReq(c.entryRequirements.ucasPoints) ? c.entryRequirements.ucasPoints : null
		},
		{
			label: 'NSS Score',
			getValue: (c) => c.nssScore,
			format: 'percentage'
		},
		{
			label: 'Graduate Salary',
			getValue: (c) => c.averageGraduateSalary,
			format: 'salary'
		},
		{
			label: 'Subjects',
			getValue: (c) => c.subjects.join(', ')
		},
		{
			label: 'Location',
			getValue: (c) => c.campusLocation
		},
		{
			label: 'Scheme',
			getValue: (c) => c.scheme
		}
	];

	let gridCols = $derived(
		data.courses.length <= 2
			? 'grid-cols-2'
			: data.courses.length === 3
				? 'grid-cols-3'
				: 'grid-cols-4'
	);
</script>

<Seo
	title="Compare Courses Side by Side"
	description="Compare university courses side by side — entry requirements, graduate outcomes, and more."
	noindex={true}
/>

<div class="bg-gradient-to-b from-primary-50 to-white px-4 py-8 sm:py-12">
	<div class="mx-auto max-w-7xl">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-surface-900 sm:text-4xl">Compare Courses</h1>
				<p class="mt-2 text-lg text-surface-500">
					Side-by-side comparison of {data.courses.length} course{data.courses.length !== 1
						? 's'
						: ''}
				</p>
			</div>
			{#if data.courses.length > 0}
				<button
					onclick={() => clearAll()}
					class="text-sm text-surface-400 transition-colors hover:text-red-500"
				>
					Clear all
				</button>
			{/if}
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	{#if data.courses.length > 0}
		<div class="overflow-x-auto">
			<div class="min-w-[600px]">
				<!-- Course headers -->
				<div class="grid {gridCols} mb-6 gap-4">
					{#each data.courses as course}
						<div class="relative rounded-lg border border-surface-200 bg-white p-4">
							<button
								onclick={() => removeCourse(course.slug)}
								class="absolute top-2 right-2 p-1 text-surface-400 transition-colors hover:text-red-500"
								aria-label="Remove from comparison"
							>
								<svg
									class="h-4 w-4"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
							<a
								href="/courses/{course.slug}"
								class="block pr-6 text-sm leading-tight font-semibold text-surface-900 transition-colors hover:text-primary-600 sm:text-base"
							>
								{course.title}
							</a>
							<a
								href="/universities/{course.universitySlug}"
								class="mt-1 block text-sm text-surface-500 transition-colors hover:text-primary-600"
							>
								{course.universityName}
							</a>
						</div>
					{/each}
				</div>

				<!-- Comparison rows -->
				<div class="overflow-hidden rounded-lg border border-surface-200">
					{#each rows as row, i}
						{@const values = data.courses.map((c: (typeof data.courses)[0]) => row.getValue(c))}
						{@const hasAnyValue = values.some(
							(v: string | number | null | undefined) => v !== null && v !== undefined && v !== ''
						)}
						{#if hasAnyValue}
							<div
								class="grid grid-cols-[140px_1fr] border-b border-surface-100 last:border-b-0 sm:grid-cols-[180px_1fr] {i %
									2 ===
								0
									? 'bg-white'
									: 'bg-surface-50/50'}"
							>
								<div
									class="border-r border-surface-100 px-4 py-3 text-sm font-medium text-surface-600"
								>
									{row.label}
								</div>
								<div class="grid {gridCols}">
									{#each data.courses as course, j}
										{@const val = row.getValue(course)}
										<div class="px-4 py-3 text-sm {j > 0 ? 'border-l border-surface-100' : ''}">
											{#if val === null || val === undefined || val === ''}
												<span class="text-surface-300">&mdash;</span>
											{:else if row.format === 'salary'}
												<span class="font-medium text-surface-800 tabular-nums"
													>{formatSalary(Number(val))}</span
												>
											{:else if row.format === 'percentage'}
												<span class="font-medium text-surface-800">{val}%</span>
											{:else if row.format === 'badge'}
												<Badge label="TEF {val}" variant={tefVariant(String(val))} />
											{:else}
												<span class="text-surface-800">{val}</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>

				<!-- View detail links -->
				<div class="grid {gridCols} mt-6 gap-4">
					{#each data.courses as course}
						<a
							href="/courses/{course.slug}"
							class="text-center text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
						>
							View full details &rarr;
						</a>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div class="py-20 text-center">
			<svg
				class="mx-auto mb-4 h-16 w-16 text-surface-300"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
				/>
			</svg>
			<p class="text-lg font-medium text-surface-500">No courses to compare</p>
			<p class="mt-2 mb-6 text-sm text-surface-400">
				Add courses to compare using the scales icon on the courses page
			</p>
			<a
				href="/courses"
				class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
			>
				Browse courses
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
		</div>
	{/if}
</div>
