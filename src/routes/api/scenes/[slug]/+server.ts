import path from 'path';
import fs from 'fs/promises';
import { error } from '@sveltejs/kit';
import {
	handleError,
	saveGLBFile,
	SceneSchema,
	updateMetadata,
	validateGLBFile,
	type Scene
} from '$lib/types/api';
import { DateTime } from 'luxon';

const SCENES_DIR = './data/scenes';

export async function GET({ request, params, url }) {
	const sanitizedId = path.basename(params.slug); // Prevent path traversal
	const sceneDir = path.join(SCENES_DIR, sanitizedId);
	const jsonPath = path.join(sceneDir, 'scene.json');

	try {
		await fs.access(jsonPath);
	} catch (err) {
		throw error(404, 'Scene model not found');
	}

	const sceneData = await fs.readFile(jsonPath, 'utf-8');
	return new Response(sceneData, {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function DELETE({ request, params }) {
	try {
		const sanitizedId = path.basename(params.slug);
		const sceneDir = path.join(SCENES_DIR, sanitizedId);

		// Check if scene exists
		try {
			await fs.access(sceneDir);
		} catch {
			return error(404, 'Scene not found');
		}

		// Delete scene directory and all contents
		await fs.rm(sceneDir, { recursive: true, force: true });

		return new Response(null, { status: 204 });
	} catch (err) {
		console.error('Error deleting scene:', err);
		return error(500, 'Internal server error');
	}
}

export async function PATCH({ request, params }) {
	try {
		// Get existing scene
		const sceneId = path.basename(params.slug);
		const sceneDir = path.join(SCENES_DIR, sceneId);
		const jsonPath = path.join(sceneDir, 'scene.json');

		// Load and validate existing scene
		let currentScene: Scene;
		try {
			const sceneData = await fs.readFile(jsonPath, 'utf-8');
			currentScene = SceneSchema.parse(JSON.parse(sceneData));
		} catch (err) {
			console.log(err);
			throw error(404, 'Scene not found');
		}

		// Create updated scene from current
		let updatedScene = { ...currentScene };

		if (request.headers.get('content-type')?.includes('multipart/form-data')) {
			const formData = await request.formData();

			// Handle metadata updates if provided
			const payloadJson = formData.get('payload_json');

			if (!payloadJson || typeof payloadJson !== 'string') {
				return error(400, 'Missing scene metadata');
			}

			const metadata = JSON.parse(payloadJson);
			updateMetadata(metadata, updatedScene);

			// Handle file update if provided
			const file = formData.get('file');

			if (!file || !(file instanceof File)) {
				return error(400, 'Missing or invalid GLB file');
			}

			if (file instanceof File) {
				const stream = await validateGLBFile(file);
				updatedScene.hash = await saveGLBFile(stream, sceneDir);
			}
		} else {
			// Handle JSON-only metadata update
			const updates = await request.json();
			updateMetadata(updates, updatedScene);
		}

		// Update scene updated timestamp
		updatedScene.updatedAt = DateTime.utc().toISO();

		// Validate final state
		const validatedScene = SceneSchema.parse(updatedScene);
		await fs.writeFile(jsonPath, JSON.stringify(validatedScene, null, 2));

		return new Response(JSON.stringify({ scene: validatedScene }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return handleError(err);
	}
}
