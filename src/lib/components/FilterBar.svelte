<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';

	let {
		searchPlaceholder = 'Search...',
		filters = [],
		onFilterChange = undefined,
		onSearchChange = undefined
	}: {
		searchPlaceholder?: string;
		filters?: Array<{
			key: string;
			label: string;
			options: Array<{ value: string; label: string }>;
		}>;
		onFilterChange?: ((filters: Record<string, string>) => void) | undefined;
		onSearchChange?: ((query: string) => void) | undefined;
	} = $props();

	let filterValues: Record<string, string> = $state({});

	function handleSearchInput(query: string) {
		onSearchChange?.(query);
	}

	function handleFilterChange(key: string, value: string) {
		filterValues[key] = value;
		onFilterChange?.({ ...filterValues });
	}
</script>

<div class="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200 py-4">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
			<div class="w-full sm:max-w-xs">
				<SearchBar placeholder={searchPlaceholder} onSearch={handleSearchInput} />
			</div>
			<div class="flex flex-wrap gap-2">
				{#each filters as filter}
					<select
						class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
						value={filterValues[filter.key] ?? ''}
						onchange={(e) =>
							handleFilterChange(filter.key, (e.target as HTMLSelectElement).value)}
					>
						<option value="">{filter.label}</option>
						{#each filter.options as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				{/each}
			</div>
		</div>
	</div>
</div>
