import { type AuthData } from 'home-assistant-js-websocket';
import type { Settings, Mesh, Scene } from '../types/api';

export const getSettings = async (): Promise<Settings> => {
	const accessToken = getAuthToken();
	if (!accessToken) {
		throw new Error('No authentication token available');
	}

	const response = await fetch('/api/settings', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch config: ${response.statusText}`);
	}

	const data = await response.json();
	return data;
};

export const updateSettings = async (updates: Partial<Settings>): Promise<Settings> => {
	const accessToken = getAuthToken();
	if (!accessToken) {
		throw new Error('No authentication token available');
	}

	const response = await fetch('/api/settings', {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(updates)
	});

	if (!response.ok) {
		throw new Error(`Failed to update config: ${response.statusText}`);
	}

	const data = await response.json();
	return data;
};

export const getScenes = async () => {
	let accessToken = getAuthToken();
	if (!accessToken) {
		throw new Error('No authentication token available');
	}

	const response = await fetch('/api/scenes', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	const data = await response.json();
	return data.scenes;
};
export const getScene = async (sceneId: string): Promise<Scene> => {
	const accessToken = getAuthToken();
	if (!accessToken) {
		throw new Error('No authentication token available');
	}

	const response = await fetch(`/api/scenes/${sceneId}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch scene: ${response.statusText}`);
	}

	const data = await response.json();
	return data;
};

export const createScene = async (create: SceneCreate): Promise<Scene> => {
	const accessToken = getAuthToken();
	if (!accessToken) {
		throw new Error('No authentication token available');
	}

	const formData = new FormData();
	formData.append('file', create.file);

	// Create payload_json with metadata
	const metadata = {
		name: create.name || 'New Scene',
		meshes: create.meshes || {}
	};
	formData.append('payload_json', JSON.stringify(metadata));

	const response = await fetch('/api/scenes', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		body: formData
	});

	if (!response.ok) {
		throw new Error(`Failed to create scene: ${response.statusText}`);
	}

	const data = await response.json();
	return data.scene;
};

export const updateScene = async (sceneId: string, updates: SceneUpdate): Promise<Scene> => {
	const accessToken = getAuthToken();
	if (!accessToken) {
		throw new Error('No authentication token available');
	}

	// If file included, use FormData
	if (updates.file) {
		const formData = new FormData();
		formData.append('file', updates.file);

		// Add other updates as payload_json
		const { file, ...metadata } = updates;
		formData.append('payload_json', JSON.stringify(metadata));

		const response = await fetch(`/api/scenes/${sceneId}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`
			},
			body: formData
		});

		if (!response.ok) {
			throw new Error(`Failed to update scene: ${response.statusText}`);
		}

		const data = await response.json();
		return data.scene;
	}

	// No file, use JSON
	const response = await fetch(`/api/scenes/${sceneId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(updates)
	});

	if (!response.ok) {
		throw new Error(`Failed to update scene: ${response.statusText}`);
	}

	const data = await response.json();
	return data.scene;
};

export const deleteScene = async (sceneId: string): Promise<void> => {
	const accessToken = getAuthToken();
	if (!accessToken) {
		throw new Error('No authentication token available');
	}

	const response = await fetch(`/api/scenes/${sceneId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to delete scene: ${response.statusText}`);
	}
};

const getAuthToken = (): string | undefined => {
	const hassTokensStr = localStorage.getItem('hassTokens');
	if (!hassTokensStr) return undefined;

	const hassTokens: AuthData = JSON.parse(hassTokensStr);
	return hassTokens.access_token;
};

export type SceneCreate = {
	name?: string;
	meshes?: Record<string, Mesh>;
	file: File;
};
export type SceneUpdate = Partial<Omit<Scene, 'id' | 'hash'>> & {
	file?: File;
};
