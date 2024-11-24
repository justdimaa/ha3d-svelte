import { HA_PUB_URL } from '$env/static/public';

export const checkAuth = async (accessToken: string | null): Promise<boolean> => {
	if (!accessToken) return false;

	const token = accessToken.replace(/^Bearer\s/, '');

	if (HA_PUB_URL === undefined) {
		console.error('HA_PUB_URL not set');
		throw new Error('HA_PUB_URL not set');
	}

	try {
		const response = await fetch(`${HA_PUB_URL}/api/`, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		return response.ok;
	} catch (error) {
		console.error('Error validating token:', error);
		return false;
	}
};
