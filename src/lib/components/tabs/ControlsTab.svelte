<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import LightsCard from '../cards/LightsCard.svelte';
	import SensorCard from '../cards/SensorCard.svelte';
	import BinarySensorCard from '../cards/BinarySensorCard.svelte';

	interface Props {
		selectedEntities: HassEntity[];
	}

	let { selectedEntities }: Props = $props();
</script>

<span class="text-2xl font-bold">Controls</span>

{#each selectedEntities as entity}
	{#if entity.entity_id.split('.')[0] == 'light'}
		<LightsCard {entity} />
	{:else if entity.entity_id.split('.')[0] == 'sensor'}
		<SensorCard {entity} />
	{:else if entity.entity_id.split('.')[0] == 'binary_sensor'}
		<BinarySensorCard {entity} />
	{/if}
{/each}
