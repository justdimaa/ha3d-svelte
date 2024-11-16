<script lang="ts">
	import { mdiWeatherPartlyCloudy } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import { DateTime } from 'luxon';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';
	import { getWeatherIcon } from '../../../utils/weather';

	interface Props {
		weatherEntity: HassEntity;
	}

	let { weatherEntity }: Props = $props();
	let forecasts = $state([]);
	let forecastsDisplay = $derived(() => {
		const groupedByDay = forecasts.reduce((acc, item) => {
			const date = DateTime.fromISO(item.datetime).toISODate(); // Get only the date (YYYY-MM-DD)
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push(item);
			return acc;
		}, {});

		// Select the most representative forecast for each day
		const dailyForecast = Object.entries(groupedByDay).map(([date, forecasts]) => {
			// Example strategy: Choose the forecast closest to 12:00 PM
			const targetTime = DateTime.fromISO(date).set({ hour: 12 });
			const closestForecast = forecasts.reduce((closest, current) => {
				const currentTime = DateTime.fromISO(current.datetime);
				const closestTime = DateTime.fromISO(closest.datetime);
				return Math.abs(currentTime.diff(targetTime).milliseconds) <
					Math.abs(closestTime.diff(targetTime).milliseconds)
					? current
					: closest;
			});
			return closestForecast;
		});

		return dailyForecast;
	});

	onMount(async () => {
		await $homeApi?.subscribeMessage(
			(msg) => {
				if (!msg.forecast) return;
				forecasts = msg.forecast;
			},
			{
				type: 'weather/subscribe_forecast',
				forecast_type: 'hourly',
				entity_id: weatherEntity.entity_id
			}
		);
	});
</script>

<div class="flex gap-2 overflow-x-auto">
	{#each forecastsDisplay() as forecast}
		<div
			class="flex grow flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-4 py-2 shadow backdrop-blur-2xl"
		>
			<span class="text-neutral-300">{DateTime.fromISO(forecast.datetime).weekdayShort}</span>
			<div class="w-8">
				{@html getWeatherIcon(forecast?.condition)}
			</div>
			<span class="text-xl font-bold">{Math.round(forecast.temperature)}°</span>
		</div>
	{/each}
</div>
