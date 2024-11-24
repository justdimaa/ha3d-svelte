import { error } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import path from 'path';
import {
	FileTooLargeError,
	InvalidGLBError,
	saveGLBFile,
	SceneSchema,
	updateMetadata,
	validateGLBFile,
	type Scene
} from '$lib/types/api';
import { randomUUID } from 'crypto';
import { existsSync, mkdir } from 'fs';
import { z } from 'zod';
import { DateTime } from 'luxon';

const SCENES_DIR = './data/scenes';
const CONFIG_PATH = './data/config.json';

// Ensure directories exist
if (!existsSync(SCENES_DIR)) {
	mkdir(SCENES_DIR, { recursive: true });
}

export async function GET({ request }) {
	try {
		// Read all scene directories
		const sceneDirs = await fs.readdir(SCENES_DIR);

		// Collect all scene data
		const scenes: Scene[] = [];

		for (const dir of sceneDirs) {
			const jsonPath = path.join(SCENES_DIR, dir, 'scene.json');

			try {
				await fs.access(jsonPath);
				// File exists, try to read and parse it
				try {
					const sceneData = await fs.readFile(jsonPath, 'utf-8');
					const scene = JSON.parse(sceneData);
					scenes.push(scene);
				} catch (parseErr) {
					console.error(`Error parsing scene ${dir}:`, parseErr);
					// Continue to next scene if parsing fails
					continue;
				}
			} catch (accessErr) {
				// Skip if file doesn't exist
				continue;
			}
		}

		return new Response(JSON.stringify({ scenes }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Error reading scenes:', e);
		throw error(500, 'Failed to read scenes');
	}
}

export async function POST({ request }) {
	let sceneDir: string | undefined;

	try {
		if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
			return error(400, 'Invalid request type');
		}

		const formData = await request.formData();
		const payloadJson = formData.get('payload_json');
		const file = formData.get('file');

		if (!payloadJson || typeof payloadJson !== 'string') {
			return error(400, 'Missing scene metadata');
		}

		if (!file || !(file instanceof File)) {
			return error(400, 'Missing or invalid GLB file');
		}

		// Validate GLB header early
		const stream = await validateGLBFile(file);

		// Create and validate scene before file operations
		const now = DateTime.utc().toISO();
		const metadata = JSON.parse(payloadJson);
		const sceneId = randomUUID();
		let newScene: Scene = {
			id: sceneId,
			name: metadata.name,
			description: metadata.description,
			createdAt: now,
			updatedAt: now,
			hash: '',
			meshes: {}
		};

		// Validate scene structure before saving anything
		const validatedScene = SceneSchema.parse(newScene);

		// Only now create directory and save files
		sceneDir = path.join(SCENES_DIR, sceneId);
		const jsonPath = path.join(sceneDir, 'scene.json');

		await fs.mkdir(sceneDir, { recursive: true });
		validatedScene.hash = await saveGLBFile(stream, sceneDir);

		await fs.writeFile(jsonPath, JSON.stringify(validatedScene, null, 2));

		return new Response(JSON.stringify({ scene: validatedScene }), {
			status: 201,
			headers: {
				'Content-Type': 'application/json',
				Location: `/scenes/${sceneId}`
			}
		});
	} catch (err) {
		if (sceneDir) {
			await fs
				.rm(sceneDir, { recursive: true, force: true })
				.catch((cleanupErr) => console.error('Failed to cleanup:', cleanupErr));
		}

		if (err instanceof InvalidGLBError || err instanceof z.ZodError || err instanceof SyntaxError) {
			return error(400, err.message || 'Invalid request data');
		}

		if (err instanceof FileTooLargeError) {
			return error(413, 'File size exceeds 50MB limit');
		}

		console.error('Error creating scene:', err);
		return error(500, 'Internal server error');
	}
}
