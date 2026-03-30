<script lang="ts">
	import QuizShell from '$lib/components/quiz/QuizShell.svelte';
	import StepScheme from '$lib/components/quiz/StepScheme.svelte';
	import StepSubjects from '$lib/components/quiz/StepSubjects.svelte';
	import StepQualifications from '$lib/components/quiz/StepQualifications.svelte';
	import StepPriorities from '$lib/components/quiz/StepPriorities.svelte';
	import StepLocation from '$lib/components/quiz/StepLocation.svelte';
	import StepStudyMode from '$lib/components/quiz/StepStudyMode.svelte';
	import StepEmail from '$lib/components/quiz/StepEmail.svelte';
	import { quizStep } from '$lib/stores/quiz';

	const step = $derived($quizStep);
</script>

<svelte:head>
	<title>Course Quiz | UniversityDB</title>
</svelte:head>

<QuizShell>
	{#if step === 1}
		<StepScheme />
	{:else if step === 2}
		<StepSubjects />
	{:else if step === 3}
		<StepQualifications />
	{:else if step === 4}
		<StepPriorities />
	{:else if step === 5}
		<StepLocation />
	{:else if step === 6}
		<StepStudyMode />
	{:else if step === 7}
		<StepEmail />
	{/if}
</QuizShell>
