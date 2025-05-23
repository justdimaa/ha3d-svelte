<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { getEntityIcon } from '../../../utils/icons';
	import { homeApi } from '../../../stores/global';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	const callService = async () => {
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'button',
			service: 'press',
			service_data: {
				entity_id: entity.entity_id
			}
		});
	};
</script>

<button
	class="flex justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-4 shadow hover:bg-white/20 lg:backdrop-blur-2xl"
	onclick={callService}
>
	<div class="flex items-center gap-2">
		<SvgIcon type="mdi" path={getEntityIcon(entity)} size="24" />
		<span>{entity.attributes.friendly_name ?? entity.entity_id}</span>
	</div>
</button>
