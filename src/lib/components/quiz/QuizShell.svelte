<script lang="ts">
	import { quizStep, quizProgress, totalSteps, prevStep, goToStep } from '$lib/stores/quiz';

	let { children }: { children: import('svelte').Snippet } = $props();

	const step = $derived($quizStep);
	const progress = $derived($quizProgress);
</script>

<div class="mx-auto min-h-[calc(100vh-4rem)] max-w-2xl px-4 py-8">
	<!-- Progress bar -->
	<div class="mb-8">
		<div class="mb-2 flex items-center justify-between text-sm text-surface-500">
			<span>Step {step} of {totalSteps}</span>
			<span>{Math.round(progress * 100)}%</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-surface-100">
			<div
				class="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
				style="width: {progress * 100}%"
			></div>
		</div>
		<!-- Step dots -->
		<div class="mt-3 flex justify-between">
			{#each Array(totalSteps) as _, i}
				<button
					class="h-2 w-2 rounded-full transition-colors {i + 1 <= step
						? 'bg-primary-500'
						: 'bg-surface-200'} {i + 1 < step
						? 'cursor-pointer hover:bg-primary-400'
						: 'cursor-default'}"
					disabled={i + 1 >= step}
					aria-label="Go to step {i + 1}"
					onclick={() => {
						if (i + 1 < step) goToStep(i + 1);
					}}
				></button>
			{/each}
		</div>
	</div>

	<!-- Step content -->
	<div class="animate-fade-in">
		{@render children()}
	</div>

	<!-- Back button -->
	{#if step > 1}
		<div class="mt-8">
			<button
				class="inline-flex items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700"
				onclick={prevStep}
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Back
			</button>
		</div>
	{/if}
</div>

<style>
	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fadeSlideIn 0.35s ease-out;
	}
</style>
