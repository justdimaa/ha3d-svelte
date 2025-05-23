import type { AuthData } from 'home-assistant-js-websocket';

export class TokenManager {
	private static readonly TOKEN_KEY = 'hassTokens';

	static load(): AuthData | null {
		try {
			const dataStr = localStorage.getItem(this.TOKEN_KEY);
			return dataStr ? JSON.parse(dataStr) : null;
		} catch (error) {
			console.error('Failed to load auth tokens:', error);
			return null;
		}
	}

	static save(data: AuthData | null): void {
		try {
			if (data) {
				localStorage.setItem(this.TOKEN_KEY, JSON.stringify(data));
			} else {
				localStorage.removeItem(this.TOKEN_KEY);
			}
		} catch (error) {
			console.error('Failed to save auth tokens:', error);
		}
	}

	static clear(): void {
		localStorage.removeItem(this.TOKEN_KEY);
	}
}
