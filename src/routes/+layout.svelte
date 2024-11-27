<script lang="ts">
	import type { HassEntities } from 'home-assistant-js-websocket';
	import '../app.css';
	import { entities, tempMeshes } from '../stores/global';
	import { onMount, type Snippet } from 'svelte';
	import { getSettings, getScene, getScenes, updateScene } from '$lib/ha/api';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	// removes deleted HA entities from the meshes
	const updateMeshStorage = async (state: HassEntities) => {
		if (!state) return;
		if (Object.entries(state).length == 0) return;

		try {
			let isDirty = false;
			const settings = await getSettings();

			let sceneId = settings.defaultSceneId;
			if (!sceneId) return;

			let scene = await getScene(sceneId!);
			if (!scene) return;

			for (const [meshId, mesh] of Object.entries(scene.meshes)) {
				// Filter out deleted entities
				const validEntityIds = mesh.entityIds.filter((eid) => eid in state);

				if (validEntityIds.length !== mesh.entityIds.length) {
					isDirty = true;
					if (validEntityIds.length === 0) {
						// Remove mesh if no entities left
						delete scene.meshes[meshId];
					} else {
						// Update with remaining entities
						scene.meshes[meshId] = {
							...mesh,
							entityIds: validEntityIds
						};
					}
				}
			}

			if (isDirty) {
				scene = await updateScene(scene.id, { meshes: scene.meshes });
			}

			$tempMeshes = scene.meshes;
		} catch (error) {
			console.error('Failed to update mesh storage:', error);
		}
	};

	$effect(() => {
		updateMeshStorage($entities);
	});

	onMount(async () => {
		await updateMeshStorage($entities);
	});
</script>

<svelte:head></svelte:head>

<main
	class="h-dvh w-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-slate-900 to-black font-ubuntu text-white"
>
	{@render children?.()}
</main>
