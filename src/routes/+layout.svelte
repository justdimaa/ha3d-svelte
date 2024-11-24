<script lang="ts">
	import type { HassEntities } from 'home-assistant-js-websocket';
	import '../app.css';
	import { connect, entities, homeApi, tempMeshes } from '../stores/global';
	import { onMount, type Snippet } from 'svelte';
	import { getConfig, getScene, getScenes, updateScene } from '$lib/ha/api';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	// removes deleted HA entities from the meshes
	const updateMeshStorage = async (state: HassEntities) => {
		try {
			let isDirty = false;
			const config = await getConfig();

			let sceneId = config.defaultSceneId;

			if (!sceneId) {
				const scenes = await getScenes();
				if (scenes.length == 0) {
					return;
				}

				sceneId = scenes[0].id;
			}

			const scene = await getScene(sceneId!);
			if (!scene) return;

			// Create new meshes object to track changes
			const updatedMeshes = { ...scene.meshes };

			for (const [meshId, mesh] of Object.entries(updatedMeshes)) {
				// Filter out deleted entities
				const validEntityIds = mesh.entityIds.filter((eid) => eid in state);

				if (validEntityIds.length !== mesh.entityIds.length) {
					isDirty = true;
					if (validEntityIds.length === 0) {
						// Remove mesh if no entities left
						delete updatedMeshes[meshId];
					} else {
						// Update with remaining entities
						updatedMeshes[meshId] = {
							...mesh,
							entityIds: validEntityIds
						};
					}
				}
			}

			if (isDirty) {
				await updateScene(scene.id, { meshes: updatedMeshes });
			}

			$tempMeshes = updatedMeshes;
		} catch (error) {
			console.error('Failed to update mesh storage:', error);
		}
	};

	onMount(async () => {
		if (!$homeApi) {
			await connect();
		}

		entities.subscribe(async (state) => {
			if (!state) return;
			if (Object.entries(state).length == 0) return;

			await updateMeshStorage(state);
		});
	});
</script>

<svelte:head></svelte:head>

<main
	class="to-[#10131C]] h-dvh w-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-slate-900 to-black font-ubuntu text-white"
>
	{@render children?.()}
</main>
