<script lang="ts">
	let { score, size = 56 }: { score: number; size?: number } = $props();

	const radius = $derived((size - 6) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const offset = $derived(circumference - (score / 100) * circumference);
</script>

<div
	class="relative inline-flex items-center justify-center"
	style="width: {size}px; height: {size}px;"
>
	<svg class="absolute -rotate-90" width={size} height={size}>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke="var(--color-surface-100)"
			stroke-width="4"
		/>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke="var(--color-primary-500)"
			stroke-width="4"
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			class="transition-[stroke-dashoffset] duration-700 ease-out"
		/>
	</svg>
	<span class="text-xs font-bold text-primary-700">{Math.round(score)}%</span>
</div>
