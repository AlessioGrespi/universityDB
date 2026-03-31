<script lang="ts">
	import type { University, Course } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();

	let university = $derived(data.university);
	let courses = $derived(data.courses);
	let totalCourses = $derived(data.totalCourses);

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

	function getTefVariant(rating: string | null): 'gold' | 'silver' | 'bronze' | 'default' {
		if (rating === 'Gold') return 'gold';
		if (rating === 'Silver') return 'silver';
		if (rating === 'Bronze') return 'bronze';
		return 'default';
	}

	// Research metrics below this threshold are likely incomplete data imports
	const MIN_CREDIBLE_WORKS = 100;

	function hasCredibleResearchData(uni: University): boolean {
		return !!uni.worksCount && uni.worksCount >= MIN_CREDIBLE_WORKS;
	}

	function getAboutText(uni: University): string[] {
		const paragraphs: string[] = [];
		const parts: string[] = [];

		if (uni.town) parts.push(`located in ${uni.town}`);
		if (uni.foundedYear) parts.push(`founded in ${uni.foundedYear}`);

		const intro =
			parts.length > 0
				? `${uni.name} is a higher education institution ${parts.join(', ')}.`
				: `${uni.name} is a UK higher education institution.`;

		const studentText = uni.studentCount
			? ` It has approximately ${uni.studentCount.toLocaleString()} students.`
			: '';
		const tefText = uni.tefRating
			? ` It holds a ${uni.tefRating} TEF rating for teaching excellence.`
			: '';

		paragraphs.push(`${intro}${studentText}${tefText}`);

		if (hasCredibleResearchData(uni)) {
			const metrics: string[] = [];
			if (uni.worksCount) metrics.push(`${uni.worksCount.toLocaleString()} publications`);
			if (uni.citedByCount) metrics.push(`${uni.citedByCount.toLocaleString()} citations`);
			if (uni.hIndex) metrics.push(`an h-index of ${uni.hIndex}`);
			const groupText =
				uni.groups.length > 0
					? ` As a member of the ${uni.groups.join(' and ')}, it is recognised for its commitment to research and academic excellence.`
					: '';
			paragraphs.push(
				`The university has produced ${metrics.join(', ')}, reflecting its research output.${groupText}`
			);
		} else if (uni.groups.length > 0) {
			paragraphs.push(
				`As a member of the ${uni.groups.join(' and ')}, it is recognised for its commitment to research and academic excellence.`
			);
		}

		return paragraphs;
	}

	let aboutText = $derived(getAboutText(university));
	let logoColor = $derived(getColorFromName(university.name));
	let initial = $derived(university.name.charAt(0));
	let hasLogo = $derived(!!university.logoUrl);
	let logoFailed = $state(false);

	let showResearch = $derived(hasCredibleResearchData(university));
	let hasStats = $derived(!!university.studentCount || showResearch || !!university.foundedYear);

	let seoDescription = $derived(
		`${university.name}${university.town ? ` in ${university.town}` : ''}, UK. ${university.studentCount ? `${university.studentCount.toLocaleString()} students. ` : ''}${university.tefRating ? `TEF ${university.tefRating}. ` : ''}Browse ${totalCourses} courses, entry requirements, and research output.`
	);

	function ensureUrl(url: string): string {
		if (!url) return '#';
		if (url.startsWith('http://') || url.startsWith('https://')) return url;
		return 'https://' + url;
	}

	function jsonLdTag(data: Record<string, unknown>): string {
		return `<script type="application/ld+json">${JSON.stringify(data)}<\/script>`;
	}

	let uniJsonLd = $derived(
		jsonLdTag({
			'@context': 'https://schema.org',
			'@type': 'EducationalOrganization',
			name: university.name,
			url: university.website ? ensureUrl(university.website) : undefined,
			logo: university.logoUrl || undefined,
			description: aboutText.join(' '),
			foundingDate: university.foundedYear ? String(university.foundedYear) : undefined,
			address: {
				'@type': 'PostalAddress',
				streetAddress: university.address || undefined,
				addressLocality: university.town || undefined,
				postalCode: university.postcode || undefined,
				addressCountry: 'GB'
			},
			...(university.lat && university.lng
				? {
						geo: {
							'@type': 'GeoCoordinates',
							latitude: university.lat,
							longitude: university.lng
						}
					}
				: {}),
			...(university.contactEmail ? { email: university.contactEmail } : {}),
			...(university.contactPhone ? { telephone: university.contactPhone } : {}),
			...(university.tefRating
				? {
						hasCredential: {
							'@type': 'EducationalOccupationalCredential',
							credentialCategory: 'TEF Rating',
							name: `Teaching Excellence Framework: ${university.tefRating}`
						}
					}
				: {}),
			numberOfStudents: university.studentCount || undefined
		})
	);

	let breadcrumbJsonLd = $derived(
		jsonLdTag({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Universities', item: '/universities' },
				{ '@type': 'ListItem', position: 2, name: university.name }
			]
		})
	);
</script>

<Seo
	title="{university.name} — Courses, Entry Requirements & Stats"
	description={seoDescription}
	image={university.logoUrl || undefined}
	imageAlt="{university.name} logo"
/>

<svelte:head>
	{@html uniJsonLd}
	{@html breadcrumbJsonLd}
</svelte:head>

