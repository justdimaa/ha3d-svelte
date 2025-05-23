import * as BABYLON from '@babylonjs/core';
import { GLTFFileLoader } from '@babylonjs/loaders';
import { MeshClickHandler } from './MeshClickHandler';
import { CameraController } from './CameraController';
import { LightingSystem } from './LightingSystem';
import { GridRenderer } from './GridRenderer';
import { PostProcessor } from './PostProcessor';
import { ModelLoader } from './ModelLoader';
import { DotIndicatorManager } from './DotIndicatorManager';

export class SceneManager {
	engine!: BABYLON.Engine;
	scene!: BABYLON.Scene;

	cameraController!: CameraController;
	lightingSystem!: LightingSystem;
	gridRenderer!: GridRenderer;
	postProcessor!: PostProcessor;
	modelLoader!: ModelLoader;
	meshClickHandler!: MeshClickHandler;
	dotIndicatorManager!: DotIndicatorManager;

	constructor(private canvas: HTMLCanvasElement) {
		this.setupEngine();
		this.createScene();
		this.initializeSystems();
		this.startRenderLoop();
		this.setupResizeHandler();
	}

	private setupEngine(): void {
		BABYLON.SceneLoaderFlags.ShowLoadingScreen = false;
		this.engine = new BABYLON.Engine(this.canvas, true, {
			preserveDrawingBuffer: true,
			stencil: true
		});
	}

	private createScene(): void {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
	}

	private initializeSystems(): void {
		this.dotIndicatorManager = new DotIndicatorManager(this.scene);
		this.modelLoader = new ModelLoader(this.dotIndicatorManager);
		this.lightingSystem = new LightingSystem(this.scene);
		this.gridRenderer = new GridRenderer(this.scene);
		this.cameraController = new CameraController(this.scene, this.engine);
		this.postProcessor = new PostProcessor(this.scene, this.cameraController);
		this.meshClickHandler = new MeshClickHandler(this.engine, this.scene);

		// Initialize all systems
		this.lightingSystem.initialize();
		this.gridRenderer.render();
		this.postProcessor.initialize();
	}

	private startRenderLoop(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	private setupResizeHandler(): void {
		window.addEventListener('resize', () => {
			this.engine.resize();
		});
	}

	public async loadModel(sceneId: string): Promise<void> {
		await this.modelLoader.load(sceneId, this.scene);
	}

	public destroy(): void {
		this.engine?.dispose();
	}
}
