import { type AuthData } from 'home-assistant-js-websocket';
import type { Config } from '../types/api';

export const getConfig = async (): Promise<Config> => {
	let accessToken = getAuthToken();
	if (!accessToken) throw new Error('unauthorized');

	const cfg = await fetch('/api/config', {
		headers: {
			authorization: 'Bearer ' + accessToken
		}
	});

	if (!cfg.ok) {
		throw new Error(cfg.statusText);
	}

	return cfg.json();
};

export const updateConfig = async (cfg: Config) => {
	let accessToken = getAuthToken();
	if (!accessToken) return;

	let value = JSON.stringify(cfg);

	await fetch('/api/config', {
		method: 'PUT',
		headers: {
			authorization: 'Bearer ' + accessToken,
			'content-type': 'application/json'
		},
		body: value
	});
};

const getAuthToken = (): string | undefined => {
	const hassTokensStr = localStorage.getItem('hassTokens');
	if (!hassTokensStr) return undefined;

	const hassTokens: AuthData = JSON.parse(hassTokensStr);
	return hassTokens.access_token;
};
