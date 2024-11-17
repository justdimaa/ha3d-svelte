import type { Connection, HassEntities } from 'home-assistant-js-websocket';

export const getOrCreateMeshesHelper = async (
	api: Connection,
	entities: HassEntities
): Promise<any> => {
	const entity = entities['input_text.meshes'];

	if (!entity) {
		await createMeshesHelper(api);
		return {};
	}

	try {
		let meshes = JSON.parse(entity.state);
		return meshes;
	} catch (ex) {
		// reset to inital state if the string is malformed
		console.error('meshes json malformed: ' + ex);
		await updateMeshesHelper(api, {});
		return {};
	}
};

const createMeshesHelper = async (api: Connection) => {
	await api.sendMessagePromise({
		type: 'input_text/create',
		name: 'meshes',
		icon: 'mdi:cube-scan',
		max: 10000
	});

	await updateMeshesHelper(api, {});
};

export const updateMeshesHelper = async (api: Connection, meshes: any) => {
	let value = JSON.stringify(meshes);

	await api!.sendMessagePromise({
		type: 'call_service',
		domain: 'input_text',
		service: 'set_value',
		return_response: false,
		service_data: { value, entity_id: 'input_text.meshes' }
	});
};
