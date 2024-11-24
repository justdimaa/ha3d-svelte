import { error, json } from '@sveltejs/kit';
import fs from 'fs/promises';
import { z } from 'zod';
import { ConfigSchema } from '../../../lib/types/api';
import path from 'path';
import { checkAuth } from '../helpers';

const CFG_FILE_PATH = './data/config.json';

export async function GET({ request }) {
	// const authToken = request.headers.get('authorization');
	// if (!authToken) return error(401, 'Authorization header is required');

	// const isAuthorized = await checkAuth(authToken);
	// if (!isAuthorized) return error(401, 'Invalid authentication token');

	try {
		// Read the config file
		const rawConfig = await fs.readFile(CFG_FILE_PATH, 'utf-8');
		const config = JSON.parse(rawConfig);
		const validatedConfig = ConfigSchema.parse(config);

		return json(validatedConfig);
	} catch (err) {
		if (err.code === 'ENOENT') {
			// Return default config when file doesn't exist
			return json({ default_scene: undefined });
		}
		if (err instanceof z.ZodError) {
			return error(400, 'Invalid configuration format');
		}
		if (err instanceof SyntaxError) {
			return error(500, 'Stored configuration contains invalid JSON');
		}
		// Handle other errors
		console.error('Error reading configuration:', err);
		return error(500, 'Internal server error');
	}
}

export async function PUT({ request }) {
	// const authToken = request.headers.get('authorization');
	// if (!authToken) return error(401, 'Authorization header is required');

	// const isAuthorized = await checkAuth(authToken);
	// if (!isAuthorized) return error(401, 'Invalid authentication token');

	let rawData: unknown;

	try {
		rawData = await request.json();
	} catch (err) {
		return error(400, 'Malformed JSON body');
	}

	try {
		const validatedData = ConfigSchema.parse(rawData);

		// Ensure directory exists before writing
		await ensureDirectoryExists(CFG_FILE_PATH);

		// Save the validated config
		await fs.writeFile(CFG_FILE_PATH, JSON.stringify(validatedData, null, 2), 'utf-8');

		// Here you would save the validated data
		return new Response(JSON.stringify(validatedData), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		if (err instanceof z.ZodError) {
			return error(400, 'Invalid configuration format');
		}
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
