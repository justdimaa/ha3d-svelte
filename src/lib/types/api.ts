import { error } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { createWriteStream } from 'fs';
import path from 'path';
import { z } from 'zod';

export const MeshSchema = z.object({
	id: z.string(),
	entityIds: z.array(z.string())
});

export const MeshesSchema = z.record(z.string(), MeshSchema);

export const SceneSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	hash: z.string(),
	meshes: MeshesSchema
});

export const ScenesSchema = z.record(z.string().uuid(), SceneSchema);

export const ConfigSchema = z.object({
	defaultSceneId: z.string().uuid().optional()
});

export type Mesh = z.infer<typeof MeshSchema>;
export type Meshes = z.infer<typeof MeshesSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export class FileTooLargeError extends Error {
	constructor() {
		super('File size exceeds 50MB limit');
	}
}

export class InvalidGLBError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export function updateMetadata(updates: any, updatedScene: Scene) {
	// Only update allowed fields
	if (updates.name) updatedScene.name = updates.name;
	if (updates.description) updatedScene.description = updates.description;
	if (updates.meshes) updatedScene.meshes = updates.meshes;
}

export async function validateGLBFile(file: File): Promise<ReadableStream<Uint8Array>> {
	const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
	const GLB_MAGIC = 0x46546c67;

	// Check size BEFORE loading into memory
	if (file.size > MAX_FILE_SIZE) {
		throw new FileTooLargeError();
	}

	// Read only first 8 bytes for header validation
	const headerBuffer = await file.slice(0, 8).arrayBuffer();
	const view = new DataView(headerBuffer);

	if (view.getUint32(0, true) !== GLB_MAGIC) {
		throw new InvalidGLBError('Invalid GLB file format');
	}

	if (view.getUint32(4, true) !== 2) {
		throw new InvalidGLBError('Unsupported GLB version');
	}

	return file.stream();
}

export async function saveGLBFile(
	stream: ReadableStream<Uint8Array>,
	sceneDir: string
): Promise<string> {
	const hash = createHash('sha256');
	const writeStream = createWriteStream(path.join(sceneDir, 'scene.glb'));

	// Process file in chunks while calculating hash
	await stream.pipeTo(
		new WritableStream({
			write(chunk) {
				hash.update(chunk);
				writeStream.write(chunk);
			},
			close() {
				writeStream.close();
			}
		})
	);

	return hash.digest('hex');
}

export function handleError(err: unknown) {
	if (err instanceof InvalidGLBError || err instanceof z.ZodError || err instanceof SyntaxError) {
		return error(400, err.message || 'Invalid request data');
	}
	if (err instanceof FileTooLargeError) {
		return error(413, 'File size exceeds 50MB limit');
	}
	console.error('Error processing scene:', err);
	return error(500, 'Internal server error');
}
