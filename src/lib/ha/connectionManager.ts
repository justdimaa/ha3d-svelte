import {
	createConnection,
	getUser,
	subscribeEntities,
	ERR_INVALID_AUTH,
	type Connection,
	Auth
} from 'home-assistant-js-websocket';
import { AuthProvider } from './auth/authProvider';
import { TokenManager } from './auth/tokenManager';
import { ConfigService } from './api/configService';

export class ConnectionManager {
	static async connect(): Promise<{
		connection: Connection;
		user: any;
		entities: any;
	}> {
		const config = await ConfigService.load();

		try {
			const auth = await AuthProvider.authenticate(config);
			const connection = await this.createConnection(auth);

			// Save tokens if authenticated via URL
			const urlAuthToken = new URLSearchParams(window.location.search).get('authToken');
			if (urlAuthToken) {
				TokenManager.save(auth.data);
			}

			const user = await getUser(connection);
			const entities = await this.subscribeToEntities(connection);

			return { connection, user, entities };
		} catch (error) {
			this.handleConnectionError(error);
			throw error;
		}
	}

	private static async createConnection(auth: Auth): Promise<Connection> {
		try {
			return await createConnection({ auth });
		} catch (err) {
			if (err === ERR_INVALID_AUTH) {
				TokenManager.clear();
				throw new Error('Invalid auth. Please refresh to try again.');
			}
			throw new Error(`Connection error: ${err}`);
		}
	}

	private static async subscribeToEntities(connection: Connection): Promise<any> {
		return new Promise((resolve) => {
			subscribeEntities(connection, (state) => {
				console.debug('Entities updated:', state);
				resolve(state);
			});
		});
	}

	private static handleConnectionError(error: any): void {
		console.error('Connection failed:', error);
		alert(error.message || 'Connection failed');
	}
}
