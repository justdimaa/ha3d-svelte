<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { DateTime } from 'luxon';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiCalendarOutline, mdiClockOutline, mdiFunction } from '@mdi/js';
	import flatpickr from 'flatpickr';

	interface Props {
		selectedEntities: HassEntity[];
	}

	let { selectedEntities }: Props = $props();

	let logs = $state([]);

	let sortedLogs = $derived(logs.toSorted((a, b) => (a.when - b.when > 0 ? -1 : 1)).slice(0, 25));

	let startTime = $state(DateTime.now().minus({ days: 1 }));
	let endTime = $state(DateTime.now().plus({ years: 1 }));

	$effect(() => {
		logs = [];

		$homeApi?.subscribeMessage(
			(msg) => {
				for (let event of msg.events) {
					logs.push(event);
				}
			},
			{
				type: 'logbook/event_stream',
				start_time: startTime.toUTC().toISO(),
				end_time: endTime.toUTC().toISO(),
				entity_ids: selectedEntities.map((e) => e.entity_id)
			}
		);
	});

	let calendarDiv: HTMLElement;
	let timePicker: flatpickr.Instance;

	onMount(() => {
		timePicker = flatpickr('#logsTimeRange', {
			mode: 'range',
			enableTime: true,
			dateFormat: 'm/d/Y H:i',
			defaultDate: [startTime.toUTC().toISO(), endTime.toUTC().toISO()],
			appendTo: calendarDiv,
			time_24hr: false,
			clickOpens: false,
			onChange: (e) => {
				let start = e[0];
				let end = e[1];

				if (!start || !end) return;

				let startL = DateTime.fromJSDate(start);
				let endL = DateTime.fromJSDate(end);

				if (!startL.isValid || !endL.isValid) return;

				startTime = startL;
				endTime = endL;
			}
		}) as flatpickr.Instance;
	});

	onDestroy(() => {
		timePicker.destroy();
	});
</script>

<span class="hidden text-2xl font-bold lg:block">Logbook</span>

<div class="flex flex-col gap-2 pb-2" bind:this={calendarDiv}>
	<button
		class="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 shadow lg:backdrop-blur-2xl"
		onclick={() => timePicker.open()}
	>
		<SvgIcon type="mdi" path={mdiCalendarOutline} size="20" />
		<input
			id="logsTimeRange"
			class="h-12 grow cursor-pointer bg-transparent outline-none"
			type="text"
			placeholder="Select Time Range"
		/>
	</button>
</div>

<div class="grid gap-2">
	{#each sortedLogs as event}
		<div
			class="flex flex-col rounded-xl border border-white/10 bg-white/10 px-4 py-2 shadow lg:backdrop-blur-2xl"
		>
			<div class="flex items-center gap-1">
				<SvgIcon type="mdi" path={mdiFunction} size="16"></SvgIcon>
				<span>{event.context_service} • {event.state}</span>
			</div>
			<div class="flex items-center gap-1 text-neutral-300">
				<SvgIcon type="mdi" path={mdiClockOutline} size="12"></SvgIcon>
				<span class="text-sm"
					>{DateTime.fromSeconds(event.when).toLocaleString(DateTime.DATETIME_MED)}</span
				>
			</div>
		</div>
	{/each}
</div>
