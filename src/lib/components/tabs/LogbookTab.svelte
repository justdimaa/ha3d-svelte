<script lang="ts">
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { DateTime } from 'luxon';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiClockOutline, mdiFunction } from '@mdi/js';

	// todo: replace hardcoded date
	// todo: show user in logs
	// todo: pagination

	interface Props {
		selectedEntities: HassEntity[];
	}

	let { selectedEntities }: Props = $props();

	let logs = $state([]);

	let sortedLogs = $derived(logs.toSorted((a, b) => (a.when - b.when > 0 ? -1 : 1)).slice(0, 25));

	onMount(async () => {
		$homeApi?.subscribeMessage(
			(msg) => {
				for (let event of msg.events) {
					console.debug(event);
					logs.push(event);
				}
			},
			{
				type: 'logbook/event_stream',
				start_time: '2024-11-08T18:00:57.720Z',
				end_time: '2025-11-09T18:00:57.720Z',
				entity_ids: [selectedEntities[0].entity_id]
			}
		);
	});
</script>

<span class="text-2xl font-bold">Logbook</span>

<div class="flex flex-col divide-y divide-white/20">
	{#each sortedLogs as event}
		<div class="flex flex-col py-2">
			<div class="flex items-center gap-1">
				<SvgIcon type="mdi" path={mdiFunction} size="16"></SvgIcon>
				<span>{event.context_service} • {event.state} </span>
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
