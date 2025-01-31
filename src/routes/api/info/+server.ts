import { env } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';

export async function GET() {
	return json({
		url: env.HA_PUB_URL
	});
}
