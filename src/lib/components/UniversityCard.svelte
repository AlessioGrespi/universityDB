<script lang="ts">
	import type { University } from '$lib/types';
	import Badge from '$lib/components/Badge.svelte';

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

	function hashName(name: string): string {
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}

	function formatNumber(n: number): string {
		return n.toLocaleString('en-GB');
	}

	const tefVariantMap: Record<string, 'gold' | 'silver' | 'bronze'> = {
		Gold: 'gold',
		Silver: 'silver',
		Bronze: 'bronze'
	};

	let { university }: { university: University } = $props();

	let avatarColor = $derived(hashName(university.name));
	let initial = $derived(university.name.charAt(0).toUpperCase());
</script>

<a
	href="/universities/{university.slug}"
	class="group block rounded-card border border-surface-200 bg-white p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
>
	<div class="flex items-center gap-4">
		<div
			class="size-12 rounded-full flex items-center justify-center text-white font-bold text-lg {avatarColor}"
		>
			{initial}
		</div>
		<h3
			class="text-lg font-semibold text-surface-800 group-hover:text-primary-600 transition-colors"
		>
			{university.name}
		</h3>
	</div>

	<div class="mt-3 flex items-center gap-2 text-sm text-surface-500">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			fill="currentColor"
			class="size-4 shrink-0"
		>
			<path
				fill-rule="evenodd"
				d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.291 5.597a15.591 15.591 0 0 0 2.236 2.235l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
				clip-rule="evenodd"
			/>
		</svg>
		<span>{university.region}</span>
		<span>·</span>
		<span>Est. {university.foundedYear}</span>
	</div>

	<div class="mt-4 flex items-center gap-3">
		<span class="flex items-center gap-1 text-sm text-surface-600">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="size-4 shrink-0"
			>
				<path
					d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
				/>
			</svg>
			{formatNumber(university.studentCount)} students
		</span>
		<span class="flex items-center gap-1 text-sm text-surface-600">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="size-4 shrink-0"
			>
				<path
					d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm4 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-4 4a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm4 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"
				/>
			</svg>
			{formatNumber(university.totalPublications)} publications
		</span>
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		{#if university.tefRating && tefVariantMap[university.tefRating]}
			<Badge label="TEF {university.tefRating}" variant={tefVariantMap[university.tefRating]} />
		{/if}
		{#each university.groups as group}
			<Badge label={group} variant="primary" />
		{/each}
	</div>
</a>
