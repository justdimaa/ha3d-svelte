import { HA_PUB_URL } from '$env/static/public';
import { error, json } from '@sveltejs/kit';
import fs from 'fs/promises';
import { z } from 'zod';
import { ConfigSchema } from '../../../lib/types/api';
import path from 'path';

const CFG_FILE_PATH = './data/config.json';

export async function GET({ request }) {
	const authToken = request.headers.get('authorization');
	if (!authToken) return error(401, 'Authorization header is required');

	const isAuthorized = await checkAuth(authToken);
	if (!isAuthorized) return error(401, 'Invalid authentication token' + authToken);

	try {
		// Read the config file
		const rawConfig = await fs.readFile(CFG_FILE_PATH, 'utf-8');

		// Parse and validate the stored config
		const config = JSON.parse(rawConfig);
		const validatedConfig = ConfigSchema.parse(config);

		return json(validatedConfig);
	} catch (err) {
		if (err instanceof z.ZodError) {
			// Handle validation errors for corrupt config files
			const errors = err.errors.map((e) => ({
				path: e.path.join('.'),
				message: e.message
			}));
			return error(500, {
				message: 'Stored configuration is invalid',
				errors
			});
		}

		if (err instanceof SyntaxError) {
			// Handle JSON parsing errors
			return error(500, 'Stored configuration contains invalid JSON');
		}

		if (err.code === 'ENOENT') {
			// Handle case where config file doesn't exist
			// return error(404, 'Configuration file not found');
			return json({
				meshes: {}
			});
		}

		// Handle unexpected errors
		console.error('Error reading configuration:', err);
		return error(500, 'Internal server error');
	}
}

export async function PUT({ request }) {
	const authToken = request.headers.get('authorization');
	if (!authToken) return error(401, 'Authorization header is required');

	const isAuthorized = await checkAuth(authToken);
	if (!isAuthorized) return error(401, 'Invalid authentication token' + authToken);

	let rawData: unknown;

	try {
		rawData = await request.json();
	} catch (err) {
		return error(400, 'Malformed JSON body');
	}

	// Validate the data structure
	try {
		const validatedData = ConfigSchema.parse(rawData);

		// Additional custom validations
		for (const [meshId, mesh] of Object.entries(validatedData.meshes)) {
			// Ensure mesh.id matches the key
			if (mesh.id !== meshId) {
				return error(400, `Mesh ID mismatch: key "${meshId}" doesn't match mesh.id "${mesh.id}"`);
			}

			// Ensure entity_ids are unique
			const uniqueEntityIds = new Set(mesh.entity_ids);

			if (uniqueEntityIds.size !== mesh.entity_ids.length) {
				return error(400, `Duplicate entity_ids found in mesh "${meshId}"`);
			}
		}

		// Ensure the data directory exists before writing
		await ensureDirectoryExists(CFG_FILE_PATH);

		// If we reach here, all validations passed
		await fs.writeFile(CFG_FILE_PATH, JSON.stringify(validatedData, null, 2), 'utf-8');
		return json({ success: true });
	} catch (err) {
		if (err instanceof z.ZodError) {
			// Format Zod validation errors
			const errors = err.errors.map((e) => ({
				path: e.path.join('.'),
				message: e.message
			}));
			return error(400, {
				message: 'Validation failed',
				errors
			});
		}
		// Handle unexpected errors
		console.error('Unexpected error during validation:', err);
		return error(500, 'Internal server error');
	}
}

// Helper function to ensure directory exists
async function ensureDirectoryExists(filePath: string) {
	const directory = path.dirname(filePath);

	try {
		await fs.access(directory);
	} catch (err) {
		// Directory doesn't exist, create it
		await fs.mkdir(directory, { recursive: true });
	}
}

async function checkAuth(accessToken: string): Promise<boolean> {
	const token = accessToken.replace(/^Bearer\s/, '');

	if (HA_PUB_URL === undefined) {
		console.error('HA_PUB_URL not set');
		throw new Error('HA_PUB_URL not set');
	}

	try {
		const response = await fetch(`${HA_PUB_URL}/api/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		return response.ok;
	} catch (error) {
		console.error('Error validating token:', error);
		return false;
	}
}
