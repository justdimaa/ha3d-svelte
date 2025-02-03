<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiPlus } from '@mdi/js';

	interface Props {
		addEvent: () => void;
	}

	let { addEvent }: Props = $props();
</script>

<button
	class="flex justify-center gap-2 rounded-xl border border-cyan-300/50 bg-white/5 p-4 shadow hover:bg-white/20 lg:backdrop-blur-2xl"
	onclick={() => {
		addEvent();
	}}
>
	<div class="flex items-center gap-2">
		<SvgIcon type="mdi" path={mdiPlus} size="24" />
	</div>
</button>
