<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import BinarySensorCard from '../../cards/BinarySensorCard.svelte';
	import ButtonCard from '../../cards/ButtonCard.svelte';
	import DeviceTrackerCard from '../../cards/DeviceTrackerCard.svelte';
	import FanCard from '../../cards/FanCard.svelte';
	import LightCard from '../../cards/LightCard.svelte';
	import NumberCard from '../../cards/NumberCard.svelte';
	import PersonCard from '../../cards/PersonCard.svelte';
	import PlantCard from '../../cards/PlantCard.svelte';
	import SelectCard from '$lib/components/cards/SelectCard.svelte';
	import SensorCard from '../../cards/SensorCard.svelte';
	import SwitchCard from '../../cards/SwitchCard.svelte';
	import ZoneCard from '../../cards/ZoneCard.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();
</script>

{#if entity.entity_id.startsWith('binary_sensor.')}
	<BinarySensorCard {entity} />
{:else if entity.entity_id.startsWith('button.')}
	<ButtonCard {entity} />
{:else if entity.entity_id.startsWith('device_tracker.')}
	<DeviceTrackerCard {entity} />
{:else if entity.entity_id.startsWith('fan.')}
	<FanCard {entity} />
{:else if entity.entity_id.startsWith('light.')}
	<LightCard {entity} />
{:else if entity.entity_id.startsWith('number.')}
	<NumberCard {entity} />
{:else if entity.entity_id.startsWith('person.')}
	<PersonCard {entity} />
{:else if entity.entity_id.startsWith('plant.')}
	<PlantCard {entity} />
{:else if entity.entity_id.startsWith('select.')}
	<SelectCard {entity} />
{:else if entity.entity_id.startsWith('sensor.')}
	<SensorCard {entity} />
{:else if entity.entity_id.startsWith('switch.')}
	<SwitchCard {entity} />
{:else if entity.entity_id.startsWith('zone.')}
	<ZoneCard {entity} />
{/if}
