import {
	createLongLivedTokenAuth,
	getAuth,
	ERR_HASS_HOST_REQUIRED,
	ERR_INVALID_AUTH,
	Auth
} from 'home-assistant-js-websocket';
import { TokenManager } from './tokenManager';

export class AuthProvider {
	static async authenticate(config: any): Promise<Auth> {
		const urlAuthToken = this.getUrlAuthToken();

		try {
			if (urlAuthToken) {
				return await this.authenticateWithToken(config, urlAuthToken);
			} else {
				return await this.authenticateWithStoredTokens();
			}
		} catch (err) {
			return await this.handleAuthError(err, config);
		}
	}

	private static getUrlAuthToken(): string | null {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get('authToken');
	}

	private static async authenticateWithToken(config: any, token: string): Promise<Auth> {
		const hassUrl = config.url ?? this.promptForHost();
		return createLongLivedTokenAuth(hassUrl, token);
	}

	private static async authenticateWithStoredTokens(): Promise<Auth> {
		return await getAuth({
			loadTokens: async () => TokenManager.load(),
			saveTokens: async (data) => TokenManager.save(data)
		});
	}

	private static async handleAuthError(err: any, config: any): Promise<Auth> {
		if (err === ERR_HASS_HOST_REQUIRED) {
			const hassUrl = config.url ?? this.promptForHost();
			return await getAuth({
				hassUrl,
				loadTokens: async () => TokenManager.load(),
				saveTokens: async (data) => TokenManager.save(data)
			});
		} else if (err === ERR_INVALID_AUTH) {
			TokenManager.clear();
			throw new Error('Invalid auth. Please refresh to try again.');
		} else {
			throw new Error(`Unknown error: ${err}`);
		}
	}

	private static promptForHost(): string {
		return prompt('What host to connect to?', 'http://localhost:8123') || 'http://localhost:8123';
	}
}
