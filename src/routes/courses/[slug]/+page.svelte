<script lang="ts">
	import type { Course, University } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { BASE_URL } from '$lib/config';
	import { shortlist, toggleShortlist } from '$lib/stores/shortlist';
	import { compareList, toggleCompare } from '$lib/stores/compare';

	let { data } = $props();

	let course = $derived(data.course);
	let university = $derived(data.university);
	let relatedCourses = $derived(data.relatedCourses);

	function isValidReq(val: string | undefined): boolean {
		return !!val && val !== 'See entry requirements' && val !== 'N/A';
	}

	let validUcasPoints = $derived(
		isValidReq(course.entryRequirements.ucasPoints) ? course.entryRequirements.ucasPoints : null
	);

	let validScottishHigher = $derived(
		isValidReq(course.entryRequirements.scottishHigher)
			? course.entryRequirements.scottishHigher
			: null
	);
	let validScottishAdvancedHigher = $derived(
		isValidReq(course.entryRequirements.scottishAdvancedHigher)
			? course.entryRequirements.scottishAdvancedHigher
			: null
	);
	let validBtec = $derived(
		isValidReq(course.entryRequirements.btec) ? course.entryRequirements.btec : null
	);

	let hasStats = $derived(
		!!course.nssScore ||
			!!course.averageGraduateSalary ||
			!!course.entryRequirements.aLevel ||
			!!validUcasPoints
	);

	let hasRequirements = $derived(
		!!course.entryRequirements.aLevel ||
			!!validUcasPoints ||
			!!validScottishHigher ||
			!!validScottishAdvancedHigher ||
			!!validBtec
	);

	let displayQualification = $derived(course.fullQualification || course.qualification);

	let hasSocCodes = $derived(!!course.socCodes && course.socCodes.length > 0);

	// Deduplicate study options by unique combo of studyMode + duration + qualification + location
	let uniqueOptions = $derived.by(() => {
		if (!course.allOptions || course.allOptions.length <= 1) return [];
		const seen = new Set<string>();
		return course.allOptions.filter((opt) => {
			const key = `${opt.studyMode}|${opt.duration}|${opt.qualification}|${opt.campusLocation ?? ''}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	});
	let hasMultipleOptions = $derived(uniqueOptions.length > 1);

	let seoDescription = $derived(
		`${displayQualification} in ${course.title} at ${course.universityName}. ${course.studyMode}${course.duration ? `, ${course.duration}` : ''}. ${course.entryRequirements.aLevel ? `Entry: ${course.entryRequirements.aLevel}. ` : ''}${course.averageGraduateSalary ? `Avg. graduate salary: \u00A3${course.averageGraduateSalary.toLocaleString('en-GB')}.` : ''}`
	);

	// UCAS click-through disabled — course IDs in the DB are broken
	// let courseUrl = $derived(
	// 	course.ucasCourseId
	// 		? `https://www.ucas.com/explore/search/providers/courses/${course.ucasCourseId}`
	// 		: university
	// 			? ensureUrl(university.website)
	// 			: '#'
	// );
	let courseUrl = $derived(university ? ensureUrl(university.website) : '#');

	function formatSalary(n: number): string {
		return '\u00A3' + n.toLocaleString('en-GB');
	}

	function tefVariant(rating: string | null): 'gold' | 'silver' | 'bronze' | 'default' {
		if (rating === 'Gold') return 'gold';
		if (rating === 'Silver') return 'silver';
		if (rating === 'Bronze') return 'bronze';
		return 'default';
	}

	function ensureUrl(url: string): string {
		if (!url) return '#';
		if (url.startsWith('http://') || url.startsWith('https://')) return url;
		return 'https://' + url;
	}

	// Simple markdown-to-html for course descriptions
	function renderDescription(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\n\n/g, '</p><p class="mt-4">')
			.replace(/\n- /g, '</p><li class="ml-4 list-disc">')
			.replace(/\n\n/g, '</p><p>');
	}

	function jsonLdTag(data: Record<string, unknown>): string {
		return `<script type="application/ld+json">${JSON.stringify(data)}<\/script>`;
	}

	let courseJsonLd = $derived(
		jsonLdTag({
			'@context': 'https://schema.org',
			'@type': 'Course',
			name: course.title,
			description: course.description || seoDescription,
			url: `${BASE_URL}/courses/${course.slug}`,
			inLanguage: 'en',
			provider: {
				'@type': 'EducationalOrganization',
				name: course.universityName,
				url: university ? ensureUrl(university.website) : undefined
			},
			educationalLevel: course.scheme,
			educationalCredentialAwarded: displayQualification,
			timeRequired: course.duration || undefined,
			courseMode: course.studyMode || undefined,
			...(course.subjects.length > 0
				? { about: course.subjects.map((s) => ({ '@type': 'Thing', name: s })) }
				: {}),
			...(course.averageGraduateSalary
				? {
						occupationalCredentialAwarded: {
							'@type': 'EducationalOccupationalCredential',
							credentialCategory: displayQualification
						},
						hasCourseInstance: {
							'@type': 'CourseInstance',
							courseMode: course.studyMode,
							courseWorkload: course.duration
						}
					}
				: {}),
			offers: {
				'@type': 'Offer',
				category: course.scheme,
				availability: 'https://schema.org/InStock'
			}
		})
	);

	let breadcrumbItems = $derived([
		{ name: 'Courses', href: '/courses' },
		{ name: course.universityName, href: `/universities/${course.universitySlug}` },
		{ name: course.title }
	]);
</script>

<Seo title="{displayQualification} {course.title} at {course.universityName}" description={seoDescription} />

<svelte:head>
	{@html courseJsonLd}
</svelte:head>

<!-- Hero / Header -->
<section class="bg-gradient-to-b from-primary-50 to-white">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<Breadcrumb items={breadcrumbItems} />

		<!-- Title -->
		<h1 class="mt-4 text-3xl font-bold text-surface-900 sm:text-4xl">
			{course.title}
		</h1>

		<!-- University link -->
		<a
			href="/universities/{course.universitySlug}"
			class="mt-2 inline-block text-lg font-medium text-primary-600 transition-colors hover:text-primary-700"
		>
			{course.universityName}
		</a>

		<!-- Action buttons -->
		<div class="mt-4 flex items-center gap-2">
			<button
				onclick={() =>
					toggleShortlist({
						slug: course.slug,
						title: course.title,
						universityName: course.universityName,
						universitySlug: course.universitySlug,
						qualification: course.qualification,
						studyMode: course.studyMode
					})}
				class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors
					{$shortlist.some((i) => i.slug === course.slug)
					? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
					: 'border-surface-300 bg-white text-surface-700 hover:border-red-300 hover:text-red-600'}"
			>
				<svg
					class="h-4 w-4"
					fill={$shortlist.some((i) => i.slug === course.slug) ? 'currentColor' : 'none'}
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
					/>
				</svg>
				{$shortlist.some((i) => i.slug === course.slug) ? 'Shortlisted' : 'Shortlist'}
			</button>
			<button
				onclick={() => toggleCompare(course.slug)}
				class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors
					{$compareList.includes(course.slug)
					? 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100'
					: 'border-surface-300 bg-white text-surface-700 hover:border-primary-300 hover:text-primary-600'}"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
					/>
				</svg>
				{$compareList.includes(course.slug) ? 'Added to Compare' : 'Compare'}
			</button>
		</div>

		<!-- Badges -->
		<div class="mt-4 flex flex-wrap gap-2">
			<Badge
				label={course.scheme}
				variant={course.scheme === 'Postgraduate' ? 'primary' : 'default'}
			/>
			{#if course.scheme === 'Undergraduate (Integrated Masters)'}
				<Badge label="4+ Year Degree" variant="default" />
			{/if}
			<Badge label={course.qualification} variant="primary" />
			{#if course.studyMode}
				<Badge label={course.studyMode} variant="default" />
			{/if}
			{#if course.duration}
				<Badge label={course.duration} variant="default" />
			{/if}
			{#each course.subjects as subject}
				<Badge label={subject} variant="default" />
			{/each}
		</div>
	</div>
</section>

<!-- Key Stats Bar -->
{#if hasStats}
	<section class="border-b border-surface-100 py-8">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex flex-wrap gap-8 sm:gap-12">
				{#if course.entryRequirements.aLevel}
					<div>
						<p class="text-xs font-medium tracking-wider text-surface-400 uppercase">
							A-Level Entry
						</p>
						<p class="mt-1 text-2xl font-bold text-surface-900">
							{course.entryRequirements.aLevel}
						</p>
					</div>
				{/if}
				{#if validUcasPoints}
					<div>
						<p class="text-xs font-medium tracking-wider text-surface-400 uppercase">UCAS Points</p>
						<p class="mt-1 text-2xl font-bold text-surface-900">
							{validUcasPoints}
						</p>
					</div>
				{/if}
				{#if course.nssScore}
					<div>
						<p class="text-xs font-medium tracking-wider text-surface-400 uppercase">NSS Score</p>
						<p class="mt-1 text-2xl font-bold text-surface-900">{course.nssScore}%</p>
					</div>
				{/if}
				{#if course.averageGraduateSalary}
					<div>
						<p class="text-xs font-medium tracking-wider text-surface-400 uppercase">
							Avg. Graduate Salary
						</p>
						<p class="mt-1 text-2xl font-bold text-surface-900">
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
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
			<!-- Left Column -->
			<div class="lg:col-span-2">
				<!-- About -->
				{#if course.description}
					<div>
						<h2 class="mb-4 text-xl font-semibold text-surface-900">About this course</h2>
						<div class="prose prose-sm max-w-none leading-relaxed text-surface-600">
							{@html renderDescription(course.description)}
						</div>
					</div>
				{/if}

				<!-- Entry Requirements -->
				{#if hasRequirements}
					<div class="mt-10">
						<h2 class="mb-4 text-xl font-semibold text-surface-900">Entry Requirements</h2>
						<div class="rounded-card border border-surface-200 bg-surface-50 p-6">
							{#if course.entryRequirements.aLevel}
								<div class="flex items-center justify-between border-b border-surface-200 py-3">
									<span class="text-sm text-surface-600">A-Level Grades</span>
									<span class="text-sm font-semibold text-surface-900"
										>{course.entryRequirements.aLevel}</span
									>
								</div>
							{/if}
							{#if validUcasPoints}
								<div class="flex items-center justify-between border-b border-surface-200 py-3">
									<span class="text-sm text-surface-600">UCAS Tariff Points</span>
									<span class="text-sm font-semibold text-surface-900">{validUcasPoints}</span>
								</div>
							{/if}
							{#if validScottishHigher}
								<div class="flex items-center justify-between border-b border-surface-200 py-3">
									<span class="text-sm text-surface-600">Scottish Higher</span>
									<span class="text-sm font-semibold text-surface-900">{validScottishHigher}</span>
								</div>
							{/if}
							{#if validScottishAdvancedHigher}
								<div class="flex items-center justify-between border-b border-surface-200 py-3">
									<span class="text-sm text-surface-600">Scottish Advanced Higher</span>
									<span class="text-sm font-semibold text-surface-900"
										>{validScottishAdvancedHigher}</span
									>
								</div>
							{/if}
							{#if validBtec}
								<div class="flex items-center justify-between py-3">
									<span class="text-sm text-surface-600">BTEC</span>
									<span class="text-sm font-semibold text-surface-900">{validBtec}</span>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Study Options -->
				{#if hasMultipleOptions}
					<div class="mt-10">
						<h2 class="mb-4 text-xl font-semibold text-surface-900">Study Options</h2>
						<p class="mb-4 text-sm text-surface-500">
							This course is available in {uniqueOptions.length} study options:
						</p>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{#each uniqueOptions as opt}
								<div
									class="rounded-card border border-surface-200 bg-surface-50 p-4
									{opt.studyMode === course.studyMode ? 'border-primary-300 bg-primary-50/30' : ''}"
								>
									<div class="mb-2 flex items-center gap-2">
										<span class="text-sm font-semibold text-surface-900">{opt.studyMode}</span>
										{#if opt.studyMode === course.studyMode}
											<span class="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700"
												>Shown above</span
											>
										{/if}
									</div>
									<div class="space-y-1 text-sm text-surface-600">
										<p><span class="text-surface-400">Duration:</span> {opt.duration}</p>
										<p><span class="text-surface-400">Qualification:</span> {opt.qualification}</p>
										{#if opt.campusLocation}
											<p><span class="text-surface-400">Location:</span> {opt.campusLocation}</p>
										{/if}
										{#if opt.averageGraduateSalary}
											<p>
												<span class="text-surface-400">Avg. Salary:</span>
												{formatSalary(opt.averageGraduateSalary)}
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Career Prospects (SOC Codes) -->
				{#if hasSocCodes}
					<div class="mt-10">
						<h2 class="mb-4 text-xl font-semibold text-surface-900">Career Prospects</h2>
						<p class="mb-4 text-sm text-surface-500">
							Graduates from this course typically go into the following occupations:
						</p>
						<div class="space-y-3">
							{#each course.socCodes!.slice(0, 6) as soc}
								<div class="flex items-center gap-3">
									<span
										class="rounded bg-surface-100 px-2 py-0.5 font-mono text-xs text-surface-400"
										>{soc.code}</span
									>
									<span class="text-sm text-surface-700">{soc.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Related Courses -->
				{#if relatedCourses.length > 0}
					<div class="mt-10">
						<h2 class="mb-6 text-xl font-semibold text-surface-900">Related Courses</h2>
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
						<h3 class="mb-4 text-lg font-semibold text-surface-900">Course Details</h3>

						<dl>
							<div class="border-b border-surface-100 py-3">
								<dt class="text-sm text-surface-500">Qualification</dt>
								<dd class="mt-0.5 text-sm font-medium text-surface-800">
									{displayQualification}
								</dd>
							</div>
							{#if course.studyMode}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Study Mode</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{course.studyMode}
									</dd>
								</div>
							{/if}
							{#if course.duration}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Duration</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{course.duration}
									</dd>
								</div>
							{/if}
							{#if course.startDate}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Start Date</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{course.startDate}
									</dd>
								</div>
							{/if}
							{#if course.academicYear}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Academic Year</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{course.academicYear}
									</dd>
								</div>
							{/if}
							{#if course.campusLocation}
								<div class="border-b border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Campus / Location</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{course.campusLocation}
									</dd>
								</div>
							{/if}
							<div class="border-b border-surface-100 py-3">
								<dt class="text-sm text-surface-500">Scheme</dt>
								<dd class="mt-0.5 text-sm font-medium text-surface-800">
									{course.scheme}
								</dd>
							</div>
							{#if course.subjects.length > 0}
								<div class="py-3">
									<dt class="text-sm text-surface-500">Subjects</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{course.subjects.join(', ')}
									</dd>
								</div>
							{/if}
							{#if course.averageGraduateSalary}
								<div class="border-t border-surface-100 py-3">
									<dt class="text-sm text-surface-500">Avg. Graduate Salary</dt>
									<dd class="mt-0.5 text-sm font-medium text-surface-800">
										{formatSalary(course.averageGraduateSalary)}
									</dd>
								</div>
							{/if}
						</dl>

						<!-- University mini-card -->
						<div class="mt-6 border-t border-surface-200 pt-6">
							<p class="mb-3 text-sm text-surface-500">Offered by</p>
							{#if university}
								<a
									href="/universities/{course.universitySlug}"
									class="block rounded-lg border border-surface-200 bg-surface-50 p-4 transition-all hover:border-primary-300 hover:bg-white"
								>
									<p class="font-medium text-surface-800">{university.name}</p>
									{#if university.town}
										<p class="mt-1 text-sm text-surface-500">{university.town}</p>
									{/if}
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
									class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
								>
									View university profile
									<svg
										class="h-4 w-4"
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
								href={courseUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
							>
								<svg
									class="h-4 w-4"
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
								Visit university website
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
