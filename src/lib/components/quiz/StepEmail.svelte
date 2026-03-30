<script lang="ts">
	import { quizAnswers, setEmail, answersToParams } from '$lib/stores/quiz';
	import { goto } from '$app/navigation';

	const answers = $derived($quizAnswers);
	let emailValue = $state($quizAnswers.email ?? '');
	let error = $state('');

	function submit() {
		if (emailValue.trim()) {
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
				error = 'Please enter a valid email address';
				return;
			}
			setEmail(emailValue.trim());
		}
		navigateToResults();
	}

	function skip() {
		setEmail(null);
		navigateToResults();
	}

	function navigateToResults() {
		const params = answersToParams($quizAnswers);
		goto(`/quiz/results?${params}`);
	}
</script>

<div class="text-center">
	<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">Almost there!</h1>
	<p class="mt-3 text-lg text-surface-500">
		Save your personalised results so you can come back to them later.
	</p>
</div>

<div class="mx-auto mt-10 max-w-sm">
	<div class="rounded-card border border-surface-200 bg-white p-6 shadow-card">
		<label for="quiz-email" class="mb-2 block text-sm font-medium text-surface-700">
			Email address
		</label>
		<input
			id="quiz-email"
			type="email"
			placeholder="you@example.com"
			bind:value={emailValue}
			oninput={() => (error = '')}
			onkeydown={(e) => {
				if (e.key === 'Enter') submit();
			}}
			class="w-full rounded-button border border-surface-300 px-4 py-3 text-surface-800 placeholder-surface-400 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
		/>
		{#if error}
			<p class="mt-1 text-sm text-error">{error}</p>
		{/if}

		<button
			class="mt-4 w-full rounded-button bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
			onclick={submit}
		>
			Get my recommendations
		</button>
	</div>

	<button
		class="mt-4 block w-full text-center text-sm text-surface-400 transition-colors hover:text-surface-600"
		onclick={skip}
	>
		Skip for now
	</button>
</div>
