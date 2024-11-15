<script lang="ts">
	import { mdiMapMarkerOutline } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import { onMount } from 'svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { homeApi } from '../../../stores/global';
	import { getWeatherIcon, getWeatherLabel } from '../../../utils/weather';

	interface Props {
		weatherEntity: HassEntity;
	}

	let { weatherEntity }: Props = $props();
	let currentForecast: any | undefined = $state(undefined);

	onMount(async () => {
		await $homeApi?.subscribeMessage(
			(msg) => {
				if (!msg.forecast || !msg.forecast.at(0)) return;
				console.log(msg.forecast[0]);
				currentForecast = msg.forecast.at(0);
			},
			{
				type: 'weather/subscribe_forecast',
				forecast_type: 'hourly',
				entity_id: weatherEntity.entity_id
			}
		);
	});
</script>

<div
	class="relative flex w-full flex-col rounded-xl border border-white/10 bg-white/10 px-4 py-2 shadow backdrop-blur-2xl"
>
	<SvgIcon
		type="mdi"
		path={getWeatherIcon(currentForecast?.condition)}
		size="96"
		class="absolute ml-auto self-end"
	></SvgIcon>
	<span class="text-2xl">Weather</span>
	<div class="flex items-center gap-1 text-neutral-300">
		<SvgIcon type="mdi" path={mdiMapMarkerOutline} size="18" class="-ml-1"></SvgIcon>
		<span>Earth</span>
	</div>
	<div class="flex items-end">
		<span class="text-7xl">{Math.round(currentForecast?.temperature)}°</span>
		<span class="mb-1 text-neutral-300">{getWeatherLabel(currentForecast?.condition)}</span>
	</div>
</div>
