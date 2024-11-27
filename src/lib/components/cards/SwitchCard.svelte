<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { getEntityIcon } from '../../../utils/icons';
	import { homeApi } from '../../../stores/global';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();
	let isAvailable = $derived(entity.state !== 'unavailable' && entity.state !== 'unknown');

	const onToggle = async () => {
		if (!isAvailable) return;

		const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'switch',
			service,
			return_response: false,
			service_data: { entity_id: entity.entity_id }
		});
	};
</script>

<button
	class="flex justify-between gap-2 rounded-xl border border-white/10 bg-white/10 p-4 shadow lg:backdrop-blur-2xl"
	class:opacity-40={!isAvailable}
	onclick={onToggle}
	disabled={!isAvailable}
>
	<div class="flex items-center gap-2">
		<SvgIcon type="mdi" path={getEntityIcon(entity)} size="24" />
		<span>{entity.attributes.friendly_name ?? entity.entity_id}</span>
	</div>
	<div class="flex gap-1">
		{#if isAvailable}
			<label class="pointer-events-none inline-flex cursor-pointer items-center">
				<input type="checkbox" checked={entity.state === 'on'} class="peer sr-only" />
				<div
					class="peer relative h-6 w-11 rounded-full bg-white/10 outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
				></div>
			</label>
		{:else}
			<span>{entity.state}</span>
		{/if}
	</div>
</button>
