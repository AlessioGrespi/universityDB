<script lang="ts">
	import { regions } from '$lib/data/regions';
	import { quizAnswers, setRegions, nextStep } from '$lib/stores/quiz';

	const answers = $derived($quizAnswers);
	const selected = $derived(new Set(answers.regions));
	const isAnywhere = $derived(selected.size === 0);

	function toggle(id: string) {
		const next = new Set(selected);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		setRegions([...next]);
	}

	function selectAnywhere() {
		setRegions([]);
		nextStep();
	}

	function proceed() {
		nextStep();
	}
</script>

<div class="text-center">
	<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">Where would you like to study?</h1>
	<p class="mt-3 text-lg text-surface-500">Pick regions or choose "Anywhere in the UK".</p>
</div>

<div class="mt-8">
	<!-- Anywhere option -->
	<button
		class="mb-4 w-full rounded-card border-2 px-5 py-4 text-center transition-all duration-200 {isAnywhere
			? 'border-primary-500 bg-primary-50'
			: 'border-surface-200 bg-white hover:border-primary-300'}"
		onclick={selectAnywhere}
	>
		<span class="text-lg">🌍</span>
		<span class="ml-2 font-semibold text-surface-800">Anywhere in the UK</span>
	</button>

	<!-- Region grid -->
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		{#each regions as region}
			<button
				class="rounded-card border-2 px-3 py-3 text-center text-sm transition-all duration-200 {selected.has(
					region.id
				)
					? 'border-primary-500 bg-primary-50 font-semibold'
					: 'border-surface-200 bg-white hover:border-primary-300'}"
				onclick={() => toggle(region.id)}
			>
				{region.label}
			</button>
		{/each}
	</div>
</div>

{#if selected.size > 0}
	<div class="mt-8 text-center">
		<button
			class="rounded-button bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
			onclick={proceed}
		>
			Continue
		</button>
		<p class="mt-2 text-xs text-surface-400">
			{selected.size} region{selected.size !== 1 ? 's' : ''} selected
		</p>
	</div>
{/if}
