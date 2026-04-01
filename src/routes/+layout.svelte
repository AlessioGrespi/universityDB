<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { navigating } from '$app/stores';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import posthog from 'posthog-js';
	import { env } from '$env/dynamic/public';

	let { children } = $props();

	if (browser) {
		posthog.init(env.PUBLIC_POSTHOG_KEY!, {
			api_host: env.PUBLIC_POSTHOG_HOST,
			capture_pageview: false,
			capture_pageleave: true,
			person_profiles: 'identified_only'
		});
	}

	afterNavigate(() => {
		if (browser) {
			posthog.capture('$pageview');
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if $navigating}
	<div class="fixed top-0 right-0 left-0 z-[100] h-0.5 bg-primary-100">
		<div class="h-full animate-loading-bar bg-primary-500"></div>
	</div>
{/if}

<Navbar />
<main class="min-h-screen pt-16">
	{@render children()}
</main>
<Footer />
<CommandPalette />
