import type { Settings } from '$lib/types/api';
import { ApiClient } from './apiClient';

export class SettingsService {
	static async get(): Promise<Settings> {
		return ApiClient.get<Settings>('/api/settings');
	}

	static async update(updates: Partial<Settings>): Promise<Settings> {
		return ApiClient.patch<Settings>('/api/settings', updates);
	}
}
