import * as BABYLON from '@babylonjs/core';
import { CameraController } from './CameraController';

export class PostProcessor {
	constructor(
		private scene: BABYLON.Scene,
		private cameraController: CameraController
	) {}

	public initialize(): void {
		this.setupSSAO();
		this.setupFXAA();
		this.setupGlow();
	}

	private setupSSAO(): void {
		const ssao = new BABYLON.SSAO2RenderingPipeline('ssao', this.scene, {
			ssaoRatio: 1.0,
			blurRatio: 1.0
		});

		ssao.samples = 32;
		ssao.textureSamples = 4;

		this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(
			'ssao',
			this.cameraController.camera
		);
	}

	private setupFXAA(): void {
		new BABYLON.FxaaPostProcess('fxaa', 1.0, this.cameraController.camera);
	}

	private setupGlow(): void {
		const glow = new BABYLON.GlowLayer('glow', this.scene);
		glow.intensity = 1;
		glow.blurKernelSize = 128;
	}
}
