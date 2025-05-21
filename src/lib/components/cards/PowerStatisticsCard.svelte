<script lang="ts">
	import { DateTime } from 'luxon';
	import { onDestroy, onMount } from 'svelte';
	import { entities, homeApi } from '../../../stores/global';
	import type { Connection } from 'home-assistant-js-websocket';

	// State for chart series data
	let statSeries = $state<ApexAxisChartSeries | ApexNonAxisChartSeries>([]);

	let chartDiv: HTMLDivElement | undefined = $state();
	let chart: ApexCharts | undefined = $state();

	// ApexCharts options, derived from state
	let options = $derived<ApexCharts.ApexOptions>({
		chart: {
			type: 'area',
			toolbar: {
				show: false
			},
			zoom: {
				enabled: false
			},
			fontFamily: 'inherit',
			animations: {
				enabled: false // Disable animations for better performance
			}
		},
		series: statSeries,
		dataLabels: {
			enabled: false // Changed to false, can be too cluttered for 24h
		},
		stroke: {
			curve: 'smooth',
			width: 2
		},
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0.5,
				opacityTo: 0.0
			}
		},
		xaxis: {
			type: 'datetime',
			labels: {
				style: {
					colors: 'white',
					fontSize: '14px'
				},
				show: true,
				datetimeUTC: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: true,
				color: '#e0e0e0'
			},
			tooltip: {
				enabled: false // Disable x-axis tooltip if main tooltip is sufficient
			}
		},
		yaxis: {
			labels: {
				style: {
					colors: 'white',
					fontSize: '14px'
				},
				formatter: (val: number) => {
					return val.toFixed(1) + ' kWh'; // Add unit to Y-axis if shown
				}
			},
			show: true // Keep Y-axis hidden as per original, but formatter is ready
		},
		legend: {
			labels: {
				colors: 'white'
			},
			offsetY: 12,
			fontSize: '14px',
			onItemClick: {
				toggleDataSeries: false
			},
			show: true
		},
		tooltip: {
			theme: 'dark',
			x: {
				show: true,
				formatter(val, _opts) {
					const date = DateTime.fromMillis(val);
					return date.toLocaleString(DateTime.DATETIME_MED); // Show full date-time
				}
			},
			y: {
				formatter: function (val: number) {
					return val.toFixed(2) + ' kWh';
				},
				title: {
					formatter: (seriesName: string) => seriesName + ':'
				}
			}
		},
		grid: {
			padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 10
			},
			show: false
		}
	});

	function getEnergyPrefs(api: Connection) {
		return api.sendMessagePromise<{
			energy_sources: { flow_from: { stat_energy_from: string }[] }[];
		}>({
			type: 'energy/get_prefs'
		});
	}

	function getStats(api: Connection, entityIds: string[], startTime: DateTime, endTime: DateTime) {
		return api.sendMessagePromise<Record<string, { start: number; change: number | null }[]>>({
			type: 'recorder/statistics_during_period',
			start_time: startTime.toISO(),
			end_time: endTime.toISO(),
			statistic_ids: entityIds,
			period: 'hour',
			units: { energy: 'kWh', volume: 'm³' },
			types: ['change']
		});
	}

	function buildSeries(statsResponse: Record<string, { start: number; change: number | null }[]>) {
		console.log(statsResponse);

		return Object.entries(statsResponse).map(([id, dataFromApi]) => {
			const seriesPoints = dataFromApi.map((apiStat) => {
				if (apiStat.start == null) return { x: 0, y: 0 };

				// Add one hour to each x value for display
				return {
					x: DateTime.fromMillis(apiStat.start).plus({ hours: 1 }).toMillis(),
					y: Number(apiStat.change?.toFixed(2) ?? 0)
				};
			});

			let friendlyName = $entities[id]?.attributes.friendly_name ?? id;
			// Remove "Summation delivered" from the end if present
			friendlyName = friendlyName.replace(/\s*Summation delivered\s*$/, '').trim();

			return {
				name: friendlyName,
				data: seriesPoints
			};
		});
	}

	async function updateChart(api: Connection | undefined) {
		if (!api) return;

		let prefs;

		try {
			prefs = await getEnergyPrefs(api);
		} catch (error) {
			console.error('PowerStatisticsCard: Failed to get energy preferences:', error);
			statSeries = [];
			return;
		}

		const firstEnergySource = prefs.energy_sources.at(0);

		if (
			!firstEnergySource ||
			!firstEnergySource.flow_from ||
			firstEnergySource.flow_from.length === 0
		) {
			console.warn('PowerStatisticsCard: No energy flow_from sources found or configured.');
			statSeries = [];
			return;
		}

		const entityIds = firstEnergySource.flow_from
			.map((s) => s.stat_energy_from)
			.filter((id) => !!id);

		if (entityIds.length === 0) {
			console.warn('PowerStatisticsCard: No valid entity IDs found for energy statistics.');
			statSeries = [];
			return;
		}

		let utcNow = DateTime.utc();
		const startTimeUtc = utcNow.minus({ hours: 26 });
		const endTimeUtc = utcNow;

		let statsResponse;

		try {
			statsResponse = await getStats(api, entityIds, startTimeUtc, endTimeUtc);
		} catch (error) {
			console.error('PowerStatisticsCard: Failed to fetch statistics:', error);
			statSeries = [];
			return;
		}

		statSeries = buildSeries(statsResponse);
		chart?.updateOptions(options);
	}

	$effect(() => {
		if ($homeApi) {
			updateChart($homeApi);
		}

		// Refresh data one minute after each hour
		const nextHour = DateTime.utc().plus({ hours: 1 }).startOf('hour').plus({ minutes: 1 });
		const msUntilNextUpdate = nextHour.diffNow().as('milliseconds');

		let intervalId: NodeJS.Timeout | undefined;
		let timeoutId = setTimeout(() => {
			if ($homeApi) updateChart($homeApi);

			// After the first update, update every hour + 1 minute
			intervalId = setInterval(
				() => {
					if ($homeApi) updateChart($homeApi);
				},
				60 * 60 * 1000
			); // every hour
		}, msUntilNextUpdate);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (intervalId) clearInterval(intervalId);
		};
	});

	onMount(async () => {
		const ApexChartsLib = (await import('apexcharts')).default;

		if (chartDiv && !chart) {
			// Ensure chart is not already initialized
			chart = new ApexChartsLib(chartDiv, options);
			chart.render();
		}
	});

	onDestroy(() => {
		chart?.destroy();
		chart = undefined;
	});
</script>

<div class="rounded-xl border border-white/10 bg-white/10 pb-1 shadow lg:backdrop-blur-2xl">
	<div class="min-h-[200px] text-black" bind:this={chartDiv}></div>
</div>
