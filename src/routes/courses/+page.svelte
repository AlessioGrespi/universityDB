<script lang="ts">
	import CourseCard from '$lib/components/CourseCard.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let searchInput = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Sync search input when data changes (e.g. navigating to this page with ?q=)
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
		// Reset to page 1 on filter change
		url.searchParams.delete('page');
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

	function goToPage(p: number) {
		const url = new URL($page.url);
		if (p > 1) {
			url.searchParams.set('page', String(p));
		} else {
			url.searchParams.delete('page');
		}
		goto(url.toString(), { replaceState: true });
	}

	let totalPages = $derived(Math.ceil(data.total / data.limit));
</script>

<svelte:head>
	<title>Courses | UniversityDB</title>
</svelte:head>

<div class="py-12 sm:py-16 px-4 bg-gradient-to-b from-primary-50 to-white">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-3xl sm:text-4xl font-bold text-surface-900">Courses</h1>
		<p class="text-lg text-surface-500 mt-3 max-w-2xl">
			Discover {data.total.toLocaleString()} courses across UK universities
		</p>
	</div>
</div>

<div class="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
		<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
			<div class="w-full sm:max-w-xs">
				<input
					type="text"
					placeholder="Search courses or universities..."
					bind:value={searchInput}
					oninput={handleSearchInput}
					class="w-full appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-surface-400"
				/>
			</div>

			<select
				value={data.filters.subject ?? ''}
				onchange={(e) => handleFilterChange('subject', (e.target as HTMLSelectElement).value)}
				class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
			>
				<option value="">All Subjects</option>
				{#each data.filterOptions.subjects as subject}
					<option value={subject.slug}>{subject.name}</option>
				{/each}
			</select>

			<select
				value={data.filters.qualification ?? ''}
				onchange={(e) => handleFilterChange('qualification', (e.target as HTMLSelectElement).value)}
				class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
			>
				<option value="">All Qualifications</option>
				{#each data.filterOptions.qualifications as qualification}
					<option value={qualification}>{qualification}</option>
				{/each}
			</select>

			<select
				value={data.filters.studyMode ?? ''}
				onchange={(e) => handleFilterChange('studyMode', (e.target as HTMLSelectElement).value)}
				class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
			>
				<option value="">All Study Modes</option>
				<option value="Full-time">Full-time</option>
				<option value="Part-time">Part-time</option>
			</select>

			<select
				value={data.filters.scheme ?? ''}
				onchange={(e) => handleFilterChange('scheme', (e.target as HTMLSelectElement).value)}
				class="appearance-none rounded-lg border border-surface-300 bg-white px-3 py-2 pr-8 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
			>
				<option value="">All Schemes</option>
				<option value="Undergraduate">Undergraduate</option>
				<option value="Postgraduate">Postgraduate</option>
			</select>
		</div>
	</div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<p class="text-sm text-surface-500 mb-6">
		Showing {data.courses.length} of {data.total.toLocaleString()} courses
		{#if data.page > 1}(page {data.page}){/if}
	</p>

	{#if data.courses.length > 0}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{#each data.courses as course (course.slug)}
				<CourseCard {course} />
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="flex justify-center items-center gap-2 mt-10">
				<button
					onclick={() => goToPage(data.page - 1)}
					disabled={data.page <= 1}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-surface-300 text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				>
					Previous
				</button>
				<span class="text-sm text-surface-500 px-3">
					Page {data.page} of {totalPages}
				</span>
				<button
					onclick={() => goToPage(data.page + 1)}
					disabled={data.page >= totalPages}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-surface-300 text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				>
					Next
				</button>
			</div>
		{/if}
	{:else}
		<div class="text-center py-16">
			<p class="text-surface-500 text-lg">No courses match your filters</p>
			<p class="text-surface-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
		</div>
	{/if}
</div>
