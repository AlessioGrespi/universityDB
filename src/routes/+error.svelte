<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status} | UniversityDB</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
	<p class="text-6xl font-extrabold text-primary-500">{$page.status}</p>
	<h1 class="mt-4 text-2xl font-bold text-surface-900 sm:text-3xl">
		{#if $page.status === 404}
			Page not found
		{:else}
			Something went wrong
		{/if}
	</h1>
	<p class="mt-2 max-w-md text-surface-500">
		{$page.error?.message ?? 'The page you were looking for could not be found.'}
	</p>
	<a
		href="/"
		class="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
	>
		Back to home
	</a>
</div>
