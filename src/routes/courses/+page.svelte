<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { shortlist, toggleShortlist } from '$lib/stores/shortlist';
	import { compareList, toggleCompare, compareCount } from '$lib/stores/compare';
	import posthog from 'posthog-js';

	let { data } = $props();

	let searchInput = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		searchInput = data.filters.q ?? '';
	});

	function updateFilters(updates: Record<string, string | undefined>) {
		const url = new URL($page.url);
		for (const [key, value] of Object.entries(updates)) {
			if (value) {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		}
		url.searchParams.delete('page');
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const q = searchInput.trim() || undefined;
			if (q) {
				posthog.capture('course_search', { query: q });
			}
			updateFilters({ q });
		}, 250);
	}

	function handleFilterChange(key: string, value: string) {
		updateFilters({ [key]: value || undefined });
	}

	function goToPage(p: number) {
		const url = new URL($page.url);
		if (p > 1) {
			url.searchParams.set('page', String(p));
		} else {
			url.searchParams.delete('page');
		}
		goto(url.toString(), { replaceState: true });
	}

	function formatSalary(n: number): string {
		return '\u00A3' + n.toLocaleString('en-GB');
	}

	function isValidReq(val: string | undefined): boolean {
		return !!val && val !== 'See entry requirements' && val !== 'N/A';
	}

	// Grade-based filter
	import { browser } from '$app/environment';

	let myUcasPoints: string | null = $state('');

	$effect(() => {
		if (browser) {
			myUcasPoints = localStorage.getItem('universitydb-ucas-points') ?? '';
		}
	});

	function handleUcasInput() {
		if (browser) {
			const val = String(myUcasPoints ?? '').trim();
			if (val) {
				localStorage.setItem('universitydb-ucas-points', val);
			} else {
				localStorage.removeItem('universitydb-ucas-points');
			}
		}
	}

	function parseUcasPoints(raw: string | undefined): number | null {
		if (!raw) return null;
		const match = raw.match(/(\d+)/);
		return match ? parseInt(match[1], 10) : null;
	}

	function getEligibility(
		course: (typeof data.courses)[0]
	): 'likely' | 'stretch' | 'ambitious' | null {
		const myPoints = parseInt(String(myUcasPoints ?? ''), 10);
		if (!myPoints || isNaN(myPoints)) return null;
		const reqPoints = parseUcasPoints(course.entryRequirements.ucasPoints);
		if (!reqPoints) return null;
		if (myPoints >= reqPoints) return 'likely';
		if (myPoints >= reqPoints - 16) return 'stretch';
		return 'ambitious';
	}

	const eligibilityConfig = {
		likely: { label: 'Likely', class: 'bg-green-100 text-green-800' },
		stretch: { label: 'Stretch', class: 'bg-amber-100 text-amber-800' },
		ambitious: { label: 'Ambitious', class: 'bg-red-100 text-red-800' }
	} as const;

	let totalPages = $derived(Math.ceil(data.total / data.limit));
	let isSearching = $derived(!!$navigating);
	let hasUcasFilter = $derived(!!myUcasPoints && !isNaN(parseInt(String(myUcasPoints), 10)));

	let filtersOpen = $state(false);
	let activeFilterCount = $derived(
		[
			data.filters.subject,
			data.filters.qualification,
			data.filters.studyMode,
			data.filters.scheme,
			data.filters.sort,
			String(myUcasPoints ?? '').trim() || undefined
		].filter(Boolean).length
	);
</script>

<Seo
	title="Search {data.total.toLocaleString()} UK University Courses"
	description="Search and compare {data.total.toLocaleString()} university courses across the UK. Filter by subject, qualification, study mode, and entry requirements. Compare graduate salaries and student satisfaction."
/>

<div class="bg-gradient-to-b from-primary-50 to-white px-4 py-8 sm:py-12">
	<div class="mx-auto max-w-7xl">
		<h1 class="text-3xl font-bold text-surface-900 sm:text-4xl">Courses</h1>
		<p class="mt-2 max-w-2xl text-lg text-surface-500">
			Discover {data.total.toLocaleString()} courses across UK universities
		</p>
	</div>
</div>

