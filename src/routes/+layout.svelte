<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { navigating } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if $navigating}
	<div class="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-primary-100">
		<div class="h-full bg-primary-500 animate-loading-bar"></div>
	</div>
{/if}

<Navbar />
<main class="min-h-screen pt-16">
	{@render children()}
</main>
<Footer />
