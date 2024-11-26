<script lang="ts">
	import { DateTime } from 'luxon';
	import { onDestroy, onMount } from 'svelte';
	import { entities, homeApi } from '../../../stores/global';
	import type { Connection } from 'home-assistant-js-websocket';

	const today = DateTime.local().startOf('day');

	const hourlyStartTimes = [];
	for (let i = 0; i < 24; i++) {
		const startTime = today.plus({ hours: i });
		hourlyStartTimes.push(startTime.toMillis());
	}

	let statSeries = $state([]);

	let chartDiv: any;
	let chart: ApexCharts;

	let options = $derived({
		chart: {
			type: 'area',
			toolbar: {
				show: false
			}
		},
		series: statSeries,
		dataLabels: {
			enabled: true
		},
		stroke: {
			curve: 'smooth'
		},
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0.6,
				opacityTo: 0.0
			}
		},
		xaxis: {
			type: 'datetime',
			categories: hourlyStartTimes,
			labels: {
				style: {
					colors: 'white'
				},
				show: true
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: true
			}
		},
		yaxis: {
			labels: {
				style: {
					colors: 'white'
				}
			},
			show: false
		},
		legend: {
			labels: {
				colors: 'white'
			},
			show: false
		},
		tooltip: {
			theme: 'light',
			x: {
				show: true,
				format: 'dd MMM yyyy - HH:mm',
				formatter: undefined
			}
		},
		grid: {
			padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			},
			show: false
		}
	});

	async function updateChart(api: Connection | undefined) {
		if (!api) return;

		let prefs = await api.sendMessagePromise({
			type: 'energy/get_prefs'
		});

		let entityIds = prefs.energy_sources.at(0).flow_from.map((s) => s.stat_energy_from);

		let today = DateTime.utc().startOf('day');

		let stats = await api.sendMessagePromise({
			type: 'recorder/statistics_during_period',
			start_time: today.minus({ hours: 1 }).toISO(),
			end_time: today.plus({ days: 1 }).minus({ milliseconds: 1 }).toISO(),
			statistic_ids: entityIds,
			period: 'hour',
			units: { energy: 'kWh', volume: 'm³' },
			types: ['change']
		});

		statSeries = Object.entries(stats).map(([id, data]) => {
			// Create array of 24 hours with zeros
			const fullDayData = Array.from({ length: 24 }, (_, i) => ({
				start: DateTime.utc().startOf('day').plus({ hours: i }).toMillis(),
				change: 0
			}));

			// Fill in actual values
			data.forEach((d) => {
				// todo: does it have to be utc or local?
				const hour = DateTime.fromMillis(d.start).toLocal().hour;
				fullDayData[hour].change = Number(d.change.toFixed(2));
			});

			return {
				name: $entities[id]?.attributes.friendly_name ?? id,
				data: fullDayData.map((d) => ({
					x: d.start,
					y: d.change
				}))
			};
		});

		chart?.updateOptions(options);
	}

	$effect(() => {
		updateChart($homeApi);
	});

	onMount(async () => {
		const ApexCharts = (await import('apexcharts')).default;
		chart = new ApexCharts(chartDiv, options);
		chart.render();
	});

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<div class="rounded-xl border border-white/10 bg-white/10 shadow lg:backdrop-blur-2xl">
	<div class="text-black" bind:this={chartDiv}></div>
</div>
