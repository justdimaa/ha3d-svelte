import {
	Connection,
	createConnection,
	createLongLivedTokenAuth,
	ERR_HASS_HOST_REQUIRED,
	ERR_INVALID_AUTH,
	getAuth,
	getUser,
	subscribeEntities,
	type AuthData,
	type HassEntities,
	type HassUser
} from 'home-assistant-js-websocket';
import { writable, type Writable } from 'svelte/store';
import { HA_PUB_URL } from '$env/static/public';
import type { Meshes } from '$lib/types/api';

export const homeApi: Writable<Connection | undefined> = writable(undefined);
export const user: Writable<HassUser> = writable();
export const entities: Writable<HassEntities> = writable({});
export const selectedMesh: Writable<string | undefined> = writable(undefined);

// todo: find an alternative where to store values
export const tempMeshes: Writable<Meshes> = writable();

export const cameraSettings = writable({
	enableDamping: true
});

async function loadAuthTokens(): Promise<AuthData | null> {
	let dataStr = localStorage.getItem('hassTokens');

	if (dataStr == null) {
		return null;
	}

	return JSON.parse(dataStr);
}

function saveAuthTokens(data: AuthData | null) {
	localStorage.setItem('hassTokens', JSON.stringify(data));
}

export const connect = async () => {
	let auth;

	// usage: https://your-ha-instance.local/?authToken=long-lived-token
	const urlParams = new URLSearchParams(window.location.search);
	const urlAuthToken = urlParams.get('authToken');

	try {
		if (urlAuthToken) {
			// override the token with the one from the URL
			const hassUrl = HA_PUB_URL ?? prompt('What host to connect to?', 'http://localhost:8123');
			auth = createLongLivedTokenAuth(hassUrl, urlAuthToken);
		} else {
			console.log('urlAuthToken');
			// Try to pick up authentication after user logs in
			auth = await getAuth({
				loadTokens: loadAuthTokens,
				saveTokens: saveAuthTokens
			});
			console.log('sddasdas');
		}
	} catch (err) {
		if (err === ERR_HASS_HOST_REQUIRED) {
			const hassUrl = HA_PUB_URL ?? prompt('What host to connect to?', 'http://localhost:8123');
			// Redirect user to log in on their instance
			auth = await getAuth({
				hassUrl,
				loadTokens: loadAuthTokens,
				saveTokens: saveAuthTokens
			});
		} else if (err === ERR_INVALID_AUTH) {
			localStorage.removeItem('hassTokens');
			alert('Invalid auth. Please refresh to try again.');
			return;
		} else {
			alert(`Unknown error: ${err}`);
			return;
		}
	}

	let connection;

	try {
		connection = await createConnection({ auth });
	} catch (err) {
		if (err === ERR_INVALID_AUTH) {
			localStorage.removeItem('hassTokens');
			alert('Invalid auth. Please refresh to try again.');
			return;
		}

		alert(`Connection error: ${err}`);
		return;
	}

	if (urlAuthToken) {
		saveAuthTokens(auth.data);
	}

	homeApi.set(connection);
	user.set(await getUser(connection));

	subscribeEntities(connection, (state) => {
		console.debug(state);
		entities.set(state);
	});
};
