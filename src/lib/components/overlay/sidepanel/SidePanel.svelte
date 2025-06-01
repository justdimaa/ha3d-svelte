<script lang="ts">
	import { selectedMesh, tempMeshes } from '../../../../stores/global';
	import SidePanelHeader from './SidePanelHeader.svelte';
	import EntityListPage from './EntityListPage.svelte';
	import AddEntitiesPage from './AddEntitiesPage.svelte';

	interface Props {
		onDragStateChange: (dragProgress: number) => void;
	}

	let { onDragStateChange }: Props = $props();

	let selectedObject = $derived($selectedMesh ? $tempMeshes[$selectedMesh] : undefined);
	let showAddPage = $state(false);
	let isExpanded = $state(false);
	let isDragging = $state(false);
	let startY = $state(0);
	let currentY = $state(0);
	let panelHeight = $state(33.3333); // Height as percentage

	const expandPanel = () => {
		if (isExpanded) return;
		isExpanded = true;
		panelHeight = 100;
		onDragStateChange(1);
	};

	const goToAddPage = () => {
		showAddPage = true;
		expandPanel();
	};

	const goBack = () => {
		showAddPage = false;
	};

	const handleDragStart = (e: TouchEvent | MouseEvent) => {
		// Prevent right-click from triggering drag
		if ('button' in e && e.button === 2) return;

		isDragging = true;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		startY = clientY;
		currentY = clientY;

		// Add global event listeners
		if ('touches' in e) {
			document.addEventListener('touchmove', handleDragMove, { passive: false });
			document.addEventListener('touchend', handleDragEnd);
		} else {
			document.addEventListener('mousemove', handleDragMove);
			document.addEventListener('mouseup', handleDragEnd);
		}
	};

	const handleDragMove = (e: TouchEvent | MouseEvent) => {
		if (!isDragging) return;
		e.preventDefault();
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		currentY = clientY;

		// Calculate drag offset (negative means dragging up, positive means dragging down)
		const deltaY = currentY - startY;
		const windowHeight = window.innerHeight;

		// Convert pixel delta to percentage change
		const percentageChange = (deltaY / windowHeight) * 100;

		// Calculate new height based on current state and drag
		if (isExpanded) {
			// When expanded, allow dragging down to collapse (reduce height)
			panelHeight = Math.max(33.3333, Math.min(100, 100 - percentageChange));
		} else {
			// When collapsed, allow dragging up to expand (increase height)
			panelHeight = Math.max(33.3333, Math.min(100, 33.3333 - percentageChange));
		}

		// Calculate drag progress for blur effect
		const maxHeight = 100;
		const minHeight = 33.3333;
		const dragProgress = (panelHeight - minHeight) / (maxHeight - minHeight);

		// Notify parent about drag state
		onDragStateChange(dragProgress);
	};

	const handleDragEnd = () => {
		if (!isDragging) return;
		isDragging = false;

		// Remove global event listeners
		document.removeEventListener('touchmove', handleDragMove);
		document.removeEventListener('touchend', handleDragEnd);
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('mouseup', handleDragEnd);

		const deltaY = startY - currentY;
		const threshold = 50; // minimum drag distance to trigger action

		if (Math.abs(deltaY) > threshold) {
			if (deltaY > 0) {
				// Dragged up - expand
				isExpanded = true;
				panelHeight = 100;
			} else {
				// Dragged down - collapse
				isExpanded = false;
				panelHeight = 33.3333;
			}
		} else {
			// Snap back to current state
			panelHeight = isExpanded ? 100 : 33.3333;
		}

		// Reset drag values
		startY = 0;
		currentY = 0;
		onDragStateChange(isExpanded ? 1 : 0);
	};
</script>

<!-- class="pointer-events-auto -mx-3 -mb-3 flex flex-col overflow-auto rounded-t-3xl
bg-white/95 shadow-2xl backdrop-blur-xl lg:m-0 lg:!h-fit lg:max-h-full lg:w-1/3 lg:rounded-2xl lg:!transition-none dark:bg-gray-900/95" -->

<div class="h-1/3 lg:hidden"></div>

<div
	class="pointer-events-auto fixed bottom-0 left-0 flex w-full flex-col overflow-auto
       rounded-t-3xl bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-gray-900/95 lg:relative lg:m-0 lg:!h-full lg:w-1/3 lg:rounded-2xl lg:!transition-none"
	class:transition-all={!isDragging}
	class:duration-300={!isDragging}
	class:ease-out={!isDragging}
	style="height: {panelHeight}dvh; transform: translateZ(0);"
>
	<SidePanelHeader
		{selectedObject}
		{showAddPage}
		{isExpanded}
		onBack={goBack}
		onDragStart={handleDragStart}
		onDragMove={handleDragMove}
		onDragEnd={handleDragEnd}
	/>

	<div class="flex-1 overflow-y-auto p-4">
		{#if showAddPage}
			<AddEntitiesPage {selectedObject} />
		{:else}
			<EntityListPage {selectedObject} onAddEntities={goToAddPage} />
		{/if}
	</div>
</div>
