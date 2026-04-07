<script lang="ts">
	import CourseCard from '$lib/components/CourseCard.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let { data } = $props();

	let subject = $derived(data.subject);
	let courses = $derived(data.courses);
	let totalCourses = $derived(data.totalCourses);
	let topUniversities = $derived(data.topUniversities);
	let relatedSubjects = $derived(data.relatedSubjects);
	let page = $derived(data.page);
	let totalPages = $derived(data.totalPages);

	let seoTitle = $derived(
		`${subject.name} Courses UK \u2014 ${totalCourses.toLocaleString()} Degrees`
	);
	let seoDescription = $derived(
		`Browse ${totalCourses.toLocaleString()} ${subject.name} courses across UK universities. Compare entry requirements, graduate salaries, and student satisfaction. Find your ideal ${subject.name} degree.`
	);

	function getTefVariant(rating: string | null): 'gold' | 'silver' | 'bronze' | 'default' {
		if (rating === 'Gold') return 'gold';
		if (rating === 'Silver') return 'silver';
		if (rating === 'Bronze') return 'bronze';
		return 'default';
	}
</script>

<Seo title={seoTitle} description={seoDescription} />

<Breadcrumb items={[{ name: 'Subjects', href: '/subjects' }, { name: subject.name }]} />

<!-- Hero -->
<section class="bg-gradient-to-b from-primary-50 to-white">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<h1 class="text-3xl font-bold text-surface-900 sm:text-4xl">
			{subject.name} Courses
		</h1>
		<p class="mt-3 text-lg text-surface-500">
			Browse {totalCourses.toLocaleString()}
			{subject.name} courses across UK universities
		</p>
	</div>
</section>

<!-- Main Content -->
<section class="py-12 sm:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
			<!-- Left Column — Course listing -->
			<div class="lg:col-span-2">
				<div class="mb-6 flex items-center justify-between">
					<p class="text-sm text-surface-500">
						{totalCourses.toLocaleString()} courses found
					</p>
				</div>

				{#if courses.length > 0}
					<div class="grid grid-cols-1 gap-4">
						{#each courses as course}
							<CourseCard {course} />
						{/each}
					</div>

					<!-- Pagination -->
					{#if totalPages > 1}
						<nav class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
							{#if page > 1}
								<a
									href="?page={page - 1}"
									class="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:border-primary-300 hover:text-primary-600"
								>
									Previous
								</a>
							{/if}
							<span class="text-sm text-surface-500">
								Page {page} of {totalPages}
							</span>
							{#if page < totalPages}
								<a
									href="?page={page + 1}"
									class="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:border-primary-300 hover:text-primary-600"
								>
									Next
								</a>
							{/if}
						</nav>
					{/if}
				{:else}
					<p class="text-sm text-surface-400 italic">No courses found</p>
				{/if}
			</div>

			<!-- Right Column — Sidebar -->
			<div class="lg:col-span-1">
				<div class="space-y-6 lg:sticky lg:top-24">
					<!-- Top Universities -->
					{#if topUniversities.length > 0}
						<div class="rounded-card border border-surface-200 bg-white p-6 shadow-card">
							<h3 class="mb-4 text-lg font-semibold text-surface-900">
								Top Universities for {subject.name}
							</h3>
							<div class="space-y-3">
								{#each topUniversities as uni}
									<a
										href="/universities/{uni.slug}"
										class="flex items-center justify-between rounded-lg border border-surface-100 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/30"
									>
										<div class="min-w-0">
											<p class="truncate text-sm font-medium text-surface-800">{uni.name}</p>
											<div class="mt-1 flex items-center gap-2">
												{#if uni.town}
													<span class="text-xs text-surface-400">{uni.town}</span>
												{/if}
												{#if uni.tefRating}
													<Badge
														label="TEF {uni.tefRating}"
														variant={getTefVariant(uni.tefRating)}
													/>
												{/if}
											</div>
										</div>
										<span class="ml-2 flex-shrink-0 text-xs text-surface-400">
											{uni.courseCount} courses
										</span>
									</a>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Related Subjects -->
					{#if relatedSubjects.length > 0}
						<div class="rounded-card border border-surface-200 bg-white p-6 shadow-card">
							<h3 class="mb-4 text-lg font-semibold text-surface-900">Related Subjects</h3>
							<div class="flex flex-wrap gap-2">
								{#each relatedSubjects as related}
									<a
										href="/subjects/{related.slug}"
										class="rounded-full border border-surface-200 px-3 py-1.5 text-sm text-surface-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
									>
										{related.name}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
