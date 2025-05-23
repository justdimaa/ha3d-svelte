<script lang="ts">
	import { DateTime } from 'luxon';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';
	import { getConditionIcon } from '../../../utils/weather';

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
			(msg: any) => {
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
			class="flex grow flex-col items-center gap-1 overflow-hidden rounded-xl border border-white/10 bg-white/10 px-4 py-2 shadow lg:backdrop-blur-2xl"
		>
			<span>{DateTime.fromISO(forecast.datetime).weekdayShort}</span>
			<div class="w-8">
				<img src={getConditionIcon(forecast?.condition, true)} alt="Weather icon" class="h-8 w-8" />
			</div>
			<span class="text-xl font-bold">{Math.round(forecast.temperature)}°</span>
		</div>
	{/each}
</div>
