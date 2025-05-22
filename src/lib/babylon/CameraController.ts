import * as BABYLON from '@babylonjs/core';

export class CameraController {
	public camera!: BABYLON.UniversalCamera;

	// Camera state
	private isDragging = false;
	private targetPosition!: BABYLON.Vector3;
	private lastPinchDistance = 0;
	private isPinching = false;
	private activePointers = new Map<number, { x: number; y: number }>();

	// Camera constraints
	private readonly MIN_Y = 3;
	private readonly MAX_Y = 20;

	constructor(
		private scene: BABYLON.Scene,
		private engine: BABYLON.Engine
	) {
		this.initializeCamera();
	}

	private initializeCamera(): void {
		this.createCamera();
		this.setupCameraInputs();
		this.setupDesktopWheelZoom();
		this.setupTouchControls();
		this.setupCameraAnimation();
	}

	private createCamera(): void {
		this.camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(5, 5, 5), this.scene);
		this.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
		this.targetPosition = this.camera.position.clone();
	}

	private setupCameraInputs(): void {
		// Remove default rotation behavior
		this.camera.inputs.clear();
	}

	private setupDesktopWheelZoom(): void {
		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERWHEEL) return;

			const event = pointerInfo.event as BABYLON.IWheelEvent;
			const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
			forward.normalize();

			const delta = -event.deltaY * 0.0045;
			const newPosition = this.targetPosition.add(forward.scale(delta));

			if (newPosition.y >= this.MIN_Y && newPosition.y <= this.MAX_Y) {
				this.targetPosition = newPosition;
			}
		});
	}

	private setupTouchControls(): void {
		this.setupPointerDown();
		this.setupPointerMove();
		this.setupPointerUp();
	}

	private setupPointerDown(): void {
		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOWN) return;
			const evt = pointerInfo.event as BABYLON.IPointerEvent;

			// Track pointer position
			this.activePointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

			if (this.activePointers.size === 1) {
				this.isPinching = false;
				this.isDragging = true;
			} else if (this.activePointers.size === 2) {
				this.isPinching = true;
				this.isDragging = false;

				const points = Array.from(this.activePointers.values());
				this.lastPinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
			}
		});
	}

	private setupPointerMove(): void {
		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERMOVE) return;
			const evt = pointerInfo.event as BABYLON.IPointerEvent;

			if (this.isDragging) {
				this.handleDragMovement(evt);
			} else if (this.isPinching) {
				this.handlePinchZoom(evt);
			}
		});
	}

	private setupPointerUp(): void {
		this.scene.onPointerObservable.add((pointerInfo) => {
			if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERUP) return;
			const evt = pointerInfo.event as BABYLON.IPointerEvent;

			this.activePointers.delete(evt.pointerId);

			if (this.activePointers.size === 0) {
				this.isDragging = false;
			} else if (this.activePointers.size < 2) {
				this.isPinching = false;
				this.lastPinchDistance = 0;
			}
		});
	}

	private handleDragMovement(evt: BABYLON.IPointerEvent): void {
		const points = Array.from(this.activePointers.values());

		// Calculate zoom level factor based on distance from origin
		const distanceFromOrigin = BABYLON.Vector3.Distance(
			this.camera.position,
			BABYLON.Vector3.Zero()
		);
		const zoomFactor = distanceFromOrigin / this.MIN_Y;

		const renderSize = Math.max(this.engine.getRenderWidth(), this.engine.getRenderHeight());

		// Normalize movement and apply zoom compensation
		const movementX = ((evt.clientX - points[0].x) / renderSize) * zoomFactor;
		const movementZ = ((evt.clientY - points[0].y) / renderSize) * zoomFactor;

		// Apply scaled movement
		const dx = movementX * 5;
		const dz = movementZ * 5;

		const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
		forward.y = 0;
		forward.normalize();

		const right = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Up());
		right.normalize();

		this.targetPosition.addInPlace(right.scale(dx));
		this.targetPosition.addInPlace(forward.scale(dz));

		this.activePointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });
	}

	private handlePinchZoom(evt: BABYLON.IPointerEvent): void {
		this.activePointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

		const points = Array.from(this.activePointers.values());
		const currentDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

		// Calculate zoom based on pinch delta
		const delta = (currentDistance - this.lastPinchDistance) * 0.04;
		const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
		forward.normalize();

		const newPosition = this.targetPosition.add(forward.scale(delta));
		if (newPosition.y >= this.MIN_Y && newPosition.y <= this.MAX_Y) {
			this.targetPosition = newPosition;
		}

		this.lastPinchDistance = currentDistance;
	}

	private setupCameraAnimation(): void {
		// Add smooth movement in render loop
		this.scene.onBeforeRenderObservable.add(() => {
			// Lerp camera position to target
			this.camera.position = BABYLON.Vector3.Lerp(
				this.camera.position,
				this.targetPosition,
				0.1 // Adjust this value to control smoothing (0-1)
			);

			// Update camera target to maintain forward view
			const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
			forward.normalize();
			this.camera.setTarget(this.camera.position.add(forward));
		});
	}
}
