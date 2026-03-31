<script lang="ts">
	interface Props {
		title: string;
		description: string;
		canonical?: string;
		type?: 'website' | 'article';
		image?: string;
		imageAlt?: string;
		noindex?: boolean;
	}

	const SITE_NAME = 'UniversityDB';
	const DEFAULT_IMAGE = '/og-default.png';

	let {
		title,
		description,
		canonical,
		type = 'website',
		image = DEFAULT_IMAGE,
		imageAlt = 'UniversityDB — UK University Course Directory',
		noindex = false
	}: Props = $props();

	let fullTitle = $derived(title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />

	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content={imageAlt} />
	{#if canonical}
		<meta property="og:url" content={canonical} />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>
