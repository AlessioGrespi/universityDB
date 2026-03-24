<script lang="ts">
	import type { University, Course } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	let { data } = $props();

	let university = $derived(data.university);
	let courses = $derived(data.courses);

	const colors = [
		'bg-primary-500',
		'bg-blue-500',
		'bg-emerald-500',
		'bg-amber-500',
		'bg-rose-500',
		'bg-cyan-500',
		'bg-violet-500',
		'bg-orange-500'
	];

	function getColorFromName(name: string): string {
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}

	function getTefVariant(
		rating: string | null
	): 'gold' | 'silver' | 'bronze' | 'default' {
		if (rating === 'Gold') return 'gold';
		if (rating === 'Silver') return 'silver';
		if (rating === 'Bronze') return 'bronze';
		return 'default';
	}

	function getAboutText(uni: University): string[] {
		const tefText = uni.tefRating
			? ` It holds a ${uni.tefRating} TEF rating for teaching excellence.`
			: '';
		const groupText =
			uni.groups.length > 0
				? ` As a member of the ${uni.groups.join(' and ')}, it is recognised for its commitment to research and academic excellence.`
				: '';
		return [
			`The ${uni.name} is a prestigious institution located in ${uni.region}, founded in ${uni.foundedYear}. With over ${uni.studentCount.toLocaleString()} students, it is one of the leading universities in the United Kingdom.${tefText}`,
			`The university has produced ${uni.totalPublications.toLocaleString()} publications with an h-index of ${uni.hIndex}, reflecting its strong research output.${groupText}`
		];
	}

	let aboutText = $derived(getAboutText(university));
	let logoColor = $derived(getColorFromName(university.name));
	let initial = $derived(university.name.charAt(0));
</script>

<svelte:head>
	<title>{university.name} — UniversityDB</title>
</svelte:head>

<!-- Hero / Header -->
<section class="bg-gradient-to-b from-primary-50 to-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
		<!-- Breadcrumb -->
		<nav class="text-sm text-surface-400">
			<a href="/universities" class="text-primary-600 hover:text-primary-700">Universities</a>
			<span class="mx-1">/</span>
			<span>{university.name}</span>
		</nav>

		<!-- University header -->
		<div class="mt-6 flex gap-6 items-start">
			<!-- Logo placeholder -->
			<div
				class="flex-shrink-0 w-20 h-20 rounded-full {logoColor} flex items-center justify-center text-white text-3xl font-bold"
			>
				{initial}
			</div>

			<!-- Info -->
			<div class="min-w-0">
				<h1 class="text-3xl sm:text-4xl font-bold text-surface-900">
					{university.name}
				</h1>

				<!-- Badges -->
				<div class="mt-3 flex flex-wrap gap-2">
					{#if university.tefRating}
						<Badge
							label="TEF {university.tefRating}"
							variant={getTefVariant(university.tefRating)}
						/>
					{/if}
					{#each university.groups as group}
						<Badge label={group} variant="primary" />
					{/each}
				</div>

				<!-- Info row -->
				<div class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-surface-500">
					<!-- Map pin + address -->
					<span class="inline-flex items-center gap-1.5">
						<svg
							class="w-4 h-4 text-surface-400"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
							/>
						</svg>
						{university.address}
					</span>

					<!-- Calendar + founded -->
					<span class="inline-flex items-center gap-1.5">
						<svg
							class="w-4 h-4 text-surface-400"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
							/>
						</svg>
						Founded {university.foundedYear}
					</span>

					<!-- Link + website -->
					<a
						href={university.website}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 text-primary-600 hover:underline"
					>
						<svg
							class="w-4 h-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
							/>
						</svg>
						{university.website.replace(/^https?:\/\//, '')}
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Key Stats -->
<section class="py-10 border-b border-surface-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-8">
			<StatCard value={university.studentCount.toLocaleString()} label="Students" />
			<StatCard value={university.totalPublications.toLocaleString()} label="Publications" />
			<StatCard value={String(university.hIndex)} label="h-index" />
			<StatCard value={String(university.foundedYear)} label="Founded" />
		</div>
	</div>
</section>

<!-- Main Content -->
<section class="py-12 sm:py-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
			<!-- Left column -->
			<div class="lg:col-span-2">
				<!-- About -->
				<div>
					<h2 class="text-xl font-semibold text-surface-900 mb-4">About</h2>
					<div class="text-surface-600 leading-relaxed space-y-4">
						{#each aboutText as paragraph}
							<p>{paragraph}</p>
						{/each}
					</div>
				</div>

				<!-- Courses -->
				<div class="mt-10">
					<h2 class="text-xl font-semibold text-surface-900 mb-6">
						Courses at {university.name} ({courses.length})
					</h2>

					{#if courses.length > 0}
						<div class="grid grid-cols-1 gap-4">
							{#each courses as course}
								<CourseCard {course} />
							{/each}
						</div>
						<a
							href="/courses?university={university.slug}"
							class="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm mt-4"
						>
							View all courses
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
								/>
							</svg>
						</a>
					{:else}
						<p class="text-surface-400 text-sm italic">No courses listed yet</p>
					{/if}
				</div>
			</div>

			<!-- Right column — Sidebar -->
			<div class="lg:col-span-1">
				<div class="lg:sticky lg:top-24">
					<div class="rounded-card border border-surface-200 bg-white p-6 shadow-card">
						<h3 class="text-lg font-semibold text-surface-900 mb-4">Quick Facts</h3>

						<dl>
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Region</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{university.region}
								</dd>
							</div>
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Postcode</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{university.postcode}
								</dd>
							</div>
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Founded</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{university.foundedYear}
								</dd>
							</div>
							<div class="py-3 border-b border-surface-100">
								<dt class="text-sm text-surface-500">Student Count</dt>
								<dd class="text-sm font-medium text-surface-800 mt-0.5">
									{university.studentCount.toLocaleString()}
								</dd>
							</div>
							{#if university.tefRating}
								<div class="py-3 border-b border-surface-100">
									<dt class="text-sm text-surface-500">TEF Rating</dt>
									<dd class="text-sm font-medium text-surface-800 mt-0.5">
										{university.tefRating}
									</dd>
								</div>
							{/if}
							{#if university.groups.length > 0}
								<div class="py-3">
									<dt class="text-sm text-surface-500">Groups</dt>
									<dd class="text-sm font-medium text-surface-800 mt-0.5">
										{university.groups.join(', ')}
									</dd>
								</div>
							{/if}
						</dl>

						<!-- Contact -->
						<div class="mt-6 pt-6 border-t border-surface-200">
							<h3 class="text-lg font-semibold text-surface-900 mb-3">Contact</h3>

							{#if university.contactEmail}
								<p class="text-sm text-surface-600 mb-3">
									<a
										href="mailto:{university.contactEmail}"
										class="text-primary-600 hover:underline"
									>
										{university.contactEmail}
									</a>
								</p>
							{/if}

							{#if university.contactPhone}
								<p class="text-sm text-surface-600 mb-3">{university.contactPhone}</p>
							{/if}

							<a
								href={university.website}
								target="_blank"
								rel="noopener noreferrer"
								class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
									/>
								</svg>
								Visit website
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
