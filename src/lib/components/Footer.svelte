<script lang="ts">
	const exploreLinks = [
		{ label: 'Universities', href: '/universities' },
		{ label: 'Courses', href: '/courses' },
		{ label: 'Academics', href: '#' },
		{ label: 'Research', href: '#' }
	];

	const dataSourceLinks = [
		{ label: 'UCAS', href: '#' },
		{ label: 'HESA', href: '#' },
		{ label: 'REF 2021', href: '#' },
		{ label: 'UKRI', href: '#' }
	];
</script>

<footer class="bg-surface-900 text-surface-300">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Column 1: Branding -->
			<div>
				<h3 class="text-white font-bold text-lg">UniversityDB</h3>
				<p class="mt-2 text-surface-400 text-sm leading-relaxed">
					The comprehensive directory of UK university courses, academics, and research.
				</p>
			</div>

			<!-- Column 2: Explore -->
			<div>
				<h4 class="text-surface-200 font-semibold text-sm uppercase tracking-wider mb-3">
					Explore
				</h4>
				<ul class="flex flex-col gap-2">
					{#each exploreLinks as link}
						<li>
							<a
								href={link.href}
								class="text-surface-400 hover:text-white transition-colors text-sm"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Column 3: Data Sources -->
			<div>
				<h4 class="text-surface-200 font-semibold text-sm uppercase tracking-wider mb-3">
					Data Sources
				</h4>
				<ul class="flex flex-col gap-2">
					{#each dataSourceLinks as link}
						<li>
							<a
								href={link.href}
								class="text-surface-400 hover:text-white transition-colors text-sm"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="border-t border-surface-700/50 mt-10 pt-6">
			<p class="text-surface-500 text-sm">
				&copy; 2026 UniversityDB. Built with open data.
			</p>
		</div>
	</div>
</footer>
