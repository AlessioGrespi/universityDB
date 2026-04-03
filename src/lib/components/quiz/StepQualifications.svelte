<script lang="ts">
	import { quizAnswers, setUcasPoints, setDegreeClass, nextStep } from '$lib/stores/quiz';

	const answers = $derived($quizAnswers);
	const isUG = $derived(answers.scheme === 'Undergraduate');

	let ucasValue = $state($quizAnswers.ucasPoints ?? 112);
	let degreeValue = $state($quizAnswers.degreeClass ?? '');

	const ucasLabels: Record<number, string> = {
		48: '48 (DDD)',
		64: '64 (DDC)',
		80: '80 (DCC)',
		96: '96 (CCC)',
		112: '112 (BCC)',
		120: '120 (BBD)',
		128: '128 (BBC)',
		136: '136 (ABD)',
		144: '144 (ABB)',
		152: '152 (AAC)',
		160: '160 (AAB)',
		168: '168 (AAA)',
		176: '176 (A*AA)',
		184: '184 (A*A*A)',
		192: '192 (A*A*A*)'
	};

	const degreeOptions = [
		{ value: '1st', label: 'First Class (1st)' },
		{ value: '2:1', label: 'Upper Second (2:1)' },
		{ value: '2:2', label: 'Lower Second (2:2)' },
		{ value: '3rd', label: 'Third Class (3rd)' },
		{ value: 'other', label: 'Other / Not sure' }
	];

	function proceed() {
		if (isUG) {
			setUcasPoints(ucasValue);
		} else {
			setDegreeClass(degreeValue || null);
		}
		nextStep();
	}

	function getNearestLabel(value: number): string {
		const keys = Object.keys(ucasLabels).map(Number);
		const nearest = keys.reduce((prev, curr) =>
			Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
		);
		return ucasLabels[nearest] ?? `${value} points`;
	}
</script>

<div class="text-center">
	{#if isUG}
		<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">
			What are your expected UCAS points?
		</h1>
		<p class="mt-3 text-lg text-surface-500">
			Your predicted or achieved grades. We'll show stretch options too.
		</p>
	{:else}
		<h1 class="text-3xl font-bold text-surface-800 sm:text-4xl">
			What's your undergraduate degree class?
		</h1>
		<p class="mt-3 text-lg text-surface-500">
			This helps us match you with courses you're eligible for.
		</p>
	{/if}
</div>

<div class="mt-10">
	{#if isUG}
		<!-- UCAS Points Slider -->
		<div class="mx-auto max-w-md">
			<div class="mb-6 text-center">
				<span class="text-5xl font-bold text-primary-600">{ucasValue}</span>
				<span class="mt-1 block text-sm text-surface-500">
					{getNearestLabel(ucasValue)}
				</span>
			</div>
			<input
				type="range"
				min="48"
				max="192"
				step="8"
				bind:value={ucasValue}
				class="w-full accent-primary-600"
			/>
			<div class="mt-2 flex justify-between text-xs text-surface-400">
				<span>48</span>
				<span>120</span>
				<span>192</span>
			</div>
		</div>
	{:else}
		<!-- Degree Class Selection -->
		<div class="mx-auto max-w-sm space-y-3">
			{#each degreeOptions as option}
				<button
					class="w-full rounded-card border-2 px-5 py-4 text-left transition-all duration-200 {degreeValue ===
					option.value
						? 'border-primary-500 bg-primary-50'
						: 'border-surface-200 bg-white hover:border-primary-300'}"
					onclick={() => (degreeValue = option.value)}
				>
					<span class="font-medium text-surface-800">{option.label}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<div class="mt-8 text-center">
	<button
		class="rounded-button bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
		onclick={proceed}
	>
		Continue
	</button>
	<button
		class="mx-auto mt-3 block text-sm text-surface-400 transition-colors hover:text-surface-600"
		onclick={() => {
			if (isUG) setUcasPoints(null);
			else setDegreeClass(null);
			nextStep();
		}}
	>
		Skip — I'm not sure yet
	</button>
</div>
