import { Connection, createConnection, ERR_HASS_HOST_REQUIRED, getAuth, getUser, subscribeEntities, type AuthData, type HassEntities, type HassUser } from "home-assistant-js-websocket";
import { writable, type Writable } from "svelte/store";
import type { SelectedMesh } from "$lib";


export type SelectedMeshes = {
    [id: string]: SelectedMesh;
};

export const homeApi: Writable<Connection | undefined> = writable(undefined);
export const user: Writable<HassUser> = writable();
export const entities: Writable<HassEntities> = writable({});
export const selectedMesh: Writable<string | undefined> = writable(undefined);

// todo: find an alternative where to store values
export const tempMeshes: Writable<SelectedMeshes> = writable();

export const cameraSettings = writable({
    enableDamping: true
})

async function loadAuthTokens(): Promise<AuthData | null> {
    let dataStr = localStorage.getItem("auth");

    if (dataStr == null) {
        return null;
    }

    return JSON.parse(dataStr);
}

function saveAuthTokens(data: AuthData | null) {
    localStorage.setItem("auth", JSON.stringify(data));
}

export function loadMeshes(): SelectedMeshes {
    return JSON.parse(localStorage.getItem("meshes") ?? "{}");
}

export function saveMeshes(val: SelectedMeshes) {
    localStorage.setItem("meshes", JSON.stringify(val));
}

export const connect = async () => {
    let auth;

    try {
        // Try to pick up authentication after user logs in
        auth = await getAuth({
            loadTokens: loadAuthTokens,
            saveTokens: saveAuthTokens
        });
    } catch (err) {
        if (err === ERR_HASS_HOST_REQUIRED) {
            const hassUrl = prompt(
                "What host to connect to?",
                "http://localhost:8123",
            );
            // Redirect user to log in on their instance
            auth = await getAuth({
                hassUrl,
                loadTokens: loadAuthTokens,
                saveTokens: saveAuthTokens
            });
        } else {
            alert(`Unknown error: ${err}`);
            return;
        }
    }

    const connection = await createConnection({ auth });
    homeApi.set(connection);
    user.set(await getUser(connection));

    subscribeEntities(connection, (state) => {
        console.debug(state)
        entities.set(state);
    })
}
