<script lang="ts">
	import { mdiGestureTap } from '@mdi/js';
	import CardBase from './CardBase.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { homeApi } from '../../../stores/global';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Button press function
	const pressButton = async () => {
		console.log('Button pressed:', entity.entity_id);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'button',
			service: 'press',
			service_data: { entity_id: entity.entity_id }
		});
	};
</script>

<button
	onclick={pressButton}
	class="w-full rounded-lg border-2 border-dashed border-blue-300 text-left transition-colors hover:border-blue-500 hover:bg-gray-100 active:bg-gray-200 dark:border-blue-600 dark:hover:border-blue-400 dark:hover:bg-gray-700 dark:active:bg-gray-600"
>
	<CardBase
		{entity}
		icon={mdiGestureTap}
		primaryValue="Press"
		secondaryText="Button"
		className="cursor-pointer bg-transparent hover:bg-transparent"
	></CardBase>
</button>
