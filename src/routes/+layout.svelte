<script>
	import ChatWindow from '$lib/components/ChatWindow.svelte';
import '../app.css';
	import { House, Menu, X } from 'lucide-svelte';
	// import { inject } from '@vercel/analytics';


	let mobileMenu = false;
	// let mobileMenu = true

	import {slide} from 'svelte/transition';

	function mobileMenuToggle() {
		mobileMenu = !mobileMenu;
	}
</script>

<div class='w-full flex justify-center'>
	<div class='container'>
		<nav class='w-full flex justify-between border-b-2 mb-2 place-items-center'>
			<a href='/'><House class='h-10 w-10 my-1 hover:bg-neutral-200 rounded-lg px-1 py-1'/></a>
			<div class='hidden sm:inline flex justify-between gap-x-4'>
				<a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/courses'>Courses</a>
				<a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/modules'>Modules</a>
				<a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/lecturers'>Lecturers</a>
				<!-- <a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/research'>Research</a> -->
			</div>
			<button type='button' on:click={mobileMenuToggle} class='sm:hidden'><Menu class='h-10 w-10 my-1 hover:bg-neutral-200 rounded-lg p-1'/></button>
			{#if mobileMenu}
			<!-- Overlay background -->
			<div class="fixed inset-0 bg-black bg-opacity-50 z-10" on:click={mobileMenuToggle}></div>

			<!-- Mobile menu items -->
			<div transition:slide={{axis: 'x'}} class="fixed top-0 right-0 z-20 bg-white w-3/4 h-full p-4 shadow-lg transition-transform transform slide-in">
				<a class="block my-4 text-2xl font-semibold hover:bg-neutral-200 rounded-lg py-1 px-4" href="/courses" on:click={mobileMenuToggle}>Courses</a>
				<a class="block my-4 text-2xl font-semibold hover:bg-neutral-200 rounded-lg py-1 px-4" href="/modules" on:click={mobileMenuToggle}>Modules</a>
				<a class="block my-4 text-2xl font-semibold hover:bg-neutral-200 rounded-lg py-1 px-4" href="/lecturers" on:click={mobileMenuToggle}>Lecturers</a>
			</div>
		{/if}
		</nav>
		<slot></slot>
	</div>

	<ChatWindow/>
</div>
