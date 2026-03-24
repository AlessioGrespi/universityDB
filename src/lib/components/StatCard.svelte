<script lang="ts">
	let {
		value,
		label
	}: {
		value: string;
		label: string;
	} = $props();
</script>

<div class="text-center">
	<div class="text-3xl font-bold text-surface-900">{value}</div>
	<div class="mt-1 text-sm text-surface-500">{label}</div>
</div>
