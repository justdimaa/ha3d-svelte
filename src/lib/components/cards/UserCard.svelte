<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';

	interface Props {
		userEntity: HassEntity;
	}

	let { userEntity }: Props = $props();

	let pfpUrl = $derived(
		userEntity.attributes.entity_picture
			? $homeApi?.options.auth?.data.hassUrl + userEntity.attributes.entity_picture
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
		<span>{timeDisplay}</span>
	</div>
	{#if pfpUrl}
		<img class="aspect-square h-12 rounded-full object-cover shadow" src={pfpUrl} alt="pfp" />
	{:else}
		<div
			class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-500 text-3xl shadow"
		>
			{name[0].toLocaleUpperCase()}
		</div>
	{/if}
</div>
