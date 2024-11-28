import * as BABYLON from '@babylonjs/core';
import { GLTFFileLoader } from '@babylonjs/loaders';
import { MeshClickHandler } from './MeshClickHandler';

export class SceneManager {
	canvas: HTMLCanvasElement;
	engine: BABYLON.Engine;
	scene: BABYLON.Scene;
	camera: BABYLON.Camera;
	meshClickHandler: MeshClickHandler;

	constructor(canvas: HTMLCanvasElement) {
		BABYLON.SceneLoader.ShowLoadingScreen = false;

		this.canvas = canvas;
		this.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

		this.initCamera();
		this.initModel();
		this.initLights();
		this.initGrid();
		this.initPostProcess();

		this.meshClickHandler = new MeshClickHandler(this.engine, this.scene);

		// run the render loop
		this.engine.runRenderLoop(() => {
			// divFps.innerHTML = this.engine.getFps().toFixed() + ' fps';
			this.scene.render();
		});

		// the canvas/window resize event handler
		window.addEventListener('resize', () => {
			this.engine.resize();
		});
	}

	public destroy() {
		this.engine?.dispose();
	}

	private initCamera() {
		const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(5, 5, 5), this.scene);
		camera.setTarget(new BABYLON.Vector3(0, 0, 0));

		// Remove default rotation behavior
		camera.inputs.clear();

		let isDragging = false;
		let targetPosition = camera.position.clone();

		const MIN_Y = 3;
		const MAX_Y = 20;

