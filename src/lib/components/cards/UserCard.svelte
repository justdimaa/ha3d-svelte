<script lang="ts">
	import { HA_API_URL } from '$env/static/public';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	interface Props {
		userEntity: HassEntity;
	}

	let { userEntity }: Props = $props();

	let pfpUrl = $derived(
		userEntity.attributes.entity_picture
			? HA_API_URL.replace(/\/+$/, '') + userEntity.attributes.entity_picture
			: undefined
	);
	let time = $state(DateTime.now());
	let timeDisplay = $derived(time.toLocaleString(DateTime.DATETIME_MED));

	let name = $derived(userEntity.attributes.friendly_name ?? 'please report bug');

	onMount(() => {
		const interval = setInterval(() => {
			time = DateTime.now();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="flex justify-between">
	<div class="flex flex-col justify-between">
		<span class="font-bold">Hi, {name}!</span>
		<span class="text-neutral-400">{timeDisplay}</span>
	</div>
	{#if pfpUrl}
		<img class="aspect-square h-12 rounded-full object-cover shadow" src={pfpUrl} alt="pfp" />
	{:else}
		<div
			class="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-3xl shadow"
		>
			{name[0].toLocaleUpperCase()}
		</div>
	{/if}
</div>
