<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import UniversityCard from '$lib/components/UniversityCard.svelte';

	let { data } = $props();

	import { goto } from '$app/navigation';

	let searchValue = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleSearch(query: string) {
		clearTimeout(debounceTimer);
		if (query.trim()) {
			debounceTimer = setTimeout(() => {
				goto(`/courses?q=${encodeURIComponent(query.trim())}`);
			}, 500);
		}
	}

	function formatCount(count: number): string {
		return count.toLocaleString();
	}
</script>

<svelte:head>
	<title>UniversityDB - Discover Your Perfect University Course</title>
	<meta
		name="description"
		content="Explore courses across UK universities. Compare entry requirements, graduate outcomes, and career prospects."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-b from-surface-50 to-white">
	<div class="mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
		<h1 class="text-4xl font-extrabold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
			Discover Your
			<span class="text-primary-500">Perfect</span>
			<br />
			University Course
		</h1>

		<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-500 sm:text-xl">
			Explore {data.stats.courses} courses across {data.stats.universities} UK universities. Compare entry
			requirements, graduate outcomes, and career prospects.
		</p>

		<div class="mx-auto mt-8 max-w-2xl">
			<SearchBar
				placeholder="Search courses, universities, or subjects..."
				value={searchValue}
				onSearch={handleSearch}
				size="large"
			/>
		</div>

		<div class="mt-4 flex flex-wrap justify-center gap-2">
			{#each data.popularSubjects as subject}
				<a
					href="/courses?subject={subject.slug}"
					class="cursor-pointer rounded-full border border-surface-200 px-3 py-1.5 text-sm text-surface-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
				>
					{subject.name}
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Stats Bar -->
<section class="border-y border-surface-100 py-10">
	<div class="mx-auto max-w-5xl px-4">
		<div class="grid grid-cols-2 gap-8 md:grid-cols-4">
			<StatCard value={data.stats.universities} label="Universities" />
			<StatCard value={data.stats.institutions} label="Total Institutions" />
			<StatCard value={data.stats.courses} label="Courses" />
			<StatCard value={data.stats.subjects} label="Subjects" />
		</div>
	</div>
</section>

<!-- Quiz CTA -->
<section class="px-4 py-16 sm:py-20">
	<div class="mx-auto max-w-3xl">
		<div
			class="relative overflow-hidden rounded-card border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-8 sm:p-10"
		>
			<div class="text-center">
				<div class="mb-3 text-4xl">🎯</div>
				<h2 class="text-2xl font-bold text-surface-900 sm:text-3xl">Not sure where to start?</h2>
				<p class="mx-auto mt-3 max-w-md text-surface-500">
					Take our 90-second quiz and get personalised course recommendations based on your
					interests, grades, and priorities.
				</p>
				<a
					href="/quiz"
					class="mt-6 inline-flex items-center gap-2 rounded-button bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-card-hover"
				>
					Find Your Course
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Featured Universities -->
<section class="px-4 py-16 sm:py-20">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex items-end justify-between">
			<div>
				<h2 class="text-2xl font-bold text-surface-900 sm:text-3xl">Featured Universities</h2>
				<p class="mt-2 text-surface-500">Top-rated institutions across the UK</p>
			</div>
			<a
				href="/universities"
				class="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
			>
				Browse all universities &rarr;
			</a>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.featuredUniversities as university}
				<UniversityCard {university} />
			{/each}
		</div>
	</div>
</section>

<!-- Browse by Subject -->
<section class="bg-surface-50 px-4 py-16 sm:py-20">
	<div class="mx-auto max-w-7xl">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-surface-900 sm:text-3xl">Browse by Subject</h2>
			<p class="mt-2 text-surface-500">Find courses in your area of interest</p>
		</div>

		<div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{#each data.popularSubjects as subject}
				<a
					href="/courses?subject={subject.slug}"
					class="group relative rounded-card border border-surface-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
				>
					<span
						class="absolute top-4 right-4 text-primary-500 opacity-0 transition-opacity group-hover:opacity-100"
						>&rarr;</span
					>
					<span class="text-base font-semibold text-surface-800">{subject.name}</span>
					<span class="mt-1 block text-sm text-surface-500"
						>{formatCount(subject.courseCount)} courses</span
					>
				</a>
			{/each}
		</div>
	</div>
</section>
