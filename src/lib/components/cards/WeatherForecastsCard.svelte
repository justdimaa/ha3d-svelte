<script lang="ts">
	import { mdiWeatherPartlyCloudy } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import { DateTime } from 'luxon';

	// todo: fetch real values
	// todo: add freedom units too
</script>

<div class="flex">
	<div class="flex gap-4 overflow-x-auto pb-2">
		{#each { length: 6 } as _, i}
			<div
				class="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/10 p-4 shadow"
			>
				<span class="text-neutral-300">Wed</span>
				<SvgIcon type="mdi" path={mdiWeatherPartlyCloudy} size="48"></SvgIcon>
				<span class="text-xl font-bold">7°</span>
			</div>
		{/each}
	</div>
</div>
