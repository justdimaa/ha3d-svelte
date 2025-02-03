<script lang="ts">
	import { entities, selectedMesh, tempMeshes } from '../../../stores/global';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { type HassEntity } from 'home-assistant-js-websocket';
	import { getEntityIcon } from '../../../utils/icons';
	import { mdiMagnify } from '@mdi/js';
	import { getSettings, updateScene } from '$lib/ha/api';

	// todo: tab shouldnt disappear after selected first entity
	const ITEMS_PER_PAGE = 10;

	interface Props {
		selectedEntities: HassEntity[] | undefined;
	}

	let { selectedEntities }: Props = $props();

	let filterText = $state('');
	let currentPage = $state(1);

	let filteredEntities = $derived(
		Object.entries($entities)
			.filter(([id, e]) => {
				const ft = filterText.toLocaleLowerCase();
				return (
					!e.attributes.hidden &&
					(id.toLocaleLowerCase().includes(ft) ||
						e.attributes.friendly_name?.toLocaleLowerCase().includes(ft))
				);
			})
			.map(([_, e]) => e)
	);

	let paginatedEntities = $derived(
		Object.fromEntries(
			Object.entries(filteredEntities).slice(
				(currentPage - 1) * ITEMS_PER_PAGE,
				currentPage * ITEMS_PER_PAGE
			)
		)
	);

	let totalPages = $derived(Math.ceil(Object.keys(filteredEntities).length / ITEMS_PER_PAGE));

	$effect(() => {
		filterText; // Watch filterText
		currentPage = 1; // Reset page when filterText changes
	});

	async function onToggleEntity(entity: HassEntity) {
		const settings = await getSettings();

		let currentSceneId = settings.defaultSceneId;

		const meshData = $tempMeshes[$selectedMesh!] || {
			id: $selectedMesh!,
			entityIds: [] // Changed from snake_case
		};

		const entityId = entity.entity_id;
		const index = meshData.entityIds.indexOf(entityId);

		if (index === -1) {
			meshData.entityIds.push(entityId);
		} else {
			meshData.entityIds.splice(index, 1);
		}

		// Update local state first (optimistic update)
		if (meshData.entityIds.length > 0) {
			$tempMeshes[$selectedMesh!] = meshData;
		} else {
			delete $tempMeshes[$selectedMesh!];
		}

		// Force Svelte reactivity
		$tempMeshes = { ...$tempMeshes };

		// Update using new API
		try {
			await updateScene(currentSceneId!, {
				meshes: $tempMeshes
			});
		} catch (error) {
			console.error('Failed to update scene:', error);
			// Could add error handling/rollback here
		}
	}

	function changePage(page: number) {
		currentPage = page;
	}
</script>

<span class="text-2xl font-bold">Add entity</span>
<span>Select the entity you want to add to the object:</span>

<div
	class="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 shadow lg:backdrop-blur-2xl"
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
	{#each Object.entries(paginatedEntities) as [_, entity]}
		<button
			class="flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/10 px-4 py-2 shadow hover:bg-white/20 lg:backdrop-blur-2xl"
			onclick={async () => await onToggleEntity(entity)}
		>
			<div class="flex gap-2 truncate">
				<SvgIcon class="mt-1 flex-shrink-0" type="mdi" path={getEntityIcon(entity)} size="20" />
				<div class="flex flex-col truncate text-left">
					<span class="truncate" title={entity.attributes.friendly_name ?? '-'}
						>{entity.attributes.friendly_name ?? '-'}</span
					>
					<span class="truncate text-sm text-white/80" title={entity.entity_id}
						>{entity.entity_id}</span
					>
				</div>
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

	{#if totalPages > 1}
		<div class="flex items-center justify-between gap-2">
			<button
				class="select-none rounded-lg bg-white/10 px-6 py-1 hover:bg-white/20 disabled:opacity-50"
				disabled={currentPage <= 1}
				onclick={() => changePage(currentPage - 1)}
			>
				{'<'}
			</button>

			<span class="text-sm text-white/70">
				Page {currentPage} of {totalPages}
			</span>

			<button
				class="select-none rounded-lg bg-white/10 px-6 py-1 hover:bg-white/20 disabled:opacity-50"
				disabled={currentPage >= totalPages}
				onclick={() => changePage(currentPage + 1)}
			>
				{'>'}
			</button>
		</div>
	{/if}
</div>
