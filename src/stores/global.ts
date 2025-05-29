import { writable, type Writable } from 'svelte/store';
import {
	subscribeEntities,
	type Connection,
	type HassEntities,
	type HassUser
} from 'home-assistant-js-websocket';
import type { Meshes } from '$lib/types/api';
import { ConnectionManager } from '$lib/ha/connectionManager';
import { browser } from '$app/environment';
import type { SceneManager } from '$lib/babylon/SceneManager';

// Core stores
export const homeApi: Writable<Connection | undefined> = writable(undefined);
export const user: Writable<HassUser | undefined> = writable(undefined);
export const entities: Writable<HassEntities> = writable({});
export const selectedMesh: Writable<string | undefined> = writable(undefined);
export const tempMeshes: Writable<Meshes> = writable({});

export const sceneManager = writable<SceneManager | null>(null);
export const showDotIndicators = createPersistentStore('showDotIndicators', true);

// Settings stores
export const cameraSettings = writable({
	enableDamping: true
});

// Connection state
export const isConnecting = writable(false);
export const connectionError = writable<string | null>(null);

// Simplified connect function
export const connect = async (): Promise<void> => {
	isConnecting.set(true);
	connectionError.set(null);

	try {
		const {
			connection,
			user: hassUser,
			entities: hassEntities
		} = await ConnectionManager.connect();

		homeApi.set(connection);
		user.set(hassUser);
		entities.set(hassEntities);

		// Continue listening for entity updates
		subscribeEntities(connection, (state) => {
			entities.set(state);
		});
	} catch (error: any) {
		connectionError.set(error.message || 'Failed to connect');
		console.error('Connection failed:', error);
	} finally {
		isConnecting.set(false);
	}
};

export function createPersistentStore<T>(key: string, defaultValue: T) {
	if (browser) {
		const stored = localStorage.getItem(key);
		if (stored) {
			try {
				defaultValue = JSON.parse(stored);
			} catch (error) {
				console.error(`Failed to parse stored value for ${key}:`, error);
			}
		}
	}

	const { subscribe, set, update } = writable<T>(defaultValue);

	return {
		subscribe,
		set: (value: T) => {
			if (browser) {
				localStorage.setItem(key, JSON.stringify(value));
			}
			set(value);
		},
		update: (fn: (value: T) => T) => {
			update((value) => {
				const newValue = fn(value);
				if (browser) {
					localStorage.setItem(key, JSON.stringify(newValue));
				}
				return newValue;
			});
		}
	};
}
