import path from 'path';
import fs from 'fs/promises';
import { error } from '@sveltejs/kit';

const SCENES_DIR = './data/scenes';

export async function GET({ request, params }) {
	const sanitizedId = path.basename(params.slug); // Prevent path traversal
	const sceneDir = path.join(SCENES_DIR, sanitizedId);
	const filePath = path.join(sceneDir, 'scene.glb');

	try {
		await fs.access(filePath);
	} catch (err) {
		throw error(404, 'Scene model not found');
	}

	const file = Bun.file(filePath);
	return new Response(file, {
		headers: {
			'Content-Type': 'model/gltf-binary',
			'Content-Disposition': `attachment; filename="scene.glb"`
		}
	});
}
