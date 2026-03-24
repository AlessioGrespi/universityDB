<script lang="ts">
	import UniversityCard from '$lib/components/UniversityCard.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			updateFilters({ q: searchInput.trim() || undefined });
		}, 300);
	}

	function handleFilterChange(key: string, value: string) {
		updateFilters({ [key]: value || undefined });
	}
</script>

<svelte:head>
	<title>Universities | UniversityDB</title>
</svelte:head>

<div class="py-12 sm:py-16 px-4 bg-gradient-to-b from-primary-50 to-white">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-3xl sm:text-4xl font-bold text-surface-900">Universities</h1>
		<p class="text-lg text-surface-500 mt-3 max-w-2xl">
			Explore {data.universities.length} UK universities, from ancient institutions to modern innovators
		</p>
	</div>
</div>

<div class="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
		<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
			<div class="w-full sm:max-w-xs">
				<input
					type="text"
					placeholder="Search universities..."
					bind:value={searchInput}
					oninput={handleSearchInput}
					class="w-full appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-surface-400"
				/>
			</div>

			<select
				value={data.filters.tef ?? ''}
				onchange={(e) => handleFilterChange('tef', (e.target as HTMLSelectElement).value)}
				class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
			>
				<option value="">All TEF Ratings</option>
				<option value="Gold">Gold</option>
				<option value="Silver">Silver</option>
				<option value="Bronze">Bronze</option>
			</select>

			<select
				value={data.filters.group ?? ''}
				onchange={(e) => handleFilterChange('group', (e.target as HTMLSelectElement).value)}
				class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
			>
				<option value="">All Groups</option>
				<option value="Russell Group">Russell Group</option>
				<option value="University Alliance">University Alliance</option>
			</select>

			<select
				value={data.filters.region ?? ''}
				onchange={(e) => handleFilterChange('region', (e.target as HTMLSelectElement).value)}
				class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
			>
				<option value="">All Regions</option>
				{#each data.filterOptions.regions as region}
					<option value={region}>{region}</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<p class="text-sm text-surface-500 mb-6">
		Showing {data.universities.length} universities
	</p>

	{#if data.universities.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.universities as university (university.slug)}
				<UniversityCard {university} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-16">
			<p class="text-surface-500 text-lg">No universities match your filters</p>
			<p class="text-surface-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
		</div>
	{/if}
</div>
