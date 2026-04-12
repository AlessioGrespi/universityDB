<script lang="ts">
	import { page } from '$app/stores';
	import { commandPaletteOpen } from '$lib/stores/search';
	import { shortlist, shortlistCount } from '$lib/stores/shortlist';
	import { compareList, compareCount } from '$lib/stores/compare';

	let mobileMenuOpen = $state(false);
	function openSearch() {
		$commandPaletteOpen = true;
	}

	const navLinks = [
		{ label: 'Universities', href: '/universities' },
		{ label: 'Courses', href: '/courses' },
		{ label: 'Quiz', href: '/quiz' }
	];

	function isActive(href: string): boolean {
		return $page.url.pathname.startsWith(href);
	}
</script>

<nav class="fixed top-0 z-50 w-full border-b border-surface-200 bg-white/80 backdrop-blur-md">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<a href="/" class="text-xl font-bold text-surface-900">
				University<span class="text-primary-500">DB</span>
			</a>

			<!-- Center nav links (desktop) -->
			<div class="hidden items-center gap-8 md:flex">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-sm font-medium transition-colors {isActive(link.href)
							? 'border-b-2 border-primary-500 pb-0.5 text-primary-600'
							: 'text-surface-600 hover:text-primary-600'}"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Right side -->
			<div class="flex items-center gap-2">
				<!-- GitHub link -->
				<a
					href="https://github.com/AlessioGrespi/universityDB"
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-all hover:bg-surface-50 hover:text-surface-900"
					aria-label="View on GitHub"
				>
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						/>
					</svg>
				</a>

				<!-- Search button (desktop) -->
				<button
					onclick={() => openSearch()}
					class="hidden cursor-pointer items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm text-surface-400 transition-all hover:border-surface-300 hover:text-surface-600 md:flex"
					aria-label="Search"
				>
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<span>Search...</span>
					<kbd
						class="ml-2 rounded border border-surface-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-surface-400"
					>
						&#8984;K
					</kbd>
				</button>

				<!-- Shortlist button -->
				<a
					href="/shortlist"
					class="relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-all hover:bg-surface-50 hover:text-primary-600"
					aria-label="Shortlist"
				>
					<svg
						class="h-5 w-5"
						fill="none"
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
					{#if $shortlistCount > 0}
						<span
							class="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary-600 text-[10px] leading-none font-bold text-white"
						>
							{$shortlistCount}
						</span>
					{/if}
				</a>

				<!-- Compare button -->
				{#if $compareCount > 0}
					<a
						href="/compare?courses={$compareList.join(',')}"
						class="hidden items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 md:flex"
						aria-label="Compare courses"
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
								d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
							/>
						</svg>
						Compare ({$compareCount})
					</a>
				{/if}

				<!-- Hamburger button (mobile) -->
				<button
					class="flex h-9 w-9 items-center justify-center text-surface-600 transition-colors hover:text-primary-600 md:hidden"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
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
		<div class="flex flex-col gap-3 border-b border-surface-200 bg-white px-4 py-4 md:hidden">
			<!-- Mobile search button -->
			<button
				onclick={() => {
					mobileMenuOpen = false;
					openSearch();
				}}
				class="flex items-center gap-2 text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				Search...
			</button>
			{#each navLinks as link}
				<a
					href={link.href}
					class="text-sm font-medium transition-colors {isActive(link.href)
						? 'font-semibold text-primary-600'
						: 'text-surface-600 hover:text-primary-600'}"
					onclick={() => (mobileMenuOpen = false)}
				>
					{link.label}
				</a>
			{/each}
			<a
				href="/shortlist"
				class="flex items-center gap-2 text-sm font-medium transition-colors {isActive('/shortlist')
					? 'font-semibold text-primary-600'
					: 'text-surface-600 hover:text-primary-600'}"
				onclick={() => (mobileMenuOpen = false)}
			>
				Shortlist
				{#if $shortlistCount > 0}
					<span
						class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white"
					>
						{$shortlistCount}
					</span>
				{/if}
			</a>
			{#if $compareCount > 0}
				<a
					href="/compare?courses={$compareList.join(',')}"
					class="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
					onclick={() => (mobileMenuOpen = false)}
				>
					Compare ({$compareCount})
				</a>
			{/if}
			<a
				href="https://github.com/AlessioGrespi/universityDB"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 text-sm font-medium text-surface-600 transition-colors hover:text-surface-900"
				onclick={() => (mobileMenuOpen = false)}
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
					/>
				</svg>
				GitHub
			</a>
		</div>
	{/if}
</nav>
