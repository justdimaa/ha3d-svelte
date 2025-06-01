<script lang="ts">
	import { mdiToggleSwitch } from '@mdi/js';
	import CardBase from './CardBase.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { homeApi } from '../../../stores/global';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	const handleToggle = async () => {
		console.log('Toggling switch:', entity.entity_id);

		// Call Home Assistant service to toggle switch
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'switch',
			service: isOn ? 'turn_off' : 'turn_on',
			service_data: { entity_id: entity.entity_id }
		});
	};

	const isOn = $derived(entity.state === 'on');
</script>

<CardBase
	{entity}
	icon={mdiToggleSwitch}
	showStatusDot={true}
	showToggle={true}
	toggleState={isOn}
	onToggle={handleToggle}
/>
