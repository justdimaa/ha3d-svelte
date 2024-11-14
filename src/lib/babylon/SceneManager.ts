import * as BABYLON from '@babylonjs/core';
import { GLTFFileLoader } from '@babylonjs/loaders';
import { MeshClickHandler } from './MeshClickHandler';

export class SceneManager {
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.ArcRotateCamera;
    meshClickHandler: MeshClickHandler;

    constructor(canvas: HTMLCanvasElement) {
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

    private initCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            'Camera',
            Math.PI / 4,
            Math.PI / 3,
            10,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.attachControl(this.canvas, false);
        this.camera.wheelDeltaPercentage = 0.01;
        this.camera.lowerRadiusLimit = 2; // Minimum distance from the target
        this.camera.upperRadiusLimit = 50; // Maximum distance from the target
        this.camera.minZ = 0.1; // get rid of camera clipping

        // Call the function each frame to update movement speed based on zoom level
        this.scene.onBeforeRenderObservable.add(() => {
            this.camera.panningSensibility = 10000 / this.camera.radius;
        });
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
            "gridMaterial",
            this.scene,
            {
                vertex: "grid",
                fragment: "grid",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: [
                    "world", "worldView", "worldViewProjection",
                    "view", "projection", "gridScale", "fadeDistance",
                    "primaryLineColor", "secondaryLineColor"
                ]
            }
        );

        // Set default values
        gridMaterial.setFloat("gridScale", 1.0);
        gridMaterial.setFloat("fadeDistance", 50.0);
        gridMaterial.setColor4("primaryLineColor", new BABYLON.Color4(1.0, 1.0, 1.0, 0.1));
        gridMaterial.setColor4("secondaryLineColor", new BABYLON.Color4(0.7, 0.7, 0.7, 0.05));

        // Enable alpha blending
        gridMaterial.needDepthPrePass = true;
        gridMaterial.separateCullingPass = true;
        gridMaterial.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

        // Make material double-sided
        gridMaterial.backFaceCulling = false;

        // Define shaders
        BABYLON.Effect.ShadersStore["gridVertexShader"] = `
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

        BABYLON.Effect.ShadersStore["gridFragmentShader"] = `
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
        const ground = BABYLON.MeshBuilder.CreateGround("ground1", {
            width: 100,
            height: 100,
            subdivisions: 4,
            updatable: false,
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