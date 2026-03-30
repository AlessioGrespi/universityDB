<script lang="ts">
	import type { QuizStudyMode } from '$lib/types';
	import { quizAnswers, setStudyMode, nextStep } from '$lib/stores/quiz';

	const answers = $derived($quizAnswers);

	function select(mode: QuizStudyMode) {
		setStudyMode(mode);
		nextStep();
	}
</script>

<div class="text-center">
	<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">How do you want to study?</h1>
	<p class="mt-3 text-lg text-surface-500">Choose your preferred study mode.</p>
</div>

<div class="mx-auto mt-10 max-w-md space-y-3">
	<button
		class="w-full rounded-card border-2 px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 {answers.studyMode ===
		'Full-time'
			? 'border-primary-500 bg-primary-50'
			: 'border-surface-200 bg-white hover:border-primary-300'}"
		onclick={() => select('Full-time')}
	>
		<span class="text-lg">🏫</span>
		<span class="ml-2 font-semibold text-surface-800">Full-time</span>
		<span class="mt-1 ml-8 block text-sm text-surface-400">Study as your main activity</span>
	</button>

	<button
		class="w-full rounded-card border-2 px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 {answers.studyMode ===
		'Part-time'
			? 'border-primary-500 bg-primary-50'
			: 'border-surface-200 bg-white hover:border-primary-300'}"
		onclick={() => select('Part-time')}
	>
		<span class="text-lg">🕐</span>
		<span class="ml-2 font-semibold text-surface-800">Part-time</span>
		<span class="mt-1 ml-8 block text-sm text-surface-400">
			Combine study with work or other commitments
		</span>
	</button>

	<button
		class="w-full rounded-card border-2 px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 {answers.studyMode ===
		null
			? 'border-primary-500 bg-primary-50'
			: 'border-surface-200 bg-white hover:border-primary-300'}"
		onclick={() => select(null)}
	>
		<span class="text-lg">🤷</span>
		<span class="ml-2 font-semibold text-surface-800">No preference</span>
		<span class="mt-1 ml-8 block text-sm text-surface-400">Show me everything</span>
	</button>
</div>
