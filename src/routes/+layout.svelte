<script lang="ts">
	import '../app.css';
	import { connect, homeApi } from '../stores/global';
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	onMount(async () => {
		if (!$homeApi) {
			await connect();
		}
	});
</script>

<svelte:head></svelte:head>

<main
	class="to-[#10131C]] h-screen w-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-slate-900 to-black font-ubuntu text-white"
>
	{@render children?.()}
</main>
