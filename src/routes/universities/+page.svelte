<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';

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
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			updateFilters({ q: searchInput.trim() || undefined });
		}, 250);
	}

	function handleFilterChange(key: string, value: string) {
		updateFilters({ [key]: value || undefined });
	}

	const tefVariantMap: Record<string, 'gold' | 'silver' | 'bronze'> = {
		Gold: 'gold',
		Silver: 'silver',
		Bronze: 'bronze'
	};

	function formatNumber(n: number): string {
		return n.toLocaleString('en-GB');
	}

	let isSearching = $derived(!!$navigating);

	let filtersOpen = $state(false);
	let activeFilterCount = $derived(
		[
			data.filters.type,
			data.filters.tef,
			data.filters.group,
			data.filters.region,
			data.filters.sort
		].filter(Boolean).length
	);
</script>

<Seo
	title="UK Universities & Institutions — Browse {data.universities.length}+ Institutions"
	description="Browse UK universities, colleges, and institutions. Compare TEF ratings, student counts, research output, and entry requirements. Find your perfect university."
/>

<div class="bg-gradient-to-b from-primary-50 to-white px-4 py-8 sm:py-12">
	<div class="mx-auto max-w-7xl">
		<h1 class="text-3xl font-bold text-surface-900 sm:text-4xl">Universities & Institutions</h1>
		<p class="mt-2 max-w-2xl text-lg text-surface-500">
			Explore {data.universities.length} UK {data.filters.type === 'university'
				? 'universities'
				: data.filters.type === 'college'
					? 'colleges'
					: data.filters.type === 'conservatoire'
						? 'conservatoires'
						: 'institutions'}
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
					placeholder="Search universities..."
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
					value={data.filters.type ?? ''}
					onchange={(e) => handleFilterChange('type', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All Types</option>
					<option value="university">Universities</option>
					<option value="college">Colleges</option>
					<option value="conservatoire">Conservatoires</option>
					<option value="other">Other</option>
				</select>

				<select
					value={data.filters.tef ?? ''}
					onchange={(e) => handleFilterChange('tef', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All TEF Ratings</option>
					<option value="Gold">Gold</option>
					<option value="Silver">Silver</option>
					<option value="Bronze">Bronze</option>
				</select>

				<select
					value={data.filters.group ?? ''}
					onchange={(e) => handleFilterChange('group', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All Groups</option>
					<option value="Russell Group">Russell Group</option>
					<option value="University Alliance">University Alliance</option>
				</select>

				<select
					value={data.filters.region ?? ''}
					onchange={(e) => handleFilterChange('region', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">All Regions</option>
					{#each data.filterOptions.regions as region}
						<option value={region}>{region}</option>
					{/each}
				</select>

				<select
					value={data.filters.sort ?? ''}
					onchange={(e) => handleFilterChange('sort', (e.target as HTMLSelectElement).value)}
					class="cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
				>
					<option value="">Sort: A-Z</option>
					<option value="students">Sort: Most Students</option>
					<option value="founded">Sort: Oldest First</option>
					<option value="research">Sort: Most Cited</option>
				</select>
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
					<div class="grid grid-cols-2 gap-2">
						<select
							value={data.filters.type ?? ''}
							onchange={(e) => handleFilterChange('type', (e.target as HTMLSelectElement).value)}
							class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						>
							<option value="">All Types</option>
							<option value="university">Universities</option>
							<option value="college">Colleges</option>
							<option value="conservatoire">Conservatoires</option>
							<option value="other">Other</option>
						</select>

						<select
							value={data.filters.tef ?? ''}
							onchange={(e) => handleFilterChange('tef', (e.target as HTMLSelectElement).value)}
							class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						>
							<option value="">All TEF Ratings</option>
							<option value="Gold">Gold</option>
							<option value="Silver">Silver</option>
							<option value="Bronze">Bronze</option>
						</select>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<select
							value={data.filters.group ?? ''}
							onchange={(e) => handleFilterChange('group', (e.target as HTMLSelectElement).value)}
							class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						>
							<option value="">All Groups</option>
							<option value="Russell Group">Russell Group</option>
							<option value="University Alliance">University Alliance</option>
						</select>

						<select
							value={data.filters.region ?? ''}
							onchange={(e) => handleFilterChange('region', (e.target as HTMLSelectElement).value)}
							class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
						>
							<option value="">All Regions</option>
							{#each data.filterOptions.regions as region}
								<option value={region}>{region}</option>
							{/each}
						</select>
					</div>

					<select
						value={data.filters.sort ?? ''}
						onchange={(e) => handleFilterChange('sort', (e.target as HTMLSelectElement).value)}
						class="w-full cursor-pointer appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 transition-all outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
					>
						<option value="">Sort: A-Z</option>
						<option value="students">Sort: Most Students</option>
						<option value="founded">Sort: Oldest First</option>
						<option value="research">Sort: Most Cited</option>
					</select>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<p class="mb-4 text-sm text-surface-500">
		{data.universities.length}
		{data.filters.type === 'university'
			? 'universities'
			: data.filters.type === 'college'
				? 'colleges'
				: data.filters.type === 'conservatoire'
					? 'conservatoires'
					: 'institutions'}
	</p>

	{#if data.universities.length > 0}
		<div class="overflow-x-auto rounded-lg border border-surface-200">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-surface-200 bg-surface-50">
						<th class="px-4 py-3 text-left font-semibold text-surface-600">University</th>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 sm:table-cell"
							>Location</th
						>
						<th class="hidden px-4 py-3 text-right font-semibold text-surface-600 md:table-cell"
							>Students</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 md:table-cell"
							>TEF</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 lg:table-cell"
							>Groups</th
						>
						<th class="hidden px-4 py-3 text-right font-semibold text-surface-600 lg:table-cell"
							>Founded</th
						>
					</tr>
				</thead>
				<tbody>
					{#each data.universities as uni (uni.slug)}
						<tr class="group border-b border-surface-100 transition-colors hover:bg-surface-50/50">
							<td class="px-4 py-3">
								<a
									href="/universities/{uni.slug}"
									class="font-medium text-surface-800 transition-colors group-hover:text-primary-600"
								>
									{uni.name}
								</a>
								<span class="mt-0.5 block text-xs text-surface-400 sm:hidden"
									>{uni.town || 'UK'}</span
								>
							</td>
							<td class="hidden px-4 py-3 text-surface-600 sm:table-cell">{uni.town || '—'}</td>
							<td class="hidden px-4 py-3 text-right text-surface-600 tabular-nums md:table-cell">
								{uni.studentCount ? formatNumber(uni.studentCount) : '—'}
							</td>
							<td class="hidden px-4 py-3 md:table-cell">
								{#if uni.tefRating && tefVariantMap[uni.tefRating]}
									<Badge label={uni.tefRating} variant={tefVariantMap[uni.tefRating]} />
								{:else}
									<span class="text-surface-400">—</span>
								{/if}
							</td>
							<td class="hidden px-4 py-3 lg:table-cell">
								{#if uni.groups.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each uni.groups as group}
											<Badge label={group} variant="primary" />
										{/each}
									</div>
								{:else}
									<span class="text-surface-400">—</span>
								{/if}
							</td>
							<td class="hidden px-4 py-3 text-right text-surface-600 tabular-nums lg:table-cell">
								{uni.foundedYear ?? '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="py-16 text-center">
			<p class="text-lg text-surface-500">No universities match your filters</p>
			<p class="mt-2 text-sm text-surface-400">Try adjusting your search or filter criteria</p>
		</div>
	{/if}
</div>
