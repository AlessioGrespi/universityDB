<script lang="ts">
	let {
		placeholder = 'Search...',
		value = $bindable(''),
		onSearch = undefined,
		size = 'default'
	}: {
		placeholder?: string;
		value?: string;
		onSearch?: ((query: string) => void) | undefined;
		size?: 'default' | 'large';
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onSearch?.(value);
		}
	}

	function handleInput() {
		onSearch?.(value);
	}
</script>

<div class="relative">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		class="size-5 absolute top-1/2 -translate-y-1/2 text-surface-400 {size === 'large'
			? 'left-4'
			: 'left-3'}"
	>
		<path
			fill-rule="evenodd"
			d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
			clip-rule="evenodd"
		/>
	</svg>
	<input
		type="text"
		{placeholder}
		bind:value
		onkeydown={handleKeydown}
		oninput={handleInput}
		class="w-full bg-white border border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all {size ===
		'large'
			? 'h-14 text-lg pl-12 pr-6 rounded-xl'
			: 'h-10 text-sm pl-10 pr-4 rounded-lg'}"
	/>
</div>
