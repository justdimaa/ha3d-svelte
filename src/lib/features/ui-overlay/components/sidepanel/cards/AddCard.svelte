<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiPlus } from '@mdi/js';

	interface Props {
		onClick?: () => void;
	}

	let { onClick }: Props = $props();
</script>

<button
	class="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-100 active:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700 dark:active:bg-gray-600"
	onclick={onClick}
>
	<div class="flex items-center justify-center">
		<div class="flex items-center gap-3">
			<div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/50">
				<SvgIcon type="mdi" path={mdiPlus} size="18" class="text-green-600 dark:text-green-400" />
			</div>
			<div class="text-left">
				<h4 class="font-medium text-gray-700 dark:text-gray-200">Add Entity</h4>
				<p class="text-sm text-gray-500 dark:text-gray-400">Assign a device to this object</p>
			</div>
		</div>
	</div>
</button>