<!-- Hero / Header -->
<section class="bg-gradient-to-b from-primary-50 to-white">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<!-- Breadcrumb -->
		<nav class="text-sm text-surface-400">
			<a href="/universities" class="text-primary-600 hover:text-primary-700">Universities</a>
			<span class="mx-1">/</span>
			<span>{university.name}</span>
		</nav>

		<!-- University header -->
		<div class="mt-6 flex items-start gap-6">
			<!-- Logo -->
			{#if hasLogo && !logoFailed}
				<div
					class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-white p-2"
				>
					<img
						src={university.logoUrl}
						alt="{university.name} logo"
						class="max-h-full max-w-full object-contain"
						onerror={() => (logoFailed = true)}
					/>
				</div>
			{:else}
				<div
					class="h-20 w-20 flex-shrink-0 rounded-xl {logoColor} flex items-center justify-center text-3xl font-bold text-white"
				>
					{initial}
				</div>
			{/if}

			<!-- Info -->
			<div class="min-w-0">
				<h1 class="text-3xl font-bold text-surface-900 sm:text-4xl">
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
					<!-- Map pin + location -->
					{#if university.town || university.address}
						<span class="inline-flex items-center gap-1.5">
							<svg
								class="h-4 w-4 text-surface-400"
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
							{university.address || university.town}
						</span>
					{/if}

					<!-- Calendar + founded -->
					{#if university.foundedYear}
						<span class="inline-flex items-center gap-1.5">
							<svg
								class="h-4 w-4 text-surface-400"
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
					{/if}

					<!-- Link + website -->
					{#if university.website}
						<a
							href={ensureUrl(university.website)}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-primary-600 hover:underline"
						>
							<svg
								class="h-4 w-4"
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
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Key Stats -->
{#if hasStats}
	<section class="border-b border-surface-100 py-10">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
				{#if university.studentCount}
					<StatCard value={university.studentCount.toLocaleString()} label="Students" />
				{/if}
				{#if showResearch && university.worksCount}
					<StatCard value={university.worksCount.toLocaleString()} label="Publications" />
				{/if}
				{#if showResearch && university.citedByCount}
					<StatCard value={university.citedByCount.toLocaleString()} label="Citations" />
				{/if}
				{#if showResearch && university.hIndex}
					<StatCard value={String(university.hIndex)} label="h-index" />
				{/if}
				{#if university.foundedYear}
					<StatCard value={String(university.foundedYear)} label="Founded" />
				{/if}
				<StatCard value={String(totalCourses)} label="Courses" />
			</div>
		</div>
	</section>
{/if}

<!-- Main Content -->
<section class="py-12 sm:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
			<!-- Left column -->
			<div class="lg:col-span-2">
				<!-- About -->
				<div>
					<h2 class="mb-4 text-xl font-semibold text-surface-900">About</h2>
					<div class="space-y-4 leading-relaxed text-surface-600">
						{#each aboutText as paragraph}
							<p>{paragraph}</p>
						{/each}
					</div>
				</div>

				<!-- Courses -->
				<div class="mt-10">
					<h2 class="mb-6 text-xl font-semibold text-surface-900">
						Courses at {university.name} ({totalCourses})
					</h2>

					{#if courses.length > 0}
						<div class="grid grid-cols-1 gap-4">
							{#each courses as course}
								<CourseCard {course} />
							{/each}
						</div>
						{#if totalCourses > courses.length}
							<a
								href="/courses?university={university.slug}"
								class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
							>
								View all {totalCourses} courses
								<svg
									class="h-4 w-4"
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
						{/if}
					{:else}
						<p class="text-sm text-surface-400 italic">No courses listed yet</p>
					{/if}
				</div>
			</div>

			<!-- Right column — Sidebar -->
			<div class="lg:col-span-1">
				<div class="lg:sticky lg:top-24">
					<div class="rounded-card border border-surface-200 bg-white p-6 shadow-card">
						<h3 class="mb-4 text-lg font-semibold text-surface-900">Quick Facts</h3>

						<dl>
							{#if university.town}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Location</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{university.town}
									</dd>
								</div>
							{/if}
							{#if university.postcode}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Postcode</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{university.postcode}
									</dd>
								</div>
							{/if}
							{#if university.country}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Country</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{university.country === 'GB' ? 'United Kingdom' : university.country}
									</dd>
								</div>
							{/if}
							{#if university.foundedYear}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Founded</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{university.foundedYear}
									</dd>
								</div>
							{/if}
							{#if university.studentCount}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Student Count</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{university.studentCount.toLocaleString()}
									</dd>
								</div>
							{/if}
							{#if university.tefRating}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">TEF Rating</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{university.tefRating}
									</dd>
								</div>
							{/if}
							{#if university.groups.length > 0}
								<div class="py-3">
									<dt class="text-sm text-surface-500">Groups</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{university.groups.join(', ')}
									</dd>
								</div>
							{/if}
						</dl>

						<!-- Contact -->
						<div class="mt-6 border-t border-surface-200 pt-6">
							<h3 class="mb-3 text-lg font-semibold text-surface-900">Contact</h3>

							{#if university.contactEmail}
								<p class="mb-3 text-sm text-surface-600">
									<a
										href="mailto:{university.contactEmail}"
										class="text-primary-600 hover:underline"
									>
										{university.contactEmail}
									</a>
								</p>
							{/if}

							{#if university.contactPhone}
								<p class="mb-3 text-sm text-surface-600">{university.contactPhone}</p>
							{/if}

							{#if university.website}
								<a
									href={ensureUrl(university.website)}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
								>
									<svg
										class="h-4 w-4"
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
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
