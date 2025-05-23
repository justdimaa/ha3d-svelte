import * as BABYLON from '@babylonjs/core';
import { SceneCache } from './SceneCache';
import { tempMeshes } from '../../stores/global';
import { get } from 'svelte/store';
import type { Meshes } from '$lib/types/api';
import { SceneService } from '$lib/ha/api/sceneService';

export class ModelLoader {
	private cache: SceneCache;

	constructor() {
		this.cache = new SceneCache();
	}

	public async load(sceneId: string, scene: BABYLON.Scene): Promise<void> {
		const sceneData = await SceneService.getById(sceneId);
		const modelBlob = await this.getModelBlob(sceneData);
		await this.importModelToScene(modelBlob, scene);
		this.hideWalls(scene);
	}

	private async getModelBlob(sceneData: any): Promise<Blob> {
		const cached = await this.cache.getCachedModel(sceneData.id).catch((err) => {
			console.warn('Failed to fetch cached model:', err);
			return null;
		});

		// TODO: Uncomment this when cache is implemented
		// Use cached or fetch new
		// if (cached?.model && cached.sha === sceneData.hash) {
		// 	console.log('Using cached model');
		// 	return cached.model;
		// }

		const modelBlob = await SceneService.getModel(sceneData.id);
		await this.cache.cacheModel(sceneData.id, modelBlob, sceneData.hash).catch((err) => {
			console.warn('Failed to store in cache:', err);
		});
		console.log('Fetched and cached model');
		return modelBlob;
	}

	private async importModelToScene(modelBlob: Blob, scene: BABYLON.Scene): Promise<void> {
		const arrayBuffer = await modelBlob.arrayBuffer();
		const bufferView = new Uint8Array(arrayBuffer);
		await BABYLON.AppendSceneAsync(bufferView, scene, {
			pluginExtension: '.glb'
		});
	}

	private hideWalls(scene: BABYLON.Scene): void {
		for (let mesh of scene.meshes) {
			if (!mesh.material?.name.includes('wall')) continue;
			mesh.setEnabled(false);
		}
	}
}
