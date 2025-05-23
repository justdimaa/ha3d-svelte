<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { getEntityIcon } from '../../../utils/icons';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();
</script>

<button
	class="flex justify-between gap-2 rounded-xl border border-white/10 bg-white/10 p-4 shadow lg:backdrop-blur-2xl"
	disabled
>
	<div class="flex items-center gap-2">
		<SvgIcon class="flex-shrink-0" type="mdi" path={getEntityIcon(entity)} size="20" />
		<span class="text-left">{entity.attributes.friendly_name ?? entity.entity_id}</span>
	</div>
	<div class="flex gap-1">
		<!-- {entity.attributes.device_class} -->
		<span>{entity.state}</span>
		<span>{entity.attributes.unit_of_measurement}</span>
	</div>
</button>
