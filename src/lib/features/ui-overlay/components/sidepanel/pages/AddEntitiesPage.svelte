<script lang="ts">
	import { SceneService } from '$lib/features/home-assistant/api/sceneService';
	import { SettingsService } from '$lib/features/home-assistant/api/settingsService';
	import { entities, selectedMesh, tempMeshes } from '$lib/shared/stores/global';
	import SvgIcon from '$lib/shared/components/SvgIcon.svelte';
	import { mdiMagnify, mdiCheck, mdiChevronLeft, mdiChevronRight } from '@mdi/js';
	import { getEntityIcon } from '$lib/shared/utils/icons';
	import CardBase from '../cards/CardBase.svelte';

	interface Props {
		selectedObject: any;
	}

	let { selectedObject }: Props = $props();

	let searchQuery = $state('');
	let selectedEntityIds = $state<Set<string>>(new Set(selectedObject?.entityIds || []));
	let currentPage = $state(1);
	const itemsPerPage = 20;

	// Filter entities based on search query and exclude already assigned ones
	const availableEntities = $derived(() => {
		const allEntities = Object.values($entities);
		const query = searchQuery.toLowerCase();

		return allEntities.filter((entity) => {
			const matchesSearch =
				!query ||
				entity.entity_id.toLowerCase().includes(query) ||
				(entity.attributes.friendly_name || '').toLowerCase().includes(query);

			return matchesSearch;
		});
	});

	// Get currently assigned entities
	const assignedEntities = $derived(() => {
		if (!selectedObject?.entityIds) return [];
		return selectedObject.entityIds.map((id: string) => $entities[id]).filter(Boolean);
	});

	// Get filtered available entities (excluding already assigned)
	const filteredAvailableEntities = $derived(() => {
		return availableEntities().filter((e) => !isEntityCurrentlyAssigned(e.entity_id));
	});

	// Pagination calculations
	const totalPages = $derived(() => Math.ceil(filteredAvailableEntities().length / itemsPerPage));
	const paginatedEntities = $derived(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filteredAvailableEntities().slice(start, end);
	});

	// Reset to first page when search changes
	$effect(() => {
		searchQuery;
		currentPage = 1;
	});

	const toggleEntity = (entityId: string) => {
		const newSelected = new Set(selectedEntityIds);
		if (newSelected.has(entityId)) {
			newSelected.delete(entityId);
		} else {
			newSelected.add(entityId);
		}
		selectedEntityIds = newSelected;
	};

	const saveChanges = async () => {
		if (!$selectedMesh) return;

		// Get current settings for scene ID
		const settings = await SettingsService.get();
		const currentSceneId = settings.defaultSceneId;

		// Create updated mesh data
		const meshData = {
			id: $selectedMesh,
			entityIds: Array.from(selectedEntityIds)
		};

		// Update local state first (optimistic update)
		if (meshData.entityIds.length > 0) {
			tempMeshes.update((meshes) => ({
				...meshes,
				[$selectedMesh]: meshData
			}));
		} else {
			// Remove mesh if no entities selected
			tempMeshes.update((meshes) => {
				const { [$selectedMesh]: removed, ...rest } = meshes;
				return rest;
			});
		}

		// Update using SceneService API
		try {
			await SceneService.update(currentSceneId!, {
				meshes: $tempMeshes
			});
		} catch (error) {
			console.error('Failed to update scene:', error);
			// Could add error handling/rollback here
		}
	};
	const isEntitySelected = (entityId: string) => selectedEntityIds.has(entityId);
	const isEntityCurrentlyAssigned = (entityId: string) =>
		selectedObject?.entityIds?.includes(entityId);

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages()) {
			currentPage = page;
		}
	};

	const nextPage = () => goToPage(currentPage + 1);
	const prevPage = () => goToPage(currentPage - 1);

	// Derived pagination pages for better reactivity
	const paginationPages = $derived(() => {
		const total = totalPages();
		const current = currentPage;
		const pages = [];

		if (total <= 7) {
			// Show all pages if 7 or fewer
			for (let i = 1; i <= total; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (current <= 3) {
				// Near beginning: 1, 2, 3, 4, 5, ..., last
				for (let i = 2; i <= 5; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(total);
			} else if (current >= total - 2) {
				// Near end: 1, ..., last-4, last-3, last-2, last-1, last
				pages.push('...');
				for (let i = total - 4; i <= total; i++) {
					pages.push(i);
				}
			} else {
				// Middle: 1, ..., current-1, current, current+1, ..., last
				pages.push('...');
				for (let i = current - 1; i <= current + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(total);
			}
		}

		return pages;
	});
</script>

<div class="flex h-full flex-col gap-4">
	<!-- Search Bar - Fixed at top -->
	<div class="flex-shrink-0">
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<SvgIcon type="mdi" path={mdiMagnify} size="18" class="text-gray-400 dark:text-gray-500" />
			</div>
			<input
				type="text"
				placeholder="Search entities..."
				class="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
				bind:value={searchQuery}
			/>
		</div>

		<!-- Save Button -->
		{#if selectedEntityIds.size !== (selectedObject?.entityIds?.length || 0) || !selectedObject?.entityIds?.every( (id: string) => selectedEntityIds.has(id) )}
			<button
				class="mt-3 w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
				onclick={saveChanges}
			>
				Save Changes ({selectedEntityIds.size} entities)
			</button>
		{/if}
	</div>

	<!-- Scrollable Entity Lists - Takes remaining space -->
	<div class="min-h-0 flex-1 space-y-4 overflow-y-auto">
		<!-- Currently Assigned Section -->
		{#if assignedEntities().length > 0}
			<div>
				<h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
					Currently Assigned ({assignedEntities().length})
				</h4>
				<div class="max-h-48 overflow-y-auto">
					<div class="space-y-2 2xl:grid 2xl:grid-cols-2 2xl:gap-2 2xl:space-y-0">
						{#each assignedEntities() as entity}
							<div class="relative">
								<CardBase
									{entity}
									icon={getEntityIcon(entity)}
									iconBg={isEntitySelected(entity.entity_id)
										? 'bg-blue-100 dark:bg-blue-900/50'
										: 'bg-gray-100 dark:bg-gray-700'}
									iconColor={isEntitySelected(entity.entity_id)
										? 'text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-300'}
									className="cursor-pointer"
									customSubtext={entity.entity_id}
								/>
								{#if isEntitySelected(entity.entity_id)}
									<div class="absolute right-4 top-4">
										<div class="rounded-full bg-blue-600 p-1">
											<SvgIcon type="mdi" path={mdiCheck} size="12" class="text-white" />
										</div>
									</div>
								{/if}
								<button
									class="absolute inset-0 z-10"
									onclick={() => toggleEntity(entity.entity_id)}
									aria-label={isEntitySelected(entity.entity_id) ? 'Remove entity' : 'Keep entity'}
								></button>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Available Entities Section -->
		<div>
			<div class="mb-3 flex items-center justify-between">
				<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
					Available Entities ({filteredAvailableEntities().length})
				</h4>
				{#if totalPages() > 1}
					<span class="text-xs text-gray-500 dark:text-gray-400">
						Page {currentPage} of {totalPages()}
					</span>
				{/if}
			</div>

			{#if filteredAvailableEntities().length === 0}
				<div class="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800/50">
					<p class="text-sm text-gray-500 dark:text-gray-400">
						{searchQuery
							? 'No entities found matching your search.'
							: 'No available entities to add.'}
					</p>
				</div>
			{:else}
				<div class="space-y-2 2xl:space-y-0">
					<div class="space-y-2 2xl:grid 2xl:grid-cols-2 2xl:gap-2 2xl:space-y-0">
						{#each paginatedEntities() as entity}
							<div class="relative">
								<CardBase
									{entity}
									icon={getEntityIcon(entity)}
									iconBg={isEntitySelected(entity.entity_id)
										? 'bg-green-100 dark:bg-green-900/50'
										: 'bg-gray-100 dark:bg-gray-700'}
									iconColor={isEntitySelected(entity.entity_id)
										? 'text-green-600 dark:text-green-400'
										: 'text-gray-600 dark:text-gray-300'}
									className="cursor-pointer {isEntitySelected(entity.entity_id)
										? 'ring-2 ring-green-200 dark:ring-green-800'
										: ''}"
									customSubtext={entity.entity_id}
								/>
								{#if isEntitySelected(entity.entity_id)}
									<div class="absolute right-4 top-4">
										<div class="rounded-full bg-green-600 p-1">
											<SvgIcon type="mdi" path={mdiCheck} size="12" class="text-white" />
										</div>
									</div>
								{/if}
								<button
									class="absolute inset-0 z-10"
									onclick={() => toggleEntity(entity.entity_id)}
									aria-label={isEntitySelected(entity.entity_id)
										? 'Remove from selection'
										: 'Add to selection'}
								></button>
							</div>
						{/each}
					</div>
				</div>

				<!-- Pagination Controls -->
				{#if totalPages() > 1}
					<div
						class="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50"
					>
						<button
							onclick={prevPage}
							disabled={currentPage === 1}
							class="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						>
							<SvgIcon type="mdi" path={mdiChevronLeft} size="16" />
							<span class="hidden md:inline">Previous</span>
						</button>

						<div class="flex items-center gap-1">
							{#each paginationPages() as item}
								{#if item === '...'}
									<span class="px-2 text-gray-400 dark:text-gray-500">...</span>
								{:else}
									<button
										onclick={() => goToPage(item as number)}
										class="h-8 w-8 rounded-md text-sm font-medium transition-colors {currentPage ===
										item
											? 'bg-blue-600 text-white'
											: 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}"
									>
										{item}
									</button>
								{/if}
							{/each}
						</div>

						<button
							onclick={nextPage}
							disabled={currentPage === totalPages()}
							class="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						>
							<span class="hidden md:inline">Next</span>
							<SvgIcon type="mdi" path={mdiChevronRight} size="16" />
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
