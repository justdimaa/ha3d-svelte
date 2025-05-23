<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { getEntityIcon } from '../../../utils/icons';
	import { homeApi } from '../../../stores/global';
	import Switch from '../controls/Switch.svelte';

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
	class="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/10 p-4 shadow lg:backdrop-blur-2xl"
	class:opacity-40={!isAvailable}
	onclick={onToggle}
	disabled={!isAvailable}
>
	<div class="flex items-center gap-2">
		<SvgIcon class="flex-shrink-0" type="mdi" path={getEntityIcon(entity)} size="20" />
		<span class="text-left">{entity.attributes.friendly_name ?? entity.entity_id}</span>
	</div>
	<div class="flex">
		{#if isAvailable}
			<Switch checked={entity.state === 'on'} />
		{:else}
			<span>{entity.state}</span>
		{/if}
	</div>
</button>
