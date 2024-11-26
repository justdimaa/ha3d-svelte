import type { Scene as DbScene } from '@prisma/client';
import type { Scene as ApiScene } from '$lib/types/api';

export function mapDbSceneToApi(
	dbScene: DbScene & {
		meshes?: Array<{
			id: string;
			entities: Array<{ id: string; orderIndex: number }>;
		}>;
	}
): ApiScene {
	return {
		id: dbScene.id,
		name: dbScene.name,
		description: dbScene.description,
		createdAt: dbScene.createdAt.toISOString(),
		updatedAt: dbScene.updatedAt.toISOString(),
		hash: dbScene.hash,
		meshes:
			dbScene.meshes?.reduce(
				(acc, mesh) => ({
					...acc,
					[mesh.id]: {
						entityIds: mesh.entities.sort((a, b) => a.orderIndex - b.orderIndex).map((e) => e.id)
					}
				}),
				{}
			) || {}
	};
}
