import { error, json } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import path from 'path';
import {
	FileTooLargeError,
	InvalidGLBError,
	saveGLBFile,
	SceneSchema,
	validateGLBFile
} from '$lib/core/types/api';
import { randomUUID } from 'crypto';
import { existsSync, mkdir } from 'fs';
import { z } from 'zod';
import { mapDbSceneToApi } from '$lib/core/database/mappers/scene.js';

const SCENES_DIR = './data/scenes';

// Ensure directories exist
if (!existsSync(SCENES_DIR)) {
	mkdir(SCENES_DIR, { recursive: true }, (err) => {
		if (err) throw err;
	});
}

export async function GET({ locals }) {
	try {
		const dbScenes = await locals.prisma.scene.findMany({
			include: {
				meshes: {
					include: {
						entities: true
					}
				}
			}
		});

		const apiScenes = dbScenes.map(mapDbSceneToApi);
		return json({ scenes: apiScenes });
	} catch (err) {
		console.error('Error fetching scenes:', err);
		throw error(500, 'Failed to fetch scenes');
	}
}

export async function POST({ request, locals }) {
	let modelPath: string | undefined;

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

		// Parse and validate metadata
		const parsed = JSON.parse(payloadJson);
		let metadata = SceneSchema.parse(parsed);

		// Validate GLB header early
		const stream = await validateGLBFile(file);
		const sceneId = randomUUID();

		// Create directory for GLB file
		await fs.mkdir(SCENES_DIR, { recursive: true });

		// Save GLB and get hash
		modelPath = path.join(SCENES_DIR, `${sceneId}.glb`);
		const hash = await saveGLBFile(stream, modelPath);

		// Create scene in database
		const dbScene = await locals.prisma.scene.create({
			data: {
				id: sceneId,
				name: metadata.name,
				description: metadata.description ?? '',
				hash: hash,
				meshes: {
					create: Object.entries(metadata.meshes || {}).map(([id, mesh]) => ({
						id,
						Entities: {
							create: mesh.entityIds.map((entityId) => ({
								id: entityId
							}))
						}
					}))
				}
			},
			include: {
				meshes: {
					include: {
						entities: true
					}
				}
			}
		});

		const apiScene = mapDbSceneToApi(dbScene);
		return json(
			{ scene: apiScene },
			{
				status: 201,
				headers: {
					Location: `/scenes/${sceneId}`
				}
			}
		);
	} catch (err) {
		if (modelPath) {
			await fs
				.rm(modelPath, { recursive: true, force: true })
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
