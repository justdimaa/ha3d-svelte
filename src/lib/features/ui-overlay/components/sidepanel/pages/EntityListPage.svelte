<script lang="ts">
	import AddCard from '$lib/features/ui-overlay/components/sidepanel/cards/AddCard.svelte';
	import { entities } from '$lib/shared/stores/global';
	import EntityCardRenderer from '../EntityCardRenderer.svelte';

	interface Props {
		selectedObject: any;
		onAddEntities: () => void;
	}

	let { selectedObject, onAddEntities }: Props = $props();
</script>

<div class="space-y-3">
	{#each selectedObject?.entityIds as entityId}
		{@const entity = $entities[entityId]}
		{#if entity}
			<EntityCardRenderer {entity} />
		{/if}
	{/each}

	<AddCard onClick={onAddEntities} />
</div>
