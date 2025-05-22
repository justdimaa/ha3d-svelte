import * as BABYLON from '@babylonjs/core';
import { selectedMesh } from '../../stores/global';

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
			this.onMeshSelect(pickResult.pickedMesh);
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

		selectedMesh.set(mesh.name);
	}
}
