<script lang="ts">
	const exploreLinks = [
		{ label: 'Universities', href: '/universities' },
		{ label: 'Courses', href: '/courses' }
	];

	const dataSourceLinks = [
		{ label: 'UCAS', href: 'https://www.ucas.com' },
		{ label: 'HESA', href: 'https://www.hesa.ac.uk' },
		{ label: 'REF 2021', href: 'https://results2021.ref.ac.uk' },
		{ label: 'UKRI (GtR)', href: 'https://gtr.ukri.org' },
		{ label: 'OpenAlex', href: 'https://openalex.org' }
	];
</script>

<footer class="bg-surface-900 text-surface-300">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<!-- Column 1: Branding -->
			<div>
				<h3 class="text-lg font-bold text-white">UniversityDB</h3>
				<p class="mt-2 text-sm leading-relaxed text-surface-400">
					The comprehensive directory of UK university courses, academics, and research.
				</p>
			</div>

			<!-- Column 2: Explore -->
			<div>
				<h4 class="mb-3 text-sm font-semibold tracking-wider text-surface-200 uppercase">
					Explore
				</h4>
				<ul class="flex flex-col gap-2">
					{#each exploreLinks as link}
						<li>
							<a
								href={link.href}
								class="text-sm text-surface-400 transition-colors hover:text-white"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Column 3: Data Sources -->
			<div>
				<h4 class="mb-3 text-sm font-semibold tracking-wider text-surface-200 uppercase">
					Data Sources
				</h4>
				<ul class="flex flex-col gap-2">
					{#each dataSourceLinks as link}
						<li>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 text-sm text-surface-400 transition-colors hover:text-white"
							>
								{link.label}
								<svg
									class="h-3 w-3 opacity-50"
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
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="mt-10 border-t border-surface-700/50 pt-6">
			<p class="text-sm text-surface-500">
				&copy; {new Date().getFullYear()} UniversityDB. Built with open data. A
				<a
					href="https://grespi.tech"
					target="_blank"
					rel="noopener noreferrer"
					class="text-surface-400 transition-colors hover:text-white">Grespi Technology</a
				> project.
			</p>
		</div>
	</div>
</footer>
