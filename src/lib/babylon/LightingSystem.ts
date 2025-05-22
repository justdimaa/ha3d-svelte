import * as BABYLON from '@babylonjs/core';

export class LightingSystem {
	constructor(private scene: BABYLON.Scene) {}

	public initialize(): void {
		this.setupAmbientLight();
	}

	private setupAmbientLight(): void {
		const ambientLight = new BABYLON.HemisphericLight(
			'ambientLight',
			new BABYLON.Vector3(0, 1, 0),
			this.scene
		);
		ambientLight.intensity = 0.75;
		ambientLight.diffuse = new BABYLON.Color3(1, 1, 1);
		ambientLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	}
}
