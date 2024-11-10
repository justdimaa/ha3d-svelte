<script lang="ts">
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';

	// todo: fetch live updates
	// todo: handle next day

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

	homeApi.subscribe(async (api) => {
		if (!api) return;

		let prefs = await api.sendMessagePromise({
			type: 'energy/get_prefs'
		});

		let entityNames = prefs.energy_sources.at(0).flow_from.map((s) => s.stat_energy_from);

		let today = DateTime.utc().startOf('day');

		let stats = await api.sendMessagePromise({
			type: 'recorder/statistics_during_period',
			start_time: today.minus({ hours: 1 }).toISO(),
			end_time: today.plus({ days: 1 }).minus({ milliseconds: 1 }).toISO(),
			statistic_ids: entityNames,
			period: 'hour',
			units: { energy: 'kWh', volume: 'm³' },
			types: ['change']
		});

		statSeries = Object.entries(stats).map(([name, data]) => ({
			name,
			data: data.map((d) => d.change.toFixed(2))
		}));

		chart.updateOptions(options);
	});

	onMount(async () => {
		const ApexCharts = (await import('apexcharts')).default;
		chart = new ApexCharts(chartDiv, options);
		chart.render();
	});
</script>

<div class="rounded-xl border border-white/10 bg-white/10 shadow">
	<div class="text-black" bind:this={chartDiv}></div>
</div>
