<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';

	interface Props {
		selectedEntities: HassEntity[];
	}

	let { selectedEntities }: Props = $props();
</script>

<span class="hidden text-2xl font-bold lg:block">Information</span>

<span class="text-2xl">Debug</span>
<div
	class="flex justify-center rounded-xl border border-white/10 bg-white/10 p-4 shadow lg:backdrop-blur-2xl"
>
	<span class="line-clamp-2 flex w-full break-all text-sm">{JSON.stringify(selectedEntities)}</span>
</div>
