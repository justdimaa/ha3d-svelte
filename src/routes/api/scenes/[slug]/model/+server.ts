import path from 'path';
import fs from 'fs/promises';
import { error } from '@sveltejs/kit';

const SCENES_DIR = './data/scenes';

export async function GET({ params, locals }) {
	const dbScene = await locals.prisma.scene.findUnique({
		where: { id: params.slug }
	});

	if (!dbScene) {
		throw error(404, 'Scene not found');
	}

	const modelPath = path.join(SCENES_DIR, `${dbScene.id}.glb`);

	try {
		await fs.access(modelPath);
	} catch (err) {
		throw error(404, 'Scene model not found');
	}

	const file = Bun.file(modelPath);
	return new Response(file, {
		headers: {
			'Content-Type': 'model/gltf-binary',
			'Content-Disposition': `attachment; filename="${dbScene.id}.glb"`
		}
	});
}
