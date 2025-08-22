import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

export class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: CameraControls;
    private keyState: Set<string> = new Set();
    private moveSpeed: number = 2.0;
    private targetHeight: number = 0;
    private bPolarAdj: boolean = false;
    private tolerance: number = 0.1;

    constructor(container: HTMLElement) {
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 20);

        this.controls = new CameraControls(this.camera, container);
        this.controls.setLookAt(0, 0, 0, 0, 0, 0);
        this.controls.dollyToCursor = true;

        window.addEventListener("keydown", (e) => this.onKeyDown(e));
        window.addEventListener("keyup", (e) => this.onKeyUp(e));
    }

    private onKeyDown(e: KeyboardEvent): void {
        this.keyState.add(e.code);
    }

    private onKeyUp(e: KeyboardEvent): void {
        this.keyState.delete(e.code);
    }

    private handleKeyboardMovement(): void {
        if (this.keyState.size === 0) return;

        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);

        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, up).normalize();

        if (this.keyState.has("ArrowUp") || this.keyState.has("KeyW")) {
            this.camera.position.addScaledVector(forward, this.moveSpeed);
        }
        if (this.keyState.has("ArrowDown") || this.keyState.has("KeyS")) {
            this.camera.position.addScaledVector(forward, -this.moveSpeed);
        }
        if (this.keyState.has("ArrowLeft") || this.keyState.has("KeyA")) {
            this.camera.position.addScaledVector(right, -this.moveSpeed);
        }
        if (this.keyState.has("ArrowRight") || this.keyState.has("KeyD")) {
            this.camera.position.addScaledVector(right, this.moveSpeed);
        }
    }

    public update(): void {
        TWEEN.update();

        if (this.bPolarAdj) {
            this.camera.position.y += 0.05 * (this.targetHeight - this.camera.position.y);
            this.camera.lookAt(new THREE.Vector3(0, this.targetHeight, 0));
            let diff: number = this.camera.position.y - this.targetHeight;
            if (Math.abs(diff) < this.tolerance) {
                this.lockVerticalRotation();
            }
        }

        this.handleKeyboardMovement();

        this.controls.update(0.01);
    }

    public lockVerticalRotation(): void {
        const target = new THREE.Vector3(0, this.targetHeight, 0);
        this.controls.setLookAt(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z,
            target.x,
            target.y,
            target.z,
            true
        );
        this.bPolarAdj = false;
    }

    public moveTo(x: number, y: number, z: number, targetHeight: number): void {
        new TWEEN.Tween(this.camera.position)
            .to({ x: x, y: y, z: z }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        this.targetHeight = targetHeight;
        this.bPolarAdj = true;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }
}
