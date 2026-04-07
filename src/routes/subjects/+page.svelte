<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { data } = $props();

	let subjects = $derived(data.subjects);
	let totalCourses = $derived(subjects.reduce((sum, s) => sum + s.courseCount, 0));

	// Group subjects alphabetically
	let grouped = $derived.by(() => {
		const groups: Record<string, typeof subjects> = {};
		for (const s of subjects) {
			const letter = s.name.charAt(0).toUpperCase();
			if (!groups[letter]) groups[letter] = [];
			groups[letter].push(s);
		}
		return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
	});
</script>

<Seo
	title="Browse Subjects — UK University Courses"
	description="Explore all subject areas available across UK universities. Browse {totalCourses.toLocaleString()} courses by subject to find your ideal degree."
/>

<Breadcrumb items={[{ name: 'Subjects' }]} />

<!-- Hero -->
<section class="bg-gradient-to-b from-primary-50 to-white">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<h1 class="text-3xl font-bold text-surface-900 sm:text-4xl">Browse by Subject</h1>
		<p class="mt-3 text-lg text-surface-500">
			Explore {subjects.length} subject areas across {totalCourses.toLocaleString()} UK university courses
		</p>
	</div>
</section>

<!-- Subject Grid -->
<section class="py-12 sm:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		{#each grouped as [letter, group]}
			<div class="mb-10">
				<h2 class="mb-4 border-b border-surface-200 pb-2 text-lg font-bold text-surface-900">
					{letter}
				</h2>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each group as subject}
						<a
							href="/subjects/{subject.slug}"
							class="group flex items-center justify-between rounded-card border border-surface-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
						>
							<span class="text-sm font-medium text-surface-800 group-hover:text-primary-600">
								{subject.name}
							</span>
							<span class="text-xs text-surface-400">
								{subject.courseCount.toLocaleString()} courses
							</span>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>
