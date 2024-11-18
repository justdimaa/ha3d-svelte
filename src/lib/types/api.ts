import { z } from 'zod';

export const MeshSchema = z.object({
	id: z.string(),
	entity_ids: z.array(z.string())
});

export const MeshesSchema = z.record(z.string(), MeshSchema);

export const ConfigSchema = z.object({
	meshes: MeshesSchema
});

export type Config = z.infer<typeof ConfigSchema>;
