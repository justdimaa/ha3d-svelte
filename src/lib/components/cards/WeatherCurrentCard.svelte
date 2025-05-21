<script lang="ts">
	import { mdiMapMarkerOutline } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import { onMount } from 'svelte';
	import { DateTime } from 'luxon';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { homeApi } from '../../../stores/global';
	import { getConditionIcon, getWeatherLabel, getConditionImage } from '../../../utils/weather';

	interface Props {
		weatherEntity: HassEntity;
	}

	let { weatherEntity }: Props = $props();

	let currentForecast: any | undefined = $state(undefined);

	let isDay = $derived(() => {
		if (
			currentForecast &&
			currentForecast.datetime &&
			typeof currentForecast.datetime === 'string' &&
			currentForecast.datetime.length > 0
		) {
			const forecastDateTime = DateTime.fromISO(currentForecast.datetime);

			if (forecastDateTime.isValid) {
				const hour = forecastDateTime.hour;
				return hour >= 6 && hour < 20; // Day if between 6 AM and 8 PM
			}
		}

		// Default to day if still ambiguous
		return true;
	});

	let conditionToUse = $derived(currentForecast?.condition || weatherEntity.state);

	let weatherImageSrc = $derived(getConditionImage(conditionToUse, isDay()));
	let weatherIconSrc = $derived(getConditionIcon(conditionToUse, isDay()));

	onMount(async () => {
		await $homeApi?.subscribeMessage(
			(msg: any) => {
				if (!msg.forecast || !msg.forecast.at(0)) return;
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
	class="h-38 relative grid w-full grid-cols-3 justify-between rounded-xl border border-white/10 px-4 py-2 shadow"
>
	<img
		src={weatherImageSrc}
		alt="Weather background"
		class="absolute left-[-25%] top-[-100%] -z-20 h-[350%] w-[150%] max-w-[150%] object-cover opacity-80 blur-3xl brightness-90"
	/>

	<img
		src={weatherImageSrc}
		alt="Weather background"
		class="absolute left-0 top-0 z-0 h-full w-full rounded-xl object-cover brightness-90"
	/>

	<!-- Weather info section -->
	<div class="relative z-10 col-span-2 flex w-fit flex-col">
		<span class="text-2xl">Weather</span>
		<div class="flex items-center gap-1">
			<SvgIcon type="mdi" path={mdiMapMarkerOutline} size="18" class="-ml-1"></SvgIcon>
			<span>Earth</span>
		</div>
		<div class="flex items-end">
			<span class="text-7xl">{Math.round(currentForecast?.temperature)}°</span>
			<span class="mb-1">{getWeatherLabel(currentForecast?.condition)}</span>
		</div>
	</div>

	<!-- Weather icon section -->
	<div class="relative z-10 flex h-full justify-end">
		<img src={weatherIconSrc} alt="Weather icon" class="h-32" />
	</div>
</div>
