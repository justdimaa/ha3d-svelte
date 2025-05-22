export class SceneCache {
	private dbName = 'modelCache';
	private storeName = 'models';

	private async openDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 1);
			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				db.createObjectStore(this.storeName, { keyPath: 'sceneId' });
			};
			request.onsuccess = (event) => {
				resolve((event.target as IDBOpenDBRequest).result);
			};
			request.onerror = (event) => {
				reject((event.target as IDBOpenDBRequest).error);
			};
		});
	}

	public async getCachedModel(sceneId: string): Promise<{ model: Blob; sha: string } | null> {
		const db = await this.openDB();
		return new Promise<{ model: Blob; sha: string } | null>((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readonly');
			const store = transaction.objectStore(this.storeName);
			const request = store.get(sceneId);
			request.onsuccess = (event) => {
				resolve((event.target as IDBRequest).result || null);
			};
			request.onerror = (event) => {
				reject((event.target as IDBRequest).error);
			};
		});
	}

	public async cacheModel(sceneId: string, model: Blob, sha: string): Promise<void> {
		const db = await this.openDB();
		return new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.put({ sceneId, model, sha });
			request.onsuccess = () => {
				resolve();
			};
			request.onerror = (event) => {
				reject((event.target as IDBRequest).error);
			};
		});
	}

	public async deleteModel(sceneId: string): Promise<void> {
		const db = await this.openDB();
		return new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(sceneId);
			request.onsuccess = () => {
				resolve();
			};
			request.onerror = (event) => {
				reject((event.target as IDBRequest).error);
			};
		});
	}
}
