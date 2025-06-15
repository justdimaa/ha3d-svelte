import path from 'path';
import fs from 'fs/promises';
import { error, json } from '@sveltejs/kit';
import { handleError, saveGLBFile, validateGLBFile, type Scene } from '$lib/core/types/api';
import type { Prisma } from '@prisma/client';
import { mapDbSceneToApi } from '$lib/core/database/mappers/scene';

const SCENES_DIR = './data/scenes';

export async function GET({ params, locals }) {
	try {
		const dbScene = await locals.prisma.scene.findUnique({
			where: { id: params.slug },
			include: {
				meshes: {
					include: {
						entities: true
					}
				}
			}
		});

		if (!dbScene) {
			throw error(404, 'Scene not found');
		}

		const apiScene = mapDbSceneToApi(dbScene);
		return json(apiScene);
	} catch (err) {
		console.error('Error fetching scene:', err);
		return error(500, 'Internal server error');
	}
}

export async function DELETE({ params, locals }) {
	try {
		// Delete from database (cascade will handle related records)
		const dbScene = await locals.prisma.scene.delete({
			where: { id: params.slug }
		});

		if (!dbScene) {
			return error(404, 'Scene not found');
		}

		// Delete scene files
		try {
			const modelPath = path.join(SCENES_DIR, `${dbScene.id}.glb`);
			await fs.rm(modelPath, { recursive: true, force: true });
		} catch (fsErr) {
			console.error('Failed to delete scene files:', fsErr);
			// Continue since DB deletion succeeded
		}

		return new Response(null, { status: 204 });
	} catch (err) {
		if (err.code === 'P2025') {
			// Prisma not found error
			return error(404, 'Scene not found');
		}
		console.error('Error deleting scene:', err);
		return error(500, 'Internal server error');
	}
}

export async function PATCH({ request, params, locals }) {
	try {
		// Get existing scene
		const dbScene = await locals.prisma.scene.findUnique({
			where: { id: params.slug },
			include: {
				meshes: {
					include: {
						entities: true
					}
				}
			}
		});

		if (!dbScene) {
			return error(404, 'Scene not found');
		}

		let metadata: Partial<Scene>;
		let hash = dbScene.hash;

		if (request.headers.get('content-type')?.includes('multipart/form-data')) {
			const formData = await request.formData();

			// Handle metadata updates if provided
			const payloadJson = formData.get('payload_json');

			if (!payloadJson || typeof payloadJson !== 'string') {
				return error(400, 'Missing scene metadata');
			}

			metadata = JSON.parse(payloadJson);

			// Handle file update if provided
			const file = formData.get('file');

			if (!file || !(file instanceof File)) {
				return error(400, 'Missing or invalid GLB file');
			}

			const modelPath = path.join(SCENES_DIR, `${dbScene.id}.glb`);
			const stream = await validateGLBFile(file);
			hash = await saveGLBFile(stream, modelPath);
		} else {
			metadata = await request.json();
		}

		const updateData: Prisma.SceneUpdateInput = {};

		if ('name' in metadata) {
			updateData.name = metadata.name;
		}
		if ('description' in metadata) {
			updateData.description = metadata.description;
		}
		if (hash !== dbScene.hash) {
			updateData.hash = hash;
		}
		if ('meshes' in metadata) {
			updateData.meshes = {
				deleteMany: {},
				create: Object.entries(metadata.meshes!).map(([id, mesh]) => ({
					id,
					entities: {
						create: mesh.entityIds.map((entityId) => ({
							id: entityId
						}))
					}
				}))
			};
		}

		const updatedScene = await locals.prisma.scene.update({
			where: { id: dbScene.id },
			data: updateData,
			include: {
				meshes: {
					include: {
						entities: true
					}
				}
			}
		});

		const apiScene = mapDbSceneToApi(updatedScene);
		return json({ scene: apiScene });
	} catch (err) {
		return handleError(err);
	}
}
