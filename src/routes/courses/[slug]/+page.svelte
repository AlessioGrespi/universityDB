<script lang="ts">
	import type { Course, University } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';

	let { data } = $props();

	let course = $derived(data.course);
	let university = $derived(data.university);
	let relatedCourses = $derived(data.relatedCourses);

	let hasStats = $derived(
		!!course.nssScore ||
			!!course.averageGraduateSalary ||
			!!course.entryRequirements.aLevels ||
			!!course.entryRequirements.ucasTariff
	);

	let hasRequirements = $derived(
		!!course.entryRequirements.aLevels || !!course.entryRequirements.ucasTariff
	);

	function formatSalary(n: number): string {
		return '\u00A3' + n.toLocaleString('en-GB');
	}

	function tefVariant(
		rating: string | null
	): 'gold' | 'silver' | 'bronze' | 'default' {
		if (rating === 'Gold') return 'gold';
		if (rating === 'Silver') return 'silver';
		if (rating === 'Bronze') return 'bronze';
		return 'default';
	}
</script>

<svelte:head>
	<title>{course.title} at {course.universityName} | UniversityDB</title>
	<meta
		name="description"
		content="{course.qualification} in {course.title} at {course.universityName}. {course.studyMode}, {course.duration}."
	/>
</svelte:head>

