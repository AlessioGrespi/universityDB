<script lang="ts">
	import type { QuizPriority } from '$lib/types';
	import { quizAnswers, setPriorities, nextStep } from '$lib/stores/quiz';

	const answers = $derived($quizAnswers);
	const ranked = $derived(answers.priorities);

	const options: { id: QuizPriority; label: string; description: string; icon: string }[] = [
		{
			id: 'satisfaction',
			label: 'Student Satisfaction',
			description: 'High NSS scores, happy students',
			icon: '😊'
		},
		{
			id: 'salary',
			label: 'Graduate Salary',
			description: 'Strong earning potential after graduation',
			icon: '💰'
		},
		{
			id: 'research',
			label: 'Research Quality',
			description: 'World-class research output',
			icon: '🔬'
		},
		{
			id: 'teaching',
			label: 'Teaching Excellence',
			description: 'High TEF rating, great teaching',
			icon: '⭐'
		},
		{
			id: 'prestige',
			label: 'University Prestige',
			description: 'Russell Group, well-known name',
			icon: '🏛️'
		},
		{
			id: 'location',
			label: 'Location',
			description: 'Close to where I want to be',
			icon: '📍'
		}
	];

	function toggle(id: QuizPriority) {
		const idx = ranked.indexOf(id);
		if (idx >= 0) {
			setPriorities(ranked.filter((p) => p !== id));
		} else if (ranked.length < 3) {
			setPriorities([...ranked, id]);
		}
	}

	function getRank(id: QuizPriority): number {
		return ranked.indexOf(id) + 1;
	}
</script>

<div class="text-center">
	<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">What matters most to you?</h1>
	<p class="mt-3 text-lg text-surface-500">
		Tap to rank your top 3 priorities. First pick = most important.
	</p>
</div>

<div class="mt-10 space-y-3">
	{#each options as option}
		{@const rank = getRank(option.id)}
		<button
			class="flex w-full items-center gap-4 rounded-card border-2 px-5 py-4 text-left transition-all duration-200 {rank >
			0
				? 'border-primary-500 bg-primary-50'
				: ranked.length >= 3
					? 'border-surface-100 bg-surface-50 opacity-50'
					: 'border-surface-200 bg-white hover:border-primary-300'}"
			onclick={() => toggle(option.id)}
		>
			<span class="text-2xl">{option.icon}</span>
			<div class="flex-1">
				<span class="font-semibold text-surface-800">{option.label}</span>
				<span class="block text-xs text-surface-400">{option.description}</span>
			</div>
			{#if rank > 0}
				<span
					class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white"
				>
					{rank}
				</span>
			{/if}
		</button>
	{/each}
</div>

{#if ranked.length === 3}
	<div class="mt-8 text-center">
		<button
			class="rounded-button bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
			onclick={nextStep}
		>
			Continue
		</button>
	</div>
{:else}
	<p class="mt-6 text-center text-sm text-surface-400">
		Pick {3 - ranked.length} more
		{3 - ranked.length === 1 ? 'priority' : 'priorities'}
	</p>
{/if}
