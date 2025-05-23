import * as BABYLON from '@babylonjs/core';
import type { Meshes } from '$lib/types/api';
import { showDotIndicators, tempMeshes } from '../../stores/global';

export class DotIndicatorManager {
	private scene: BABYLON.Scene;
	private dotIndicators: BABYLON.Mesh[] = [];
	private unsubscribeTempMeshes: () => void;
	private unsubscribeVisibility: () => void;
	private isVisible = true;

	// Cache materials to avoid recreation
	private dotMaterial!: BABYLON.StandardMaterial;
	private outlineMaterial!: BABYLON.StandardMaterial;

	constructor(scene: BABYLON.Scene) {
		this.scene = scene;
		this.createSharedMaterials();

		// Subscribe to mesh data changes
		this.unsubscribeTempMeshes = tempMeshes.subscribe((currentTempMeshes) => {
			this.createIndicators(this.scene.meshes, currentTempMeshes);
		});

		// Subscribe to visibility changes
		this.unsubscribeVisibility = showDotIndicators.subscribe((visible) => {
			this.isVisible = visible;
			this.setVisibility(visible);
		});
	}

	public setVisibility(visible: boolean): void {
		this.isVisible = visible;
		this.dotIndicators.forEach((dot) => {
			dot.setEnabled(visible);
		});
	}

	private createSharedMaterials(): void {
		// Create shared materials once instead of per-dot
		this.dotMaterial = new BABYLON.StandardMaterial('sharedDotMaterial', this.scene);
		this.dotMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
		this.dotMaterial.disableDepthWrite = true;
		this.dotMaterial.forceDepthWrite = false;
		this.dotMaterial.needDepthPrePass = false;
		this.dotMaterial.zOffset = 0;
		this.dotMaterial.freeze(); // Freeze material for performance

		this.outlineMaterial = new BABYLON.StandardMaterial('sharedOutlineMaterial', this.scene);
		this.outlineMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
		this.outlineMaterial.alpha = 1;
		this.outlineMaterial.disableDepthWrite = true;
		this.outlineMaterial.forceDepthWrite = false;
		this.outlineMaterial.needDepthPrePass = false;
		this.outlineMaterial.zOffset = -1;
		this.outlineMaterial.backFaceCulling = false;
		this.outlineMaterial.freeze(); // Freeze material for performance
	}

	public destroy() {
		this.unsubscribeTempMeshes?.();
		this.unsubscribeVisibility?.();
		this.dotMaterial?.dispose();
		this.outlineMaterial?.dispose();
		this.clearIndicators();
	}

	public createIndicators(meshes: BABYLON.AbstractMesh[], tempMeshes: Meshes): void {
		// Use requestAnimationFrame to avoid blocking the main thread
		requestAnimationFrame(() => {
			this.clearIndicators();

			// Batch mesh processing for better performance
			const indicatorsToCreate: Array<{ mesh: BABYLON.AbstractMesh; meshData: any }> = [];

			meshes.forEach((mesh) => {
				const meshData = tempMeshes[mesh.name];
				if (meshData && meshData.entityIds && meshData.entityIds.length > 0) {
					indicatorsToCreate.push({ mesh, meshData });
				}
			});

			// Create all indicators in one batch
			this.createIndicatorBatch(indicatorsToCreate);
		});
	}

	private createIndicatorBatch(
		indicatorsData: Array<{ mesh: BABYLON.AbstractMesh; meshData: any }>
	): void {
		// Pre-allocate array size for better performance
		this.dotIndicators = new Array(indicatorsData.length * 2);
		let indicatorIndex = 0;

		indicatorsData.forEach(({ mesh }) => {
			// Create dot
			const dot = BABYLON.MeshBuilder.CreateDisc(
				`dotIndicator-${mesh.name}`,
				{ radius: 0.05 },
				this.scene
			);

			// Use shared material instead of creating new ones
			dot.material = this.dotMaterial;

			// Create outline
			const outline = BABYLON.MeshBuilder.CreateDisc(
				`dotOutline-${mesh.name}`,
				{ radius: 0.06 },
				this.scene
			);

			// Use shared material
			outline.material = this.outlineMaterial;

			// Configure both meshes
			this.configureDotMesh(dot, mesh);
			this.configureDotMesh(outline, mesh);

			// Set rendering groups
			outline.renderingGroupId = 1;
			dot.renderingGroupId = 2;

			// Position both at once
			const boundingBox = mesh.getBoundingInfo().boundingBox;
			const position = boundingBox.centerWorld;
			dot.position.copyFrom(position);
			outline.position.copyFrom(position);

			// Apply current visibility state when creating
			dot.setEnabled(this.isVisible);
			outline.setEnabled(this.isVisible);

			// Add to array
			this.dotIndicators[indicatorIndex++] = dot;
			this.dotIndicators[indicatorIndex++] = outline;
		});
	}

	private configureDotMesh(dotMesh: BABYLON.Mesh, originalMesh: BABYLON.AbstractMesh): void {
		dotMesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
		dotMesh.metadata = { originalMeshName: originalMesh.name };
		dotMesh.isPickable = true;
	}

	private clearIndicators(): void {
		for (let i = 0; i < this.dotIndicators.length; i++) {
			this.dotIndicators[i]?.dispose();
		}

		this.dotIndicators.length = 0;
	}
}
