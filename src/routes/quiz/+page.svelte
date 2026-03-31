<script lang="ts">
	import { resetQuiz } from '$lib/stores/quiz';
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
	title="Course Recommender Quiz — Find Your Perfect Degree"
	description="Find your perfect university course in under 90 seconds. Our personalised quiz matches you with courses based on your interests, grades, and priorities."
/>

<div
	class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center"
>
	<!-- Hero -->
	<div class="mb-4 text-6xl">🎯</div>
	<h1 class="text-4xl font-bold text-surface-800 sm:text-5xl">Find Your Perfect Course</h1>
	<p class="mx-auto mt-4 max-w-lg text-lg text-surface-500">
		Answer 6 quick questions and we'll match you with courses from over 50,000 options across 166 UK
		universities.
	</p>

	<!-- Stats -->
	<div class="mt-8 flex items-center justify-center gap-6 text-sm text-surface-400">
		<span class="flex items-center gap-1.5">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			Under 90 seconds
		</span>
		<span class="flex items-center gap-1.5">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			Personalised results
		</span>
		<span class="flex items-center gap-1.5">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
				/>
			</svg>
			Save to shortlist
		</span>
	</div>

	<!-- CTA -->
	<a
		href="/quiz/take"
		class="mt-10 inline-flex items-center gap-2 rounded-button bg-primary-600 px-10 py-4 text-lg font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-card-hover"
		onclick={resetQuiz}
	>
		Start Quiz
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 7l5 5m0 0l-5 5m5-5H6"
			/>
		</svg>
	</a>

	<!-- How it works -->
	<div class="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
		<div class="rounded-card border border-surface-100 bg-white p-6 shadow-card">
			<div class="mb-3 text-2xl">1️⃣</div>
			<h3 class="font-semibold text-surface-800">Tell us about you</h3>
			<p class="mt-1 text-sm text-surface-500">
				Your interests, grades, and what matters most in a university.
			</p>
		</div>
		<div class="rounded-card border border-surface-100 bg-white p-6 shadow-card">
			<div class="mb-3 text-2xl">2️⃣</div>
			<h3 class="font-semibold text-surface-800">We crunch the data</h3>
			<p class="mt-1 text-sm text-surface-500">
				Our algorithm scores 50,000+ courses against your preferences.
			</p>
		</div>
		<div class="rounded-card border border-surface-100 bg-white p-6 shadow-card">
			<div class="mb-3 text-2xl">3️⃣</div>
			<h3 class="font-semibold text-surface-800">Get matched</h3>
			<p class="mt-1 text-sm text-surface-500">
				See your top matches ranked by fit, with shortlisting built in.
			</p>
		</div>
	</div>
</div>
