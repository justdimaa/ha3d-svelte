<script lang="ts">
	import { DateTime } from 'luxon';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';
	import { getConditionIcon } from '../../../utils/weather';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiCalendarToday, mdiCalendarWeek } from '@mdi/js';

	interface Props {
		weatherEntity: HassEntity;
	}

	let { weatherEntity }: Props = $props();

	let forecasts = $state([]);
	let viewMode = $state<'daily' | 'hourly'>('daily');

	let forecastsDisplay = $derived(() => {
		if (viewMode === 'hourly') {
			// Show hourly forecasts for today only (next 24 hours)
			const now = DateTime.now();
			const tomorrow = now.plus({ days: 1 });

			return forecasts
				.filter((forecast) => {
					const forecastTime = DateTime.fromISO(forecast.datetime);
					return forecastTime >= now && forecastTime <= tomorrow;
				})
				.slice(0, 8); // Limit to 8 hours to fit the UI
		} else {
			// Group by day and select representative forecast for each day
			const groupedByDay = forecasts.reduce((acc, item) => {
				const date = DateTime.fromISO(item.datetime).toISODate();
				if (!acc[date]) {
					acc[date] = [];
				}
				acc[date].push(item);
				return acc;
			}, {});

			const dailyForecast = Object.entries(groupedByDay).map(([date, forecasts]) => {
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

			return dailyForecast.slice(0, 7); // Limit to 7 days
		}
	});

	const formatDisplayTime = (datetime: string) => {
		const dt = DateTime.fromISO(datetime);
		if (viewMode === 'hourly') {
			return dt.toFormat('HH:mm');
		} else {
			return dt.weekdayShort;
		}
	};

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

<div class="flex flex-col gap-2">
	<!-- Toggle buttons -->
	<div class="flex gap-2">
		<button
			class="flex w-full items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-sm transition-colors {viewMode ===
			'daily'
				? 'bg-white/20 text-white'
				: 'bg-white/5 text-white/70 hover:bg-white/10'}"
			onclick={() => (viewMode = 'daily')}
		>
			<SvgIcon type="mdi" path={mdiCalendarWeek} size="16" />
			Week
		</button>
		<button
			class="flex w-full items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-sm transition-colors {viewMode ===
			'hourly'
				? 'bg-white/20 text-white'
				: 'bg-white/5 text-white/70 hover:bg-white/10'}"
			onclick={() => (viewMode = 'hourly')}
		>
			<SvgIcon type="mdi" path={mdiCalendarToday} size="16" />
			Today
		</button>
	</div>

	<!-- Forecasts display -->
	<div
		class="flex gap-2 overflow-x-auto"
		onwheel={(e) => {
			// Prevent vertical scrolling and allow horizontal scrolling
			e.preventDefault();
			e.currentTarget.scrollLeft += e.deltaY;
		}}
	>
		{#each forecastsDisplay() as forecast}
			<div
				class="flex shrink-0 grow flex-col items-center gap-1 overflow-hidden rounded-xl border border-white/10 bg-white/10 px-4 py-2 shadow lg:backdrop-blur-2xl"
			>
				<span class="text-sm">{formatDisplayTime(forecast.datetime)}</span>
				<div class="w-8">
					<img
						src={getConditionIcon(forecast?.condition, true)}
						alt="Weather icon"
						class="h-8 w-8"
					/>
				</div>
				<span class="text-xl font-bold">{Math.round(forecast.temperature)}°</span>
			</div>
		{/each}
	</div>
</div>
