<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import LightsCard from '../cards/LightsCard.svelte';
	import SensorCard from '../cards/SensorCard.svelte';
	import BinarySensorCard from '../cards/BinarySensorCard.svelte';
	import SwitchCard from '../cards/SwitchCard.svelte';
	import FanCard from '../cards/FanCard.svelte';
	import ButtonCard from '../cards/ButtonCard.svelte';

	interface Props {
		selectedEntities: HassEntity[];
	}

	let { selectedEntities }: Props = $props();
</script>

<span class="hidden text-2xl font-bold lg:block">Controls</span>

{#each selectedEntities as entity}
	{#if entity.entity_id.split('.')[0] == 'light'}
		<LightsCard {entity} />
	{:else if entity.entity_id.split('.')[0] == 'sensor'}
		<SensorCard {entity} />
	{:else if entity.entity_id.split('.')[0] == 'binary_sensor'}
		<BinarySensorCard {entity} />
	{:else if entity.entity_id.split('.')[0] == 'switch'}
		<SwitchCard {entity} />
	{:else if entity.entity_id.split('.')[0] == 'fan'}
		<FanCard {entity} />
	{:else if entity.entity_id.split('.')[0] == 'button'}
		<ButtonCard {entity} />
	{/if}
{/each}
