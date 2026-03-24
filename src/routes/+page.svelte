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
		content="Explore 50,000+ courses across 166 UK universities. Compare entry requirements, satisfaction scores, and graduate outcomes."
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
			Explore 50,000+ courses across 166 UK universities. Compare entry requirements, satisfaction
			scores, and graduate outcomes.
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
			<StatCard value={data.stats.courses} label="Courses" />
			<StatCard value={data.stats.academics} label="Academics" />
			<StatCard value={data.stats.researchProjects} label="Research Projects" />
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
						class="absolute right-4 top-4 text-primary-500 opacity-0 transition-opacity group-hover:opacity-100"
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
