import { Connection, createConnection, createLongLivedTokenAuth, subscribeEntities, type HassEntities } from "home-assistant-js-websocket";
import { writable, type Writable } from "svelte/store";
import { HA_API_KEY, HA_API_URL } from '$env/static/public'; // todo: change it later
import type { SelectedMesh } from "$lib";

export const homeApi: Writable<Connection | undefined> = writable(undefined);
export const entities: Writable<HassEntities> = writable({});
export const selectedMesh: Writable<string | undefined> = writable(undefined);

// todo: find an alternative where to store values
export const tempMeshes: Writable<Map<string, SelectedMesh>> = writable(new Map());

export const cameraSettings = writable({
    enableDamping: true
})

export const connect = async () => {
    const auth = createLongLivedTokenAuth(HA_API_URL, HA_API_KEY);
    const connection = await createConnection({ auth });
    homeApi.set(connection);

    subscribeEntities(connection, (state) => {
        console.debug(state)
        entities.set(state);
    })

    // todo: not really the place for it here, move it
    tempMeshes.set(JSON.parse(localStorage.getItem("meshes") ?? "{}"));
}
