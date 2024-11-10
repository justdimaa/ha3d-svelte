<script lang="ts">
	import { mdiMapMarkerOutline, mdiWeatherPartlyCloudy } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
</script>

<div class="relative flex w-full flex-col rounded-xl border border-white/10 bg-white/10 p-4 shadow">
	<SvgIcon type="mdi" path={mdiWeatherPartlyCloudy} size="96" class="absolute ml-auto self-end"
	></SvgIcon>
	<span class="text-2xl">Weather</span>
	<div class="flex items-center gap-1 text-neutral-300">
		<SvgIcon type="mdi" path={mdiMapMarkerOutline} size="18" class="-ml-1"></SvgIcon>
		<span>Earth</span>
	</div>
	<div class="flex items-end">
		<span class="text-7xl">24°</span>
		<span class="mb-1 text-neutral-300">Mostly Clear</span>
	</div>
</div>