<div class="sticky top-16 z-40 border-b border-surface-200 bg-white/80 backdrop-blur-md">
	<div class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
		<!-- Always-visible row: search + filter toggle + spinner -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full sm:max-w-xs">
				<svg
					class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-surface-400"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					placeholder="Search courses or universities..."
					bind:value={searchInput}
					oninput={handleSearchInput}
					class="w-full appearance-none rounded-lg border border-surface-300 bg-white py-2 pr-3 pl-9 text-sm text-surface-700 transition-all outline-none placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				/>
			</div>

			<!-- Mobile filter toggle button -->
			<button
				onclick={() => (filtersOpen = !filtersOpen)}
				class="flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-700 transition-all hover:bg-surface-50 sm:hidden"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
					/>
				</svg>
				Filters
				{#if activeFilterCount > 0}
					<span
						class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white"
					>
						{activeFilterCount}
					</span>
				{/if}
			</button>

			<!-- Desktop: inline filters (hidden on mobile, shown on sm+) -->
			<div class="hidden flex-wrap items-center gap-2 sm:flex">
				<select
					value={data.filters.subject ?? ''}
					onchange={(e) => handleFilterChange('subject', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All Subjects</option>
					{#each data.filterOptions.subjects as subject}
						<option value={subject.slug}>{subject.name}</option>
					{/each}
				</select>

				<select
					value={data.filters.qualification ?? ''}
					onchange={(e) =>
						handleFilterChange('qualification', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All Qualifications</option>
					{#each data.filterOptions.qualifications as qualification}
						<option value={qualification}>{qualification}</option>
					{/each}
				</select>

				<select
					value={data.filters.studyMode ?? ''}
					onchange={(e) => handleFilterChange('studyMode', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All Study Modes</option>
					<option value="Full-time">Full-time</option>
					<option value="Part-time">Part-time</option>
				</select>

				<select
					value={data.filters.scheme ?? ''}
					onchange={(e) => handleFilterChange('scheme', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All Schemes</option>
					<option value="Undergraduate">Undergraduate</option>
					<option value="Postgraduate">Postgraduate</option>
				</select>

				<select
					value={data.filters.sort ?? ''}
					onchange={(e) => handleFilterChange('sort', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">Sort: A-Z</option>
					<option value="university">Sort: University</option>
				</select>

				<div class="relative">
					<input
						type="number"
						placeholder="My UCAS points"
						bind:value={myUcasPoints}
						oninput={handleUcasInput}
						min="0"
						max="168"
						class="w-36 appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-700 transition-all outline-none placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
							{hasUcasFilter ? 'border-primary-400 ring-1 ring-primary-200' : ''}"
					/>
				</div>
			</div>

			{#if isSearching}
				<div class="flex items-center gap-2 text-sm text-surface-400">
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600"
					></div>
				</div>
			{/if}
		</div>

		<!-- Mobile: collapsible filter drawer -->
		<div
			class="grid transition-[grid-template-rows] duration-200 ease-in-out sm:hidden"
			style="grid-template-rows: {filtersOpen ? '1fr' : '0fr'}"
		>
			<div class="overflow-hidden">
				<div class="flex flex-col gap-2 pt-2">
					<select
						value={data.filters.subject ?? ''}
						onchange={(e) => handleFilterChange('subject', (e.target as HTMLSelectElement).value)}
						class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
					>
						<option value="">All Subjects</option>
						{#each data.filterOptions.subjects as subject}
							<option value={subject.slug}>{subject.name}</option>
						{/each}
					</select>

					<select
						value={data.filters.qualification ?? ''}
						onchange={(e) =>
							handleFilterChange('qualification', (e.target as HTMLSelectElement).value)}
						class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
					>
						<option value="">All Qualifications</option>
						{#each data.filterOptions.qualifications as qualification}
							<option value={qualification}>{qualification}</option>
						{/each}
					</select>

					<div class="grid grid-cols-2 gap-2">
						<select
							value={data.filters.studyMode ?? ''}
							onchange={(e) =>
								handleFilterChange('studyMode', (e.target as HTMLSelectElement).value)}
							class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						>
							<option value="">All Study Modes</option>
							<option value="Full-time">Full-time</option>
							<option value="Part-time">Part-time</option>
						</select>

						<select
							value={data.filters.scheme ?? ''}
							onchange={(e) => handleFilterChange('scheme', (e.target as HTMLSelectElement).value)}
							class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						>
							<option value="">All Schemes</option>
							<option value="Undergraduate">Undergraduate</option>
							<option value="Postgraduate">Postgraduate</option>
						</select>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<select
							value={data.filters.sort ?? ''}
							onchange={(e) => handleFilterChange('sort', (e.target as HTMLSelectElement).value)}
							class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						>
							<option value="">Sort: A-Z</option>
							<option value="university">Sort: University</option>
						</select>

						<input
							type="number"
							placeholder="My UCAS points"
							bind:value={myUcasPoints}
							oninput={handleUcasInput}
							min="0"
							max="168"
							class="w-full appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-700 transition-all outline-none placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
								{hasUcasFilter ? 'border-primary-400 ring-1 ring-primary-200' : ''}"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<p class="mb-4 text-sm text-surface-500">
		Showing {data.courses.length} of {data.total.toLocaleString()} courses
		{#if data.page > 1}(page {data.page}){/if}
	</p>

	{#if data.courses.length > 0}
		<div class="overflow-x-auto rounded-lg border border-surface-200">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-surface-200 bg-surface-50">
						<th class="w-[72px] px-2 py-3"></th>
						<th class="px-4 py-3 text-left font-semibold text-surface-600">Course</th>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 sm:table-cell"
							>University</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 md:table-cell"
							>Qualification</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 md:table-cell"
							>Mode</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 lg:table-cell"
							>Duration</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 lg:table-cell"
							>Entry</th
						>
						<th class="hidden px-4 py-3 text-right font-semibold text-surface-600 xl:table-cell"
							>Salary</th
						>
						{#if hasUcasFilter}
							<th class="hidden px-4 py-3 text-center font-semibold text-surface-600 sm:table-cell"
								>Eligibility</th
							>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each data.courses as course (course.slug)}
						<tr class="group border-b border-surface-100 transition-colors hover:bg-surface-50/50">
							<td class="px-2 py-3">
								<div class="flex items-center gap-1">
									<button
										onclick={() =>
											toggleShortlist({
												slug: course.slug,
												title: course.title,
												universityName: course.universityName,
												universitySlug: course.universitySlug,
												qualification: course.qualification,
												studyMode: course.studyMode
											})}
										class="rounded p-1 transition-colors {$shortlist.some(
											(i) => i.slug === course.slug
										)
											? 'text-red-500 hover:text-red-600'
											: 'text-surface-300 hover:text-red-400'}"
										aria-label="{$shortlist.some((i) => i.slug === course.slug)
											? 'Remove from'
											: 'Add to'} shortlist"
									>
										<svg
											class="h-4 w-4"
											fill={$shortlist.some((i) => i.slug === course.slug)
												? 'currentColor'
												: 'none'}
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
											/>
										</svg>
									</button>
									<button
										onclick={() => toggleCompare(course.slug)}
										class="rounded p-1 transition-colors {$compareList.includes(course.slug)
											? 'text-primary-600 hover:text-primary-700'
											: 'text-surface-300 hover:text-primary-500'}"
										aria-label="{$compareList.includes(course.slug)
											? 'Remove from'
											: 'Add to'} comparison"
									>
										<svg
											class="h-4 w-4"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
											/>
										</svg>
									</button>
								</div>
							</td>
							<td class="px-4 py-3">
								<a
									href="/courses/{course.slug}"
									class="font-medium text-surface-800 transition-colors group-hover:text-primary-600"
									onclick={() =>
										posthog.capture('course_clicked', {
											course_title: course.title,
											course_slug: course.slug,
											university: course.universityName,
											qualification: course.qualification,
											source: 'courses_listing'
										})}
								>
									{course.title}
								</a>
								<span class="mt-0.5 block text-xs text-surface-400 sm:hidden"
									>{course.universityName}</span
								>
							</td>
							<td class="hidden px-4 py-3 sm:table-cell">
								<a
									href="/universities/{course.universitySlug}"
									class="text-surface-600 transition-colors hover:text-primary-600"
								>
									{course.universityName}
								</a>
							</td>
							<td class="hidden px-4 py-3 md:table-cell">
								<Badge label={course.qualification} variant="primary" />
							</td>
							<td class="hidden px-4 py-3 text-surface-600 md:table-cell">{course.studyMode}</td>
							<td class="hidden px-4 py-3 text-surface-600 lg:table-cell"
								>{course.duration || '—'}</td
							>
							<td class="hidden px-4 py-3 lg:table-cell">
								{#if isValidReq(course.entryRequirements.aLevel)}
									<span class="font-medium text-surface-700">{course.entryRequirements.aLevel}</span
									>
								{:else if isValidReq(course.entryRequirements.ucasPoints)}
									<span class="text-surface-600">{course.entryRequirements.ucasPoints} pts</span>
								{:else}
									<span class="text-surface-400">—</span>
								{/if}
							</td>
							<td class="hidden px-4 py-3 text-right tabular-nums xl:table-cell">
								{#if course.averageGraduateSalary}
									<span class="text-surface-700">{formatSalary(course.averageGraduateSalary)}</span>
								{:else}
									<span class="text-surface-400">—</span>
								{/if}
							</td>
							{#if hasUcasFilter}
								{@const elig = getEligibility(course)}
								<td class="hidden px-4 py-3 text-center sm:table-cell">
									{#if elig}
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {eligibilityConfig[
												elig
											].class}"
										>
											{eligibilityConfig[elig].label}
										</span>
									{:else}
										<span class="text-xs text-surface-400">N/A</span>
									{/if}
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<div class="mt-8 flex items-center justify-center gap-2">
				<button
					onclick={() => goToPage(data.page - 1)}
					disabled={data.page <= 1}
					class="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Previous
				</button>
				<span class="px-3 text-sm text-surface-500">
					Page {data.page} of {totalPages}
				</span>
				<button
					onclick={() => goToPage(data.page + 1)}
					disabled={data.page >= totalPages}
					class="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Next
				</button>
			</div>
		{/if}
	{:else}
		<div class="py-16 text-center">
			<p class="text-lg text-surface-500">No courses match your filters</p>
			<p class="mt-2 text-sm text-surface-400">Try adjusting your search or filter criteria</p>
		</div>
	{/if}
</div>

<!-- Floating compare bar -->
{#if $compareCount > 0}
	<div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
		<div
			class="flex items-center gap-3 rounded-full border border-surface-200 bg-white px-5 py-3 shadow-lg"
		>
			<span class="text-sm font-medium text-surface-700"
				>{$compareCount} course{$compareCount > 1 ? 's' : ''} selected</span
			>
			<a
				href="/compare?courses={$compareList.join(',')}"
				class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
			>
				Compare
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
		</div>
	</div>
{/if}
