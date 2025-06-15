<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';
	import { getEntityIcon } from '$lib/shared/utils/icons';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Format value for display
	const formatValue = () => {
		if (isNaN(value)) return entity.state;
		if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
		return value.toLocaleString();
	};

	const value = $derived(parseFloat(entity.state));
	const unit = $derived(entity.attributes.unit_of_measurement);
	const deviceClass = $derived(entity.attributes.device_class);
	const sensorIcon = $derived(getEntityIcon(entity));
</script>

<CardBase
	{entity}
	icon={sensorIcon}
	primaryValue="{formatValue()}{unit || ''}"
	secondaryText={deviceClass
		? deviceClass.charAt(0).toUpperCase() + deviceClass.slice(1)
		: 'Sensor'}
/>
