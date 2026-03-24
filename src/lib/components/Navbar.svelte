<script lang="ts">
	let mobileMenuOpen = $state(false);
	let tooltipLink = $state<string | null>(null);
	let tooltipTimeout = $state<ReturnType<typeof setTimeout> | null>(null);

	const navLinks = [
		{ label: 'Universities', href: '/universities', disabled: false },
		{ label: 'Courses', href: '/courses', disabled: false },
		{ label: 'Academics', href: '#', disabled: true },
		{ label: 'Research', href: '#', disabled: true }
	];

	function showTooltip(label: string) {
		if (tooltipTimeout) clearTimeout(tooltipTimeout);
		tooltipLink = label;
		tooltipTimeout = setTimeout(() => {
			tooltipLink = null;
		}, 1200);
	}
</script>

<nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-surface-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="text-xl font-bold text-surface-900">
				University<span class="text-primary-500">DB</span>
			</a>

			<!-- Center nav links (desktop) -->
			<div class="hidden md:flex items-center gap-8">
				{#each navLinks as link}
					<div class="relative">
						{#if link.disabled}
							<button
								type="button"
								class="text-sm font-medium opacity-50 cursor-not-allowed text-surface-600"
								onclick={() => showTooltip(link.label)}
							>
								{link.label}
							</button>
							{#if tooltipLink === link.label}
								<div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-surface-800 text-white text-xs font-medium whitespace-nowrap shadow-lg animate-fade-in">
									Data not pulled yet
									<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-800 rotate-45"></div>
								</div>
							{/if}
						{:else}
							<a
								href={link.href}
								class="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors"
							>
								{link.label}
							</a>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Right side -->
			<div class="flex items-center gap-2">
				<!-- Search icon (desktop) -->
				<button
					class="hidden md:flex items-center justify-center w-9 h-9 text-surface-400 hover:text-primary-600 transition-colors"
					aria-label="Search"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
				</button>

				<!-- Hamburger button (mobile) -->
				<button
					class="md:hidden flex items-center justify-center w-9 h-9 text-surface-600 hover:text-primary-600 transition-colors"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						{#if mobileMenuOpen}
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						{:else}
							<line x1="4" y1="8" x2="20" y2="8"></line>
							<line x1="4" y1="12" x2="20" y2="12"></line>
							<line x1="4" y1="16" x2="20" y2="16"></line>
						{/if}
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile dropdown panel -->
	{#if mobileMenuOpen}
		<div class="md:hidden bg-white border-b border-surface-200 px-4 py-4 flex flex-col gap-3">
			{#each navLinks as link}
				{#if link.disabled}
					<button
						type="button"
						class="text-sm font-medium text-left opacity-50 text-surface-600 flex items-center gap-2"
						onclick={() => showTooltip(link.label)}
					>
						{link.label}
						{#if tooltipLink === link.label}
							<span class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
								Data not pulled yet
							</span>
						{/if}
					</button>
				{:else}
					<a
						href={link.href}
						class="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors"
						onclick={() => (mobileMenuOpen = false)}
					>
						{link.label}
					</a>
				{/if}
			{/each}
		</div>
	{/if}
</nav>
