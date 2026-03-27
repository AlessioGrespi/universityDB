<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { commandPaletteOpen } from '$lib/stores/search';

	let query = $state('');
	let results = $state<{ universities: any[]; courses: any[]; subjects: any[] }>({
		universities: [],
		courses: [],
		subjects: []
	});
	let loading = $state(false);
	let selectedIndex = $state(0);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let inputEl = $state<HTMLInputElement>();

	// React to store changes
	$effect(() => {
		if ($commandPaletteOpen) {
			query = '';
			results = { universities: [], courses: [], subjects: [] };
			selectedIndex = 0;
			requestAnimationFrame(() => inputEl?.focus());
		}
	});

	function close() {
		$commandPaletteOpen = false;
	}

	let allItems = $derived([
		...results.universities.map((u: any) => ({
			type: 'university' as const,
			label: u.name,
			sublabel: u.town || '',
			href: `/universities/${u.slug}`
		})),
		...results.courses.map((c: any) => ({
			type: 'course' as const,
			label: c.title,
			sublabel: c.universityName,
			href: `/courses/${c.slug}`
		})),
		...results.subjects.map((s: any) => ({
			type: 'subject' as const,
			label: s.name,
			sublabel: `${s.courseCount} course${s.courseCount !== 1 ? 's' : ''}`,
			href: `/courses?subject=${s.slug}`
		}))
	]);

	function handleInput() {
		clearTimeout(debounceTimer);
		const q = query.trim();
		if (q.length < 2) {
			results = { universities: [], courses: [], subjects: [] };
			return;
		}
		loading = true;
		debounceTimer = setTimeout(async () => {
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
				if (res.ok) {
					results = await res.json();
					selectedIndex = 0;
				}
			} finally {
				loading = false;
			}
		}, 200);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, allItems.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' && allItems[selectedIndex]) {
			e.preventDefault();
			navigateTo(allItems[selectedIndex].href);
		} else if (e.key === 'Escape') {
			close();
		}
	}

	function navigateTo(href: string) {
		close();
		goto(href);
	}

	// Global keyboard listener for Cmd+K / Ctrl+K
	if (browser) {
		$effect(() => {
			function onKeydown(e: KeyboardEvent) {
				if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
					e.preventDefault();
					$commandPaletteOpen = !$commandPaletteOpen;
				}
			}
			window.addEventListener('keydown', onKeydown);
			return () => window.removeEventListener('keydown', onKeydown);
		});
	}
</script>

