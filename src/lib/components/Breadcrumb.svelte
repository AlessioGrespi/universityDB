<script lang="ts">
	import { BASE_URL } from '$lib/config';

	interface BreadcrumbItem {
		name: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
	}

	let { items }: Props = $props();

	let jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items.map((item, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: item.name,
				...(item.href ? { item: `${BASE_URL}${item.href}` } : {})
			}))
		})
	);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>

<nav aria-label="Breadcrumb" class="text-sm text-surface-400">
	{#each items as crumb, i}
		{#if i > 0}
			<span class="mx-1">/</span>
		{/if}
		{#if crumb.href}
			<a href={crumb.href} class="text-primary-600 transition-colors hover:text-primary-700"
				>{crumb.name}</a
			>
		{:else}
			<span class="text-surface-600">{crumb.name}</span>
		{/if}
	{/each}
</nav>
