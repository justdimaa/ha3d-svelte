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

	private async blobToBase64(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// Remove the data URL prefix (e.g., "data:application/octet-stream;base64,")
				const base64 = result.split(',')[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}

	private base64ToBlob(base64: string, mimeType: string = 'model/gltf-binary'): Blob {
		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return new Blob([bytes], { type: mimeType });
	}

	public async getCachedModel(sceneId: string): Promise<{ model: Blob; sha: string } | null> {
		const db = await this.openDB();
		return new Promise<{ model: Blob; sha: string } | null>((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readonly');
			const store = transaction.objectStore(this.storeName);
			const request = store.get(sceneId);
			request.onsuccess = (event) => {
				const result = (event.target as IDBRequest).result;
				if (!result) {
					resolve(null);
					return;
				}

				try {
					// Convert base64 string back to blob
					const modelBlob = this.base64ToBlob(result.modelData, result.mimeType);
					resolve({ model: modelBlob, sha: result.sha });
				} catch (error) {
					console.error('Failed to convert base64 to blob:', error);
					reject(error);
				}
			};
			request.onerror = (event) => {
				reject((event.target as IDBRequest).error);
			};
		});
	}

	public async cacheModel(sceneId: string, model: Blob, sha: string): Promise<void> {
		const db = await this.openDB();

		try {
			// Convert blob to base64 string for storage
			const base64Data = await this.blobToBase64(model);

			return new Promise<void>((resolve, reject) => {
				const transaction = db.transaction(this.storeName, 'readwrite');
				const store = transaction.objectStore(this.storeName);
				const request = store.put({
					sceneId,
					modelData: base64Data,
					sha,
					mimeType: model.type || 'model/gltf-binary',
					size: model.size
				});
				request.onsuccess = () => {
					resolve();
				};
				request.onerror = (event) => {
					reject((event.target as IDBRequest).error);
				};
			});
		} catch (error) {
			console.error('Failed to convert blob to base64:', error);
			throw error;
		}
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

	// Optional: Method to get cache info without loading the full model
	public async getCacheInfo(
		sceneId: string
	): Promise<{ sha: string; size: number; mimeType: string } | null> {
		const db = await this.openDB();
		return new Promise<{ sha: string; size: number; mimeType: string } | null>(
			(resolve, reject) => {
				const transaction = db.transaction(this.storeName, 'readonly');
				const store = transaction.objectStore(this.storeName);
				const request = store.get(sceneId);
				request.onsuccess = (event) => {
					const result = (event.target as IDBRequest).result;
					if (!result) {
						resolve(null);
						return;
					}
					resolve({
						sha: result.sha,
						size: result.size,
						mimeType: result.mimeType
					});
				};
				request.onerror = (event) => {
					reject((event.target as IDBRequest).error);
				};
			}
		);
	}
}
