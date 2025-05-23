import { TokenManager } from '../auth/tokenManager';

export class ApiClient {
	private static getAuthToken(): string {
		const authData = TokenManager.load();
		if (!authData?.access_token) {
			throw new Error('No authentication token available');
		}
		return authData.access_token;
	}

	private static getAuthHeaders(): Record<string, string> {
		return {
			Authorization: `Bearer ${this.getAuthToken()}`
		};
	}

	static async get<T>(endpoint: string): Promise<T> {
		const response = await fetch(endpoint, {
			headers: this.getAuthHeaders()
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
		}

		return response.json();
	}

	static async post<T>(endpoint: string, data?: any): Promise<T> {
		const headers = this.getAuthHeaders();

		let body: string | FormData;
		if (data instanceof FormData) {
			body = data;
		} else {
			headers['Content-Type'] = 'application/json';
			body = JSON.stringify(data);
		}

		const response = await fetch(endpoint, {
			method: 'POST',
			headers,
			body
		});

		if (!response.ok) {
			throw new Error(`Failed to post to ${endpoint}: ${response.statusText}`);
		}

		return response.json();
	}

	static async patch<T>(endpoint: string, data?: any): Promise<T> {
		const headers = this.getAuthHeaders();

		let body: string | FormData;
		if (data instanceof FormData) {
			body = data;
		} else {
			headers['Content-Type'] = 'application/json';
			body = JSON.stringify(data);
		}

		const response = await fetch(endpoint, {
			method: 'PATCH',
			headers,
			body
		});

		if (!response.ok) {
			throw new Error(`Failed to patch ${endpoint}: ${response.statusText}`);
		}

		return response.json();
	}

	static async delete(endpoint: string): Promise<void> {
		const response = await fetch(endpoint, {
			method: 'DELETE',
			headers: this.getAuthHeaders()
		});

		if (!response.ok) {
			throw new Error(`Failed to delete ${endpoint}: ${response.statusText}`);
		}
	}

	static async getBlob(endpoint: string): Promise<Blob> {
		const response = await fetch(endpoint, {
			headers: this.getAuthHeaders()
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
		}

		return response.blob();
	}
}
