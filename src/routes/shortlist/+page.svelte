<script lang="ts">
	import { shortlist, removeFromShortlist, clearShortlist } from '$lib/stores/shortlist';
	import { compareList, toggleCompare, compareCount } from '$lib/stores/compare';
	import Badge from '$lib/components/Badge.svelte';
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
	title="My Shortlist"
	description="Your saved university courses shortlist on UniversityDB."
	noindex={true}
/>

<div class="bg-gradient-to-b from-primary-50 to-white px-4 py-8 sm:py-12">
	<div class="mx-auto max-w-7xl">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-surface-900 sm:text-4xl">My Shortlist</h1>
				<p class="mt-2 text-lg text-surface-500">
					{$shortlist.length} course{$shortlist.length !== 1 ? 's' : ''} saved
				</p>
			</div>
			{#if $shortlist.length > 0}
				<button
					onclick={() => clearShortlist()}
					class="text-sm text-surface-400 transition-colors hover:text-red-500"
				>
					Clear all
				</button>
			{/if}
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	{#if $shortlist.length > 0}
		<div class="overflow-x-auto rounded-lg border border-surface-200">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-surface-200 bg-surface-50">
						<th class="w-[72px] px-2 py-3"></th>
						<th class="px-4 py-3 text-left font-semibold text-surface-600">Course</th>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 sm:table-cell"
							>University</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 md:table-cell"
							>Qualification</th
						>
						<th class="hidden px-4 py-3 text-left font-semibold text-surface-600 md:table-cell"
							>Mode</th
						>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody>
					{#each $shortlist as item (item.slug)}
						<tr class="group border-b border-surface-100 transition-colors hover:bg-surface-50/50">
							<td class="px-2 py-3">
								<button
									onclick={() => toggleCompare(item.slug)}
									class="rounded p-1 transition-colors {$compareList.includes(item.slug)
										? 'text-primary-600 hover:text-primary-700'
										: 'text-surface-300 hover:text-primary-500'}"
									aria-label="{$compareList.includes(item.slug)
										? 'Remove from'
										: 'Add to'} comparison"
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
								</button>
							</td>
							<td class="px-4 py-3">
								<a
									href="/courses/{item.slug}"
									class="font-medium text-surface-800 transition-colors group-hover:text-primary-600"
								>
									{item.title}
								</a>
								<span class="mt-0.5 block text-xs text-surface-400 sm:hidden"
									>{item.universityName}</span
								>
							</td>
							<td class="hidden px-4 py-3 sm:table-cell">
								<a
									href="/universities/{item.universitySlug}"
									class="text-surface-600 transition-colors hover:text-primary-600"
								>
									{item.universityName}
								</a>
							</td>
							<td class="hidden px-4 py-3 md:table-cell">
								<Badge label={item.qualification} variant="primary" />
							</td>
							<td class="hidden px-4 py-3 text-surface-600 md:table-cell">{item.studyMode}</td>
							<td class="px-4 py-3 text-right">
								<button
									onclick={() => removeFromShortlist(item.slug)}
									class="text-surface-400 transition-colors hover:text-red-500"
									aria-label="Remove from shortlist"
								>
									<svg
										class="h-4 w-4"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										viewBox="0 0 24 24"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if $compareCount > 0}
			<div class="mt-6 flex justify-center">
				<a
					href="/compare?courses={$compareList.join(',')}"
					class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
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
					Compare {$compareCount} course{$compareCount > 1 ? 's' : ''}
				</a>
			</div>
		{/if}
	{:else}
		<div class="py-20 text-center">
			<svg
				class="mx-auto mb-4 h-16 w-16 text-surface-300"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
				/>
			</svg>
			<p class="text-lg font-medium text-surface-500">No courses saved yet</p>
			<p class="mt-2 mb-6 text-sm text-surface-400">
				Browse courses and click the heart icon to save them here
			</p>
			<a
				href="/courses"
				class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
			>
				Browse courses
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
		</div>
	{/if}
</div>
