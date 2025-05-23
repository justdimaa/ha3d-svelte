import type { Mesh, Scene } from '$lib/types/api';
import { ApiClient } from './apiClient';

export interface SceneCreate {
	name?: string;
	meshes?: Record<string, Mesh>;
	file: File;
}

export interface SceneUpdate extends Partial<Omit<Scene, 'id' | 'hash'>> {
	file?: File;
}

interface ScenesResponse {
	scenes: Scene[];
}

interface SceneResponse {
	scene: Scene;
}

export class SceneService {
	static async getAll(): Promise<Scene[]> {
		const response = await ApiClient.get<ScenesResponse>('/api/scenes');
		return response.scenes;
	}

	static async getById(sceneId: string): Promise<Scene> {
		return ApiClient.get<Scene>(`/api/scenes/${sceneId}`);
	}

	static async getModel(sceneId: string): Promise<Blob> {
		return ApiClient.getBlob(`/api/scenes/${sceneId}/model`);
	}

	static async create(sceneData: SceneCreate): Promise<Scene> {
		const formData = new FormData();
		formData.append('file', sceneData.file);

		const metadata = {
			name: sceneData.name || 'New Scene',
			meshes: sceneData.meshes || {}
		};
		formData.append('payload_json', JSON.stringify(metadata));

		const response = await ApiClient.post<SceneResponse>('/api/scenes', formData);
		return response.scene;
	}

	static async update(sceneId: string, updates: SceneUpdate): Promise<Scene> {
		let requestData: any;

		if (updates.file) {
			// Use FormData for file uploads
			const formData = new FormData();
			formData.append('file', updates.file);

			const { file, ...metadata } = updates;
			formData.append('payload_json', JSON.stringify(metadata));
			requestData = formData;
		} else {
			// Use JSON for metadata-only updates
			requestData = updates;
		}

		const response = await ApiClient.patch<SceneResponse>(`/api/scenes/${sceneId}`, requestData);
		return response.scene;
	}

	static async delete(sceneId: string): Promise<void> {
		return ApiClient.delete(`/api/scenes/${sceneId}`);
	}
}
