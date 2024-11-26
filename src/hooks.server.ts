import { prisma } from '$lib/prisma';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.prisma = prisma;
	return await resolve(event);
};

// Cleanup on shutdown
process.on('SIGTERM', () => prisma.$disconnect());
process.on('SIGINT', () => prisma.$disconnect());
