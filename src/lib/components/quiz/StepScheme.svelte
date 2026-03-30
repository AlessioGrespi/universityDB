<script lang="ts">
	import type { QuizScheme } from '$lib/types';
	import { quizAnswers, setScheme, nextStep } from '$lib/stores/quiz';

	const answers = $derived($quizAnswers);

	function select(scheme: QuizScheme) {
		setScheme(scheme);
		nextStep();
	}
</script>

<div class="text-center">
	<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">What stage are you at?</h1>
	<p class="mt-3 text-lg text-surface-500">This helps us find the right courses for you.</p>
</div>

<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
	<button
		class="group relative rounded-card border-2 p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover {answers.scheme ===
		'Undergraduate'
			? 'border-primary-500 bg-primary-50'
			: 'border-surface-200 bg-white hover:border-primary-300'}"
		onclick={() => select('Undergraduate')}
	>
		<div class="mb-3 text-4xl">🎓</div>
		<h2 class="text-xl font-semibold text-surface-800">Undergraduate</h2>
		<p class="mt-2 text-sm text-surface-500">
			Bachelor's degrees, foundation years, and integrated masters
		</p>
	</button>

	<button
		class="group relative rounded-card border-2 p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover {answers.scheme ===
		'Postgraduate'
			? 'border-primary-500 bg-primary-50'
			: 'border-surface-200 bg-white hover:border-primary-300'}"
		onclick={() => select('Postgraduate')}
	>
		<div class="mb-3 text-4xl">📚</div>
		<h2 class="text-xl font-semibold text-surface-800">Postgraduate</h2>
		<p class="mt-2 text-sm text-surface-500">
			Master's degrees, PGDip, PGCE, and research programmes
		</p>
	</button>
</div>
