<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon';
	import { mdiHome, mdiViewDashboard } from '@mdi/js';
</script>

<div
	class="flex h-full flex-col items-center gap-4 border-r-2 border-white/10 px-2 py-4 backdrop-blur"
>
	<SvgIcon type="mdi" path={mdiHome} size="32" class="text-cyan-400"></SvgIcon>
	<div class="flex flex-col">
		<button class="rounded-xl border-2 border-white/30 p-2">
			<SvgIcon type="mdi" path={mdiViewDashboard} class="text-cyan-200"></SvgIcon>
		</button>
	</div>
</div>
