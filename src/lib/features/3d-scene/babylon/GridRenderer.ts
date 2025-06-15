import * as BABYLON from '@babylonjs/core';

export class GridRenderer {
	constructor(private scene: BABYLON.Scene) {}

	public render(): void {
		const material = this.createGridMaterial();
		this.createGridMesh(material);
	}

	private createGridMaterial(): BABYLON.ShaderMaterial {
		this.registerShaders();

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

		this.configureGridMaterial(gridMaterial);
		return gridMaterial;
	}

	private registerShaders(): void {
		BABYLON.Effect.ShadersStore['gridVertexShader'] = `
            precision highp float;
            
            attribute vec3 position;
            attribute vec2 uv;
            
            uniform mat4 worldViewProjection;
            uniform mat4 world;
            
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
            
            uniform float gridScale;
            uniform float fadeDistance;
            uniform vec4 primaryLineColor;
            uniform vec4 secondaryLineColor;
            
            varying vec3 vPosition;
            
            float getGrid(vec2 pos, float size) {
                vec2 grid = abs(fract(pos - 0.5) - 0.5) / fwidth(pos);
                return min(grid.x, grid.y);
            }
            
            void main(void) {
                vec2 pos = vPosition.xz;
                
                float dist = length(pos);
                float fade = 1.0 - smoothstep(fadeDistance * 0.5, fadeDistance, dist);
                
                float primaryGrid = getGrid(pos / gridScale, 1.0);
                float primaryLine = 1.0 - min(primaryGrid, 1.0);
                
                float secondaryGrid = getGrid(pos / (gridScale * 0.1), 1.0);
                float secondaryLine = 1.0 - min(secondaryGrid, 1.0);
                
                vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
                
                float secondaryAlpha = secondaryLine * fade * secondaryLineColor.a;
                float primaryAlpha = primaryLine * fade * primaryLineColor.a;
                
                color = mix(color, secondaryLineColor, secondaryAlpha);
                color = mix(color, primaryLineColor, primaryAlpha);
                
                gl_FragColor = color;
            }
        `;
	}

	private configureGridMaterial(material: BABYLON.ShaderMaterial): void {
		material.setFloat('gridScale', 1.0);
		material.setFloat('fadeDistance', 50.0);
		material.setColor4('primaryLineColor', new BABYLON.Color4(1.0, 1.0, 1.0, 0.1));
		material.setColor4('secondaryLineColor', new BABYLON.Color4(0.7, 0.7, 0.7, 0.05));

		material.needDepthPrePass = true;
		material.separateCullingPass = true;
		material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
		material.backFaceCulling = false;
	}

	private createGridMesh(material: BABYLON.ShaderMaterial): void {
		const ground = BABYLON.MeshBuilder.CreateGround('ground1', {
			width: 100,
			height: 100,
			subdivisions: 4,
			updatable: false
		});
		ground.position.y = -0.01;
		ground.material = material;
		ground.isPickable = false;
	}
}
