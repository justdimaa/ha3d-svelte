<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/dashboard');
	});
</script>

<svelte:head></svelte:head>

<div class="flex w-screen flex-row items-center justify-center p-4"></div>
