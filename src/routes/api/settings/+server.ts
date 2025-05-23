import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { SettingsSchema } from '../../../lib/types/api';

export async function GET({ locals }) {
	try {
		let settings = await locals.prisma.settings.findFirst();

		if (!settings) {
			settings = {
				id: 1,
				defaultSceneId: null
			};
		}

		return json(settings);
	} catch (err) {
		return error(500, 'Internal server error');
	}
}

export async function PATCH({ request, locals }) {
	let rawData: unknown;

	try {
		rawData = await request.json();
	} catch (err) {
		return error(400, 'Malformed JSON body');
	}

	try {
		const validatedData = SettingsSchema.parse(rawData);
		const updateData: any = {};

		// Only include fields that exist in request
		if ('defaultSceneId' in validatedData) {
			updateData.defaultSceneId = validatedData.defaultSceneId;
		}

		const settings = await locals.prisma.settings.upsert({
			where: { id: 1 },
			update: updateData,
			create: {
				id: 1,
				...updateData
			}
		});

		return json(settings);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return error(400, 'Invalid configuration format');
		}
		// Handle Prisma foreign key violation
		if (err.code === 'P2003') {
			return error(400, 'Referenced scene does not exist');
		}
		console.error('Error updating settings:', err);
		return error(500, 'Internal server error');
	}
}
