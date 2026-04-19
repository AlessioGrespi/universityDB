<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
	<div class="max-w-md">
		<h1 class="mb-2 text-4xl font-bold text-gray-900">UniversityDB</h1>
		<div class="mb-6 h-1 w-16 mx-auto rounded bg-primary-500"></div>
		<p class="mb-2 text-lg text-gray-600">Currently under construction</p>
		<p class="mb-8 text-sm text-gray-400">We're working on something great. Check back soon.</p>
		<a
			href="https://www.linkedin.com/in/alessio-grespi/"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 rounded-lg bg-[#0A66C2] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#004182]"
		>
			<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
			Contact me on LinkedIn
		</a>
	</div>
</div>
