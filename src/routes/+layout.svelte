<script lang="ts">
	import type { HassEntities } from 'home-assistant-js-websocket';
	import '../app.css';
	import { connect, entities, homeApi, tempMeshes } from '../stores/global';
	import { onMount, type Snippet } from 'svelte';
	import { getOrCreateMeshesHelper, updateMeshesHelper } from '$lib/ha/api';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	// removes deleted HA entities from the meshes
	const updateMeshStorage = async (state: HassEntities) => {
		let isDirty = false;
		let meshes = await getOrCreateMeshesHelper($homeApi!, state);

		for (let [_, mesh] of Object.entries(meshes)) {
			for (let [idx, eid] of mesh.entity_ids.entries()) {
				if (!(eid in state)) {
					mesh.entity_ids.splice(idx, 1);
					isDirty = true;
				}

				if (mesh.entity_ids.length == 0) {
					delete meshes[mesh.id];
				}
			}
		}

		if (isDirty) {
			await updateMeshesHelper($homeApi!, meshes);
		}

		if ($tempMeshes == undefined || isDirty) {
			$tempMeshes = meshes;
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
