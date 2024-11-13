<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Grid, interactivity, useGltf } from '@threlte/extras';
	import Camera from './Camera.svelte';
	import {
		EffectComposer,
		OutputPass,
		RenderPass,
		UnrealBloomPass
	} from 'three/examples/jsm/Addons.js';
	import { onMount } from 'svelte';
	import { Material, MeshStandardMaterial, Vector2 } from 'three';
	import { selectedMesh } from '../../../stores/global';

	interface Selected {
		obj: any;
		mat: Material;
	}

	const { scene, camera, renderer } = useThrelte();

	const roomModel = useGltf('/room.glb');

	roomModel.then((model) => {
		for (let [mat_name, mat] of Object.entries(model.materials)) {
			if (!mat_name.includes('wall')) continue;

			mat.transparent = true;
			mat.opacity = 0.05;
		}

		for (let [_node_name, node] of Object.entries(model.nodes)) {
			if (!node.material) continue;
			if (node.material.name.includes('wall')) continue;

			node.addEventListener('onclick', (e) => {
				console.debug(e);
			});
		}
	});

	let selected: Selected | undefined;

	const renderRay = (e) => {
		if (e.delta != 0) return;

		for (let intersect of e.intersections) {
			if (!intersect.object.name) continue;
			if (intersect.object.material.name.includes('wall')) continue;

			if (selected) {
				if (selected.obj == intersect.object) return;
				selected.obj.material = selected.mat;
			}

			console.debug(intersect.object.name);

			selected = {
				obj: intersect.object,
				mat: intersect.object.material
			};
			$selectedMesh = intersect.object.name;

			intersect.object.material = new MeshStandardMaterial({
				color: 'red'
			});
			return;
		}

		if (selected) {
			$selectedMesh = undefined;
			selected.obj.material = selected.mat;
			selected = undefined;
		}
	};

	const composer = new EffectComposer(renderer);
	composer.setSize(innerWidth, innerHeight);

	const setupEffectComposer = () => {
		const renderPass = new RenderPass(scene, camera.current);
		composer.addPass(renderPass);
		const bloomPass = new UnrealBloomPass(new Vector2(innerWidth, innerHeight), 0.1, 1, 0);
		composer.addPass(bloomPass);
		const outputPass = new OutputPass();
		composer.addPass(outputPass);
	};

	const { renderStage } = useThrelte();
	useTask(
		() => {
			composer.render();
		},
		{
			stage: renderStage
		}
	);

	interactivity();

	onMount(() => {
		setupEffectComposer();
	});
</script>

<Camera />

<T.DirectionalLight position={[3, 10, 7]} intensity={Math.PI} />
<T.AmbientLight intensity={0.3} />

<Grid
	position.y={-0.001}
	cellColor="#555"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={1}
/>

{#await roomModel then gltf}
	<T is={gltf.scene} onclick={renderRay} />
{/await}
