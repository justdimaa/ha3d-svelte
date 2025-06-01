<script lang="ts">
	import { mdiNumeric } from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Format value with unit
	const formatValue = (value: number) => {
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}k`;
		}
		return value.toLocaleString();
	};

	const currentValue = $derived(parseFloat(entity.state));
	const min = $derived(entity.attributes.min || 0);
	const max = $derived(entity.attributes.max || 100);
	const unit = $derived(entity.attributes.unit_of_measurement);
</script>

<CardBase
	{entity}
	icon={mdiNumeric}
	primaryValue="{formatValue(currentValue, unit)}{unit || ''}"
	secondaryText="{min.toLocaleString()}-{max.toLocaleString()}{unit || ''}"
/>
