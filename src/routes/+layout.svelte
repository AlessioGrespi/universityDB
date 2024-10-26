<script>
	import ChatWindow from '$lib/components/ChatWindow.svelte';
import '../app.css';
	import { House } from 'lucide-svelte';
</script>

<div class='w-full flex justify-center'>
	<div class='container'>
		<nav class='w-full flex justify-between border-b-2 mb-2 place-items-center'>
			<a href='/'><House class='h-10 w-10 my-1 hover:bg-neutral-200 rounded-lg px-1 py-1'/></a>
			<div class='flex justify-between gap-x-4'>
				<a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/courses'>Courses</a>
				<a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/modules'>Modules</a>
				<a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/lecturers'>Lecturers</a>
				<!-- <a class='my-2 text-3xl font-semibold hover:bg-neutral-200 rounded-lg py-0.5 px-2' href='/research'>Research</a> -->
			</div>
		</nav>
		<slot></slot>
	</div>

	<ChatWindow/>
</div>
