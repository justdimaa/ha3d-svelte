<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { getEntityIcon } from '../../../utils/icons';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	const stateMapping: Record<string, { on: string; off: string }> = {
		battery: { on: 'Low', off: 'Normal' },
		battery_charging: { on: 'Charging', off: 'Not Charging' },
		carbon_monoxide: { on: 'Detected', off: 'Clear' },
		cold: { on: 'Cold', off: 'Normal' },
		connectivity: { on: 'Connected', off: 'Disconnected' },
		door: { on: 'Open', off: 'Closed' },
		garage_door: { on: 'Open', off: 'Closed' },
		gas: { on: 'Detected', off: 'Clear' },
		heat: { on: 'Hot', off: 'Normal' },
		light: { on: 'Detected', off: 'Clear' },
		lock: { on: 'Unlocked', off: 'Locked' },
		moisture: { on: 'Wet', off: 'Dry' },
		motion: { on: 'Detected', off: 'Clear' },
		moving: { on: 'Moving', off: 'Stopped' },
		occupancy: { on: 'Occupied', off: 'Clear' },
		opening: { on: 'Open', off: 'Closed' },
		plug: { on: 'Plugged', off: 'Unplugged' },
		power: { on: 'Active', off: 'Inactive' },
		presence: { on: 'Home', off: 'Away' },
		problem: { on: 'Detected', off: 'OK' },
		running: { on: 'Running', off: 'Stopped' },
		safety: { on: 'Unsafe', off: 'Safe' },
		smoke: { on: 'Detected', off: 'Clear' },
		sound: { on: 'Detected', off: 'Clear' },
		tamper: { on: 'Detected', off: 'Clear' },
		update: { on: 'Available', off: 'Up to date' },
		vibration: { on: 'Detected', off: 'Clear' },
		window: { on: 'Open', off: 'Closed' }
	};

	let deviceType = $derived(entity.attributes.device_class ?? 'none');
	let displayState = $derived(
		entity.state === 'on'
			? (stateMapping[deviceType]?.on ?? 'On')
			: (stateMapping[deviceType]?.off ?? 'Off')
	);
	let isAlert = $derived(
		['smoke', 'carbon_monoxide', 'gas', 'problem', 'safety'].includes(deviceType) &&
			entity?.state === 'on'
	);
</script>

<button
	class="flex justify-between gap-2 rounded-xl border p-4 shadow lg:backdrop-blur-2xl {isAlert
		? 'border-red-500/30 bg-red-500/20 text-red-500'
		: 'border-white/10 bg-white/10'}"
	disabled
>
	<div class="flex items-center gap-2">
		<SvgIcon type="mdi" path={getEntityIcon(entity)} size="24" />
		<span>{entity.attributes.friendly_name ?? entity.entity_id}</span>
	</div>
	<div class="flex gap-1">
		<span>{displayState}</span>
	</div>
</button>
