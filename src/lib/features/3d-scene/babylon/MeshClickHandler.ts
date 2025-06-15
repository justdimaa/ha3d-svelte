import * as BABYLON from '@babylonjs/core';
import { selectedMesh } from '$lib/shared/stores/global';

interface Selected {
	mesh: BABYLON.AbstractMesh;
	material: BABYLON.Material | null;
}

export class MeshClickHandler {
	selectedMaterial!: BABYLON.Material;
	selected: Selected | undefined;

	constructor(
		private engine: BABYLON.Engine,
		private scene: BABYLON.Scene
	) {
		this.initMaterial();
		this.initEvents();
	}

	private initMaterial() {
		const mat = new BABYLON.StandardMaterial('selected', this.scene);
		mat.diffuseColor = new BABYLON.Color3(1, 0.6, 0.6);
		mat.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
		mat.specularColor = new BABYLON.Color3(0, 0, 0);
		this.selectedMaterial = mat;
	}

	private initEvents() {
		let delta = [0, 0];

		this.scene.onPointerDown = (evt, _) => {
			delta = [evt.x, evt.y];
		};

		this.scene.onPointerUp = (evt, pickResult) => {
			if (!pickResult) return;
			if (evt.x != delta[0] || evt.y != delta[1]) return;

			// Get all meshes at this click position, sorted by distance
			const hits = this.scene.multiPick(evt.x, evt.y);

			if (hits && hits.length > 0) {
				// Look for dot indicators first (they have higher priority)
				const dotHit = hits.find(
					(hit) =>
						hit.pickedMesh &&
						(hit.pickedMesh.name.startsWith('dotIndicator') ||
							hit.pickedMesh.name.startsWith('dotOutline'))
				);

				if (dotHit) {
					this.onMeshSelect(dotHit.pickedMesh);
					return;
				}
			}

			// If no dot indicator found, use original behavior
			this.onMeshSelect(pickResult.pickedMesh);
		};

		// Add cursor management on pointer move
		this.scene.onPointerMove = (evt) => {
			const pickResult = this.scene.pick(evt.x, evt.y);

			if (pickResult?.pickedMesh) {
				const mesh = pickResult.pickedMesh;
				// Check if it's a clickable mesh (dot indicator or regular mesh)
				if (
					mesh.name.startsWith('dotIndicator') ||
					mesh.name.startsWith('dotOutline') ||
					mesh.isPickable
				) {
					this.engine.getRenderingCanvas()!.style.cursor = 'pointer';
				} else {
					this.engine.getRenderingCanvas()!.style.cursor = 'default';
				}
			} else {
				this.engine.getRenderingCanvas()!.style.cursor = 'default';
			}
		};
	}

	private onMeshSelect(mesh: BABYLON.AbstractMesh | null) {
		if (!mesh) {
			if (!this.selected) return;

			this.selected.mesh.material = this.selected.material;
			this.selected = undefined;
			selectedMesh.set(undefined);
			return;
		}

		// Check if clicked mesh is a dot indicator
		if (mesh.name.startsWith('dotIndicator') || mesh.name.startsWith('dotOutline')) {
			const originalMeshName = mesh.metadata?.originalMeshName;
			if (originalMeshName) {
				// Find the original mesh and select it
				const originalMesh = this.scene.getMeshByName(originalMeshName);
				if (originalMesh) {
					this.selectMesh(originalMesh);
					selectedMesh.set(originalMeshName);
				}
			}
			return;
		}

		this.selectMesh(mesh);
		selectedMesh.set(mesh.name);
	}

	private selectMesh(mesh: BABYLON.AbstractMesh) {
		if (this.selected) {
			if (this.selected.mesh == mesh) return;
			this.selected.mesh.material = this.selected.material;
		}

		console.debug('selected mesh ' + mesh.name);

		this.selected = {
			mesh: mesh,
			material: mesh.material
		};
		mesh.material = this.selectedMaterial;
	}
}
