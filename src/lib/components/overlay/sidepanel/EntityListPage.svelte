<script lang="ts">
	import { entities } from '../../../../stores/global';
	import AddCard from '../../cards/AddCard.svelte';
	import EntityCardRenderer from './EntityCardRenderer.svelte';

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