		// Desktop wheel zoom
		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERWHEEL) return;

			const event = pointerInfo.event as BABYLON.IWheelEvent;
			const forward = camera.getDirection(BABYLON.Vector3.Forward());
			forward.normalize();

			const delta = -event.deltaY * 0.0045;
			const newPosition = targetPosition.add(forward.scale(delta));

			if (newPosition.y >= MIN_Y && newPosition.y <= MAX_Y) {
				targetPosition = newPosition;
			}
		});

		let lastPinchDistance = 0;
		let isPinching = false;
		let activePointers = new Map<number, { x: number; y: number }>();

		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOWN) return;
			const evt = pointerInfo.event as BABYLON.IPointerEvent;

			// Track pointer position
			activePointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

			if (activePointers.size === 1) {
				isPinching = false;
				isDragging = true;
			} else if (activePointers.size === 2) {
				isPinching = true;
				isDragging = false;

				const points = Array.from(activePointers.values());
				lastPinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
			}
		});

		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERMOVE) return;
			const evt = pointerInfo.event as BABYLON.IPointerEvent;

			if (isDragging) {
				// camera movement
				const points = Array.from(activePointers.values());

				// Calculate zoom level factor based on distance from origin
				const distanceFromOrigin = BABYLON.Vector3.Distance(
					camera.position,
					BABYLON.Vector3.Zero()
				);
				const zoomFactor = distanceFromOrigin / MIN_Y;

				const renderSize = Math.max(this.engine.getRenderWidth(), this.engine.getRenderHeight());

				// Normalize movement and apply zoom compensation
				const movementX = ((evt.clientX - points[0].x) / renderSize) * zoomFactor;
				const movementZ = ((evt.clientY - points[0].y) / renderSize) * zoomFactor;

				// Apply scaled movement
				const dx = movementX * 5;
				const dz = movementZ * 5;

				const forward = camera.getDirection(BABYLON.Vector3.Forward());
				forward.y = 0;
				forward.normalize();

				const right = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Up());
				right.normalize();

				targetPosition.addInPlace(right.scale(dx));
				targetPosition.addInPlace(forward.scale(dz));

				activePointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });
			} else if (isPinching) {
				// mobile pinch zoom
				activePointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

				const points = Array.from(activePointers.values());
				const currentDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

				// Calculate zoom based on pinch delta
				const delta = (currentDistance - lastPinchDistance) * 0.04;
				const forward = camera.getDirection(BABYLON.Vector3.Forward());
				forward.normalize();

				const newPosition = targetPosition.add(forward.scale(delta));
				if (newPosition.y >= MIN_Y && newPosition.y <= MAX_Y) {
					targetPosition = newPosition;
				}

				lastPinchDistance = currentDistance;
			}
		});

		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERUP) return;
			const evt = pointerInfo.event as BABYLON.IPointerEvent;

			activePointers.delete(evt.pointerId);

			if (activePointers.size === 0) {
				isDragging = false;
			} else if (activePointers.size < 2) {
				isPinching = false;
				lastPinchDistance = 0;
			}
		});

		// Add smooth movement in render loop
		this.scene.onBeforeRenderObservable.add(() => {
			// Lerp camera position to target
			camera.position = BABYLON.Vector3.Lerp(
				camera.position,
				targetPosition,
				0.1 // Adjust this value to control smoothing (0-1)
			);

			// Update camera target to maintain forward view
			const forward = camera.getDirection(BABYLON.Vector3.Forward());
			forward.normalize();
			camera.setTarget(camera.position.add(forward));
		});

		this.camera = camera;
	}

	private async initModel() {
		await BABYLON.appendSceneAsync('room.glb', this.scene);
		this.hideWalls();
	}

	private async initLights() {
		const ambientLight = new BABYLON.HemisphericLight(
			'ambientLight',
			new BABYLON.Vector3(0, 1, 0),
			this.scene
		);
		ambientLight.intensity = 0.75; // Adjust intensity as needed
		ambientLight.diffuse = new BABYLON.Color3(1, 1, 1); // White light
		ambientLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	}

	private createGridMaterial() {
		// Create shader material
		const gridMaterial = new BABYLON.ShaderMaterial(
			'gridMaterial',
			this.scene,
			{
				vertex: 'grid',
				fragment: 'grid'
			},
			{
				attributes: ['position', 'normal', 'uv'],
				uniforms: [
					'world',
					'worldView',
					'worldViewProjection',
					'view',
					'projection',
					'gridScale',
					'fadeDistance',
					'primaryLineColor',
					'secondaryLineColor'
				]
			}
		);

		// Set default values
		gridMaterial.setFloat('gridScale', 1.0);
		gridMaterial.setFloat('fadeDistance', 50.0);
		gridMaterial.setColor4('primaryLineColor', new BABYLON.Color4(1.0, 1.0, 1.0, 0.1));
		gridMaterial.setColor4('secondaryLineColor', new BABYLON.Color4(0.7, 0.7, 0.7, 0.05));

		// Enable alpha blending
		gridMaterial.needDepthPrePass = true;
		gridMaterial.separateCullingPass = true;
		gridMaterial.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

		// Make material double-sided
		gridMaterial.backFaceCulling = false;

		// Define shaders
		BABYLON.Effect.ShadersStore['gridVertexShader'] = `
            precision highp float;
    
            // Attributes
            attribute vec3 position;
            attribute vec2 uv;
            
            // Uniforms
            uniform mat4 worldViewProjection;
            uniform mat4 world;
            
            // Varying
            varying vec3 vPosition;
            varying vec2 vUV;
            
            void main(void) {
                gl_Position = worldViewProjection * vec4(position, 1.0);
                vPosition = (world * vec4(position, 1.0)).xyz;
                vUV = uv;
            }
        `;

		BABYLON.Effect.ShadersStore['gridFragmentShader'] = `
            precision highp float;
    
            // Uniforms
            uniform float gridScale;
            uniform float fadeDistance;
            uniform vec4 primaryLineColor;
            uniform vec4 secondaryLineColor;
    
            // Varying
            varying vec3 vPosition;
    
            float getGrid(vec2 pos, float size) {
                vec2 grid = abs(fract(pos - 0.5) - 0.5) / fwidth(pos);
                return min(grid.x, grid.y);
            }
    
            void main(void) {
                // Calculate world position based XZ plane
                vec2 pos = vPosition.xz;
                
                // Calculate distance from origin for fade
                float dist = length(pos);
                float fade = 1.0 - smoothstep(fadeDistance * 0.5, fadeDistance, dist);
                
                // Primary grid
                float primaryGrid = getGrid(pos / gridScale, 1.0);
                float primaryLine = 1.0 - min(primaryGrid, 1.0);
                
                // Secondary grid (10x smaller)
                float secondaryGrid = getGrid(pos / (gridScale * 0.1), 1.0);
                float secondaryLine = 1.0 - min(secondaryGrid, 1.0);
                
                // Start with fully transparent color
                vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
                
                // Add lines with proper alpha
                float secondaryAlpha = secondaryLine * fade * secondaryLineColor.a;
                float primaryAlpha = primaryLine * fade * primaryLineColor.a;
                
                // Mix colors based on grid lines
                color = mix(color, secondaryLineColor, secondaryAlpha);
                color = mix(color, primaryLineColor, primaryAlpha);
                
                gl_FragColor = color;
            }
        `;

		return gridMaterial;
	}

	private async initGrid() {
		const shaderMaterial = this.createGridMaterial();

		// Apply the custom shader to the grid
		const ground = BABYLON.MeshBuilder.CreateGround('ground1', {
			width: 100,
			height: 100,
			subdivisions: 4,
			updatable: false
		});
		ground.position.y = -0.01;
		ground.material = shaderMaterial;
		ground.isPickable = false;
	}

	private async initPostProcess() {
		const ssao = new BABYLON.SSAO2RenderingPipeline('ssao', this.scene, {
			ssaoRatio: 1.0, // Increase resolution of the SSAO buffer
			blurRatio: 1.0 // Increase resolution of the blur buffer
		});

		// Adjust SSAO quality settings
		ssao.samples = 32; // Number of samples (e.g., 8, 16, or 32)
		ssao.textureSamples = 4; // Texture sample count for better quality (requires GPU support)

		// Apply pipeline
		this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('ssao', this.camera);

		const fxaa = new BABYLON.FxaaPostProcess('fxaa', 1.0, this.camera);
		const glow = new BABYLON.GlowLayer('glow', this.scene);

		glow.intensity = 1;
		glow.blurKernelSize = 128;
	}

	private async hideWalls() {
		// for (let mat of this.scene.materials) {
		//     if (!mat.name.includes('wall')) continue;
		//     mat.alpha = 0.05;
		//     mat.transparencyMode = BABYLON.Engine.ALPHA_COMBINE;
		// }

		for (let mesh of this.scene.meshes) {
			if (!mesh.material?.name.includes('wall')) continue;
			mesh.setEnabled(false);
		}
	}
}
