<script lang="ts">
	import { entities, selectedMesh, tempMeshes } from '../../../stores/global';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { getEntityIcon } from '../../../utils/icons';
	import { mdiDevices, mdiMagnify } from '@mdi/js';

	// todo: tab shouldnt disappear after selected first entity

	interface Props {
		selectedEntities: HassEntity[] | undefined;
	}

	let { selectedEntities }: Props = $props();

	let filteredEntities = $derived(
		Object.entries($entities)
			.filter(([id, _]) => id.includes(filterText))
			.map(([_, e]) => e)
	);

	let filterText = $state('');

	function onToggleEntity(entity: HassEntity) {
		const meshData = $tempMeshes[$selectedMesh!] || { id: $selectedMesh!, entity_ids: [] };
		const entityId = entity.entity_id;
		const index = meshData.entity_ids.indexOf(entityId);

		if (index === -1) {
			meshData.entity_ids.push(entityId);
		} else {
			meshData.entity_ids.splice(index, 1);
		}

		$tempMeshes[$selectedMesh!] = meshData.entity_ids.length > 0 ? meshData : undefined;
		$tempMeshes = { ...$tempMeshes }; // forces svelte to update
		localStorage.setItem('meshes', JSON.stringify($tempMeshes));
	}
</script>

<span class="text-2xl font-bold">Add Entity</span>
<span>Select the entity you want to add to the mesh:</span>

<div
	class="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 shadow backdrop-blur-2xl"
>
	<SvgIcon type="mdi" path={mdiMagnify} size="20" />
	<input
		class="h-12 grow bg-transparent outline-none"
		type="text"
		placeholder="Search for entity"
		bind:value={filterText}
	/>
</div>

<div class="flex flex-col gap-2">
	{#each Object.entries(filteredEntities) as [id, entity], idx (id)}
		<button
			class="flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/10 p-4 shadow backdrop-blur-2xl hover:bg-white/20"
			onclick={() => onToggleEntity(entity)}
		>
			<div class="flex items-center gap-2 truncate">
				<SvgIcon class="flex-shrink-0" type="mdi" path={getEntityIcon(entity)} size="20" />
				<span class="truncate">{entity.entity_id}</span>
			</div>
			<label class="pointer-events-none inline-flex cursor-pointer items-center">
				<input
					type="checkbox"
					checked={selectedEntities?.find((e) => e.entity_id == entity.entity_id) != undefined}
					class="peer sr-only"
				/>
				<div
					class="peer relative h-6 w-11 rounded-full bg-white/10 outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
				></div>
			</label>
		</button>
	{/each}
</div>
