<script lang="ts">
	import { subjectClusters } from '$lib/data/subject-clusters';
	import { quizAnswers, setSubjectClusters, nextStep } from '$lib/stores/quiz';

	const answers = $derived($quizAnswers);
	const selected = $derived(new Set(answers.subjectClusters));

	const icons: Record<string, string> = {
		'medicine-health': '🩺',
		science: '🔬',
		engineering: '⚙️',
		computing: '💻',
		business: '📊',
		'law-social': '⚖️',
		'arts-humanities': '🎨',
		education: '📖'
	};

	function toggle(id: string) {
		const next = new Set(selected);
		if (next.has(id)) {
			next.delete(id);
		} else if (next.size < 3) {
			next.add(id);
		}
		setSubjectClusters([...next]);
	}

	function proceed() {
		if (selected.size > 0) nextStep();
	}
</script>

<div class="text-center">
	<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">What area excites you?</h1>
	<p class="mt-3 text-lg text-surface-500">Pick up to 3 subject areas you're interested in.</p>
</div>

<div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
	{#each subjectClusters as cluster}
		<button
			class="rounded-card border-2 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 {selected.has(
				cluster.id
			)
				? 'border-primary-500 bg-primary-50 shadow-card'
				: 'border-surface-200 bg-white hover:border-primary-300'}"
			onclick={() => toggle(cluster.id)}
		>
			<div class="mb-2 text-3xl">{icons[cluster.id] ?? '📚'}</div>
			<div class="text-sm font-semibold text-surface-800">{cluster.label}</div>
			<div class="mt-1 text-xs leading-tight text-surface-400">{cluster.description}</div>
		</button>
	{/each}
</div>

{#if selected.size > 0}
	<div class="mt-8 text-center">
		<button
			class="rounded-button bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
			onclick={proceed}
		>
			Continue
		</button>
		<p class="mt-2 text-xs text-surface-400">{selected.size} of 3 selected</p>
	</div>
{/if}
