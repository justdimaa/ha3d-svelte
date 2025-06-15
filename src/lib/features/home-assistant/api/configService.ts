interface Config {
	url?: string;
}

export class ConfigService {
	static async load(): Promise<Config> {
		try {
			const response = await fetch('/api/info');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Failed to load config:', error);
			return {}; // Return empty config as fallback
		}
	}
}
