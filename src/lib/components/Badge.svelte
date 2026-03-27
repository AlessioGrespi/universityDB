<script lang="ts">
	const variantClasses: Record<string, string> = {
		default: 'bg-surface-100 text-surface-700',
		gold: 'bg-amber-50 text-amber-700 border border-amber-200',
		silver: 'bg-gray-100 text-gray-600 border border-gray-200',
		bronze: 'bg-orange-50 text-orange-700 border border-orange-200',
		primary: 'bg-primary-50 text-primary-700',
		success: 'bg-emerald-50 text-emerald-700'
	};

	let {
		label,
		variant = 'default'
	}: {
		label: string;
		variant?: 'default' | 'gold' | 'silver' | 'bronze' | 'primary' | 'success';
	} = $props();
</script>

<span
	class="inline-flex items-center rounded-badge px-2.5 py-0.5 text-xs font-medium {variantClasses[
		variant
	]}"
>
	{label}
</span>
