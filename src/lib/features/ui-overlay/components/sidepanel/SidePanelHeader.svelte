<script lang="ts">
	import SvgIcon from '$lib/shared/components/SvgIcon.svelte';
	import { mdiHome, mdiArrowLeft } from '@mdi/js';

	interface Props {
		selectedObject: any;
		showAddPage: boolean;
		isExpanded: boolean;
		onBack?: () => void;
		onDragStart?: (e: TouchEvent | MouseEvent) => void;
		onDragMove?: (e: TouchEvent | MouseEvent) => void;
		onDragEnd?: () => void;
	}

	let { selectedObject, showAddPage, isExpanded, onBack, onDragStart, onDragEnd }: Props = $props();
</script>

<div class="flex-shrink-0 lg:border-b lg:border-gray-200/30 lg:dark:border-gray-700/30">
	<!-- Mobile drag handle -->
	<div class="relative flex justify-center py-4 lg:hidden">
		<!-- Invisible larger drag area -->
		<div
			class="absolute inset-0 -bottom-4 cursor-grab active:cursor-grabbing"
			ontouchstart={onDragStart}
			onmousedown={onDragStart}
			ontouchend={onDragEnd}
			onmouseup={onDragEnd}
			role="button"
			tabindex="0"
		></div>
		<!-- Visible handle -->
		<div
			class="pointer-events-none h-1 w-12 rounded-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
		></div>
	</div>

	<!-- Header Content - Only show when expanded -->
	<div
		class="flex items-center justify-between p-4"
		class:hidden={!isExpanded}
		class:lg:!flex={true}
	>
		<div class="flex min-w-0 flex-1 items-center gap-3">
			{#if showAddPage}
				<!-- Add Entities Header -->
				<button
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
					onclick={onBack}
				>
					<SvgIcon
						type="mdi"
						path={mdiArrowLeft}
						size="20"
						class="text-gray-600 dark:text-gray-300"
					/>
				</button>
				<div class="min-w-0">
					<h3 class="font-medium text-gray-900 dark:text-white">Add Entities</h3>
					<p class="truncate text-sm text-gray-500 dark:text-gray-400">
						Choose entities to add to {selectedObject?.name || 'this object'}
					</p>
				</div>
			{:else}
				<!-- Object Details Header -->
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50"
				>
					<SvgIcon type="mdi" path={mdiHome} size="20" class="text-blue-600 dark:text-blue-400" />
				</div>
				<div class="min-w-0">
					<h3 class="truncate font-medium text-gray-900 dark:text-white">
						{selectedObject?.name || 'Unknown Object'}
					</h3>
					<p class="truncate text-sm text-gray-500 dark:text-gray-400">
						{selectedObject?.type || '3D Object'}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