<!-- Hero / Header -->
<section class="bg-gradient-to-b from-primary-50 to-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
		<!-- Breadcrumb -->
		<nav class="text-sm text-surface-400">
			<a href="/courses" class="text-primary-600 hover:text-primary-700 transition-colors"
				>Courses</a
			>
			<span class="mx-2">/</span>
			<span class="text-surface-600">{course.title}</span>
		</nav>

		<!-- Title -->
		<h1 class="mt-4 text-3xl sm:text-4xl font-bold text-surface-900">
			{course.title}
		</h1>

		<!-- University link -->
		<a
			href="/universities/{course.universitySlug}"
			class="mt-2 inline-block text-lg text-primary-600 hover:text-primary-700 font-medium transition-colors"
		>
			{course.universityName}
		</a>

		<!-- Badges -->
		<div class="mt-4 flex flex-wrap gap-2">
			<Badge
				label={course.scheme}
				variant={course.scheme === 'Postgraduate' ? 'primary' : 'default'}
			/>
			<Badge label={course.qualification} variant="primary" />
			<Badge label={course.studyMode} variant="default" />
			<Badge label={course.duration} variant="default" />
			{#each course.subjects as subject}
				<Badge label={subject} variant="default" />
			{/each}
		</div>
	</div>
</section>

<!-- Key Stats Bar -->
{#if hasStats}
	<section class="py-8 border-b border-surface-100">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-wrap gap-8 sm:gap-12">
				{#if course.entryRequirements.aLevels}
					<div>
						<p class="text-xs uppercase tracking-wider text-surface-400 font-medium">
							A-Level Entry
						</p>
						<p class="text-2xl font-bold text-surface-900 mt-1">
							{course.entryRequirements.aLevels}
						</p>
					</div>
				{/if}
				{#if course.entryRequirements.ucasTariff}
					<div>
						<p class="text-xs uppercase tracking-wider text-surface-400 font-medium">
							UCAS Tariff
						</p>
						<p class="text-2xl font-bold text-surface-900 mt-1">
							{course.entryRequirements.ucasTariff}
						</p>
					</div>
				{/if}
				{#if course.nssScore}
					<div>
						<p class="text-xs uppercase tracking-wider text-surface-400 font-medium">
							NSS Score
						</p>
						<p class="text-2xl font-bold text-surface-900 mt-1">{course.nssScore}%</p>
					</div>
				{/if}
				{#if course.averageGraduateSalary}
					<div>
						<p class="text-xs uppercase tracking-wider text-surface-400 font-medium">
							Avg. Graduate Salary
						</p>
						<p class="text-2xl font-bold text-surface-900 mt-1">
							{formatSalary(course.averageGraduateSalary)}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}

<!-- Main Content -->
<section class="py-12 sm:py-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
			<!-- Left Column -->
			<div class="lg:col-span-2">
				<!-- About -->
				<div>
					<h2 class="text-xl font-semibold text-surface-900 mb-4">About this course</h2>
					<p class="text-surface-600 leading-relaxed">{course.description}</p>
					<p class="text-surface-600 leading-relaxed mt-4">
						This {course.qualification} programme is offered by {course.universityName} and
						can be studied {course.studyMode.toLowerCase()} over {course.duration.toLowerCase()}.{#if course.startDate}
							The next intake begins in {course.startDate}.{/if}
					</p>
				</div>

				<!-- Entry Requirements -->
				{#if hasRequirements}
					<div class="mt-10">
						<h2 class="text-xl font-semibold text-surface-900 mb-4">
							Entry Requirements
						</h2>
						<div class="rounded-card border border-surface-200 bg-surface-50 p-6">
							{#if course.entryRequirements.aLevels}
								<div
									class="flex items-center justify-between py-3 {course.entryRequirements.ucasTariff ? 'border-b border-surface-200' : ''}"
								>
									<span class="text-sm text-surface-600">A-Level Grades</span>
									<span class="text-sm font-semibold text-surface-900"
										>{course.entryRequirements.aLevels}</span
									>
								</div>
							{/if}
							{#if course.entryRequirements.ucasTariff}
								<div class="flex items-center justify-between py-3">
									<span class="text-sm text-surface-600">UCAS Tariff Points</span>
									<span class="text-sm font-semibold text-surface-900"
										>{course.entryRequirements.ucasTariff}</span
									>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Related Courses -->
				{#if relatedCourses.length > 0}
					<div class="mt-10">
						<h2 class="text-xl font-semibold text-surface-900 mb-6">Related Courses</h2>
						<div class="grid grid-cols-1 gap-4">
							{#each relatedCourses as related}
								<CourseCard course={related} />
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Column — Sidebar -->
			<div class="lg:col-span-1">
				<div class="lg:sticky lg:top-24">
					<div class="rounded-card border border-surface-200 bg-white p-6 shadow-card">
						<h3 class="text-lg font-semibold text-surface-900 mb-4">Course Details</h3>

						<dl>
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Qualification</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{course.qualification}
								</dd>
							</div>
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Study Mode</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{course.studyMode}
								</dd>
							</div>
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Duration</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{course.duration}
								</dd>
							</div>
							{#if course.startDate}
								<div class="py-3 border-b border-surface-100">
									<dt class="text-sm text-surface-500">Start Date</dt>
									<dd class="text-sm font-medium text-surface-800 mt-0.5">
										{course.startDate}
									</dd>
								</div>
							{/if}
							{#if course.campusLocation}
								<div class="py-3 border-b border-surface-100">
									<dt class="text-sm text-surface-500">Campus / Location</dt>
									<dd class="text-sm font-medium text-surface-800 mt-0.5">
										{course.campusLocation}
									</dd>
								</div>
							{/if}
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Scheme</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{course.scheme}
								</dd>
							</div>
							<div class="py-3">
								<dt class="text-sm text-surface-500">Subjects</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{course.subjects.join(', ')}
								</dd>
							</div>
						</dl>

						<!-- University mini-card -->
						<div class="mt-6 pt-6 border-t border-surface-200">
							<p class="text-sm text-surface-500 mb-3">Offered by</p>
							{#if university}
								<a
									href="/universities/{course.universitySlug}"
									class="block rounded-lg border border-surface-200 bg-surface-50 p-4 hover:border-primary-300 hover:bg-white transition-all"
								>
									<p class="font-medium text-surface-800">{university.name}</p>
									<p class="text-sm text-surface-500 mt-1">{university.region}</p>
									{#if university.tefRating}
										<div class="mt-2">
											<Badge
												label="TEF {university.tefRating}"
												variant={tefVariant(university.tefRating)}
											/>
										</div>
									{/if}
								</a>
								<a
									href="/universities/{course.universitySlug}"
									class="text-primary-600 hover:text-primary-700 text-sm font-medium mt-3 inline-flex items-center gap-1"
								>
									View university profile
									<svg
										class="w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M13 7l5 5m0 0l-5 5m5-5H6"
										/>
									</svg>
								</a>
							{:else}
								<p class="text-sm text-surface-600">{course.universityName}</p>
							{/if}
						</div>

						<!-- Apply CTA -->
						<div class="mt-6">
							<a
								href={university?.website ?? '#'}
								target="_blank"
								rel="noopener noreferrer"
								class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
								Visit course page
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