{#if $commandPaletteOpen}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
		onmousedown={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
	>
		<!-- Modal -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="mx-auto mt-[15vh] w-full max-w-xl px-4" onmousedown={(e) => e.stopPropagation()}>
			<div class="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-2xl">
				<!-- Search input -->
				<div class="flex items-center gap-3 border-b border-surface-100 px-4">
					<svg
						class="h-5 w-5 shrink-0 text-surface-400"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						bind:this={inputEl}
						bind:value={query}
						oninput={handleInput}
						onkeydown={handleKeydown}
						type="text"
						placeholder="Search universities and courses..."
						class="w-full bg-transparent py-4 text-base text-surface-900 outline-none placeholder:text-surface-400"
					/>
					<kbd
						class="hidden items-center gap-0.5 rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-[11px] font-medium text-surface-400 sm:inline-flex"
					>
						ESC
					</kbd>
				</div>

				<!-- Results -->
				{#if query.trim().length >= 2}
					<div class="max-h-80 overflow-y-auto py-2">
						{#if loading && allItems.length === 0}
							<div class="px-4 py-8 text-center text-sm text-surface-400">Searching...</div>
						{:else if allItems.length === 0 && !loading}
							<div class="px-4 py-8 text-center text-sm text-surface-400">
								No results for "{query}"
							</div>
						{:else}
							{#if results.universities.length > 0}
								<div class="px-3 py-1.5">
									<span class="text-[11px] font-semibold tracking-wider text-surface-400 uppercase"
										>Universities</span
									>
								</div>
								{#each results.universities as uni, i}
									{@const idx = i}
									<button
										class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors
											{selectedIndex === idx ? 'bg-primary-50 text-primary-700' : 'text-surface-700 hover:bg-surface-50'}"
										onmouseenter={() => (selectedIndex = idx)}
										onclick={() => navigateTo(`/universities/${uni.slug}`)}
									>
										<svg
											class="h-4 w-4 shrink-0 text-surface-400"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
											/>
										</svg>
										<div class="min-w-0">
											<p class="truncate text-sm font-medium">{uni.name}</p>
											{#if uni.town}
												<p class="truncate text-xs text-surface-400">{uni.town}</p>
											{/if}
										</div>
									</button>
								{/each}
							{/if}

							{#if results.courses.length > 0}
								<div
									class="px-3 py-1.5 {results.universities.length > 0
										? 'mt-1 border-t border-surface-100 pt-2.5'
										: ''}"
								>
									<span class="text-[11px] font-semibold tracking-wider text-surface-400 uppercase"
										>Courses</span
									>
								</div>
								{#each results.courses as course, i}
									{@const idx = results.universities.length + i}
									<button
										class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors
											{selectedIndex === idx ? 'bg-primary-50 text-primary-700' : 'text-surface-700 hover:bg-surface-50'}"
										onmouseenter={() => (selectedIndex = idx)}
										onclick={() => navigateTo(`/courses/${course.slug}`)}
									>
										<svg
											class="h-4 w-4 shrink-0 text-surface-400"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
											/>
										</svg>
										<div class="min-w-0">
											<p class="truncate text-sm font-medium">{course.title}</p>
											<p class="truncate text-xs text-surface-400">{course.universityName}</p>
										</div>
									</button>
								{/each}
							{/if}

							{#if results.subjects.length > 0}
								<div
									class="px-3 py-1.5 {results.universities.length > 0 || results.courses.length > 0
										? 'mt-1 border-t border-surface-100 pt-2.5'
										: ''}"
								>
									<span class="text-[11px] font-semibold tracking-wider text-surface-400 uppercase"
										>Subjects</span
									>
								</div>
								{#each results.subjects as subject, i}
									{@const idx = results.universities.length + results.courses.length + i}
									<button
										class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors
											{selectedIndex === idx ? 'bg-primary-50 text-primary-700' : 'text-surface-700 hover:bg-surface-50'}"
										onmouseenter={() => (selectedIndex = idx)}
										onclick={() => navigateTo(`/courses?subject=${subject.slug}`)}
									>
										<svg
											class="h-4 w-4 shrink-0 text-surface-400"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M6 6h.008v.008H6V6z"
											/>
										</svg>
										<div class="min-w-0">
											<p class="truncate text-sm font-medium">{subject.name}</p>
											<p class="truncate text-xs text-surface-400">
												{subject.courseCount} course{subject.courseCount !== 1 ? 's' : ''}
											</p>
										</div>
									</button>
								{/each}
							{/if}
						{/if}
					</div>
				{:else}
					<div class="px-4 py-8 text-center text-sm text-surface-400">
						Type to search universities and courses...
					</div>
				{/if}

				<!-- Footer hint -->
				<div
					class="flex items-center gap-4 border-t border-surface-100 px-4 py-2 text-[11px] text-surface-400"
				>
					<span class="inline-flex items-center gap-1">
						<kbd class="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-medium"
							>&uarr;</kbd
						>
						<kbd class="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-medium"
							>&darr;</kbd
						>
						navigate
					</span>
					<span class="inline-flex items-center gap-1">
						<kbd class="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-medium"
							>Enter</kbd
						>
						open
					</span>
					<span class="inline-flex items-center gap-1">
						<kbd class="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-medium"
							>Esc</kbd
						>
						close
					</span>
				</div>
			</div>
		</div>
	</div>
{/if}
