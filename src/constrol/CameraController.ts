import * as THREE from "three";
import CameraControls from "camera-controls";
import TWEEN from "@tweenjs/tween.js";

CameraControls.install({ THREE: THREE });

export class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: CameraControls;
    private container: HTMLElement;
    private keyState: Set<string> = new Set();
    private moveSpeed: number = 2.0;
    private rotSpeed: number = 0.03;

    constructor(container: HTMLElement) {
        this.container = container;

        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        this.controls = new CameraControls(this.camera, container);
        this.controls.setLookAt(0, 5, 10, 0, 0, 0);

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

        // Vertical movement
        if (this.keyState.has("KeyR")) {
            this.camera.position.addScaledVector(up, this.moveSpeed);
        }
        if (this.keyState.has("KeyF")) {
            this.camera.position.addScaledVector(up, -this.moveSpeed);
        }

        // Rotation yaw
        if (this.keyState.has("KeyQ")) {
            this.camera.rotation.y += this.rotSpeed;
        }
        if (this.keyState.has("KeyE")) {
            this.camera.rotation.y -= this.rotSpeed;
        }

        // Rotation pitch
        if (this.keyState.has("KeyT")) {
            this.camera.rotation.x += this.rotSpeed;
        }
        if (this.keyState.has("KeyY")) {
            this.camera.rotation.x -= this.rotSpeed;
        }

        // Rotation roll
        if (this.keyState.has("KeyG")) {
            this.camera.rotation.z += this.rotSpeed;
        }
        if (this.keyState.has("KeyH")) {
            this.camera.rotation.z -= this.rotSpeed;
        }

        // Fine pitch
        if (this.keyState.has("KeyB")) {
            this.camera.rotation.x += this.rotSpeed * 0.5;
        }
        if (this.keyState.has("KeyN")) {
            this.camera.rotation.x -= this.rotSpeed * 0.5;
        }
    }

    /** Set only the camera Y position (height) */
    public setCameraHeight(y: number) {
        this.camera.position.y = y;
        this.controls.setLookAt(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z,
            ...this.getLookAtTarget().toArray()
        );
    }

    /** New: return the current look-at target */
    public getLookAtTarget(): THREE.Vector3 {
        return this.controls.getTarget(new THREE.Vector3());
    }

    public update(delta: number = 0.016): void {
        TWEEN.update();
        this.handleKeyboardMovement();
        this.controls.update(delta);
    }

    public onWindowResize(): void {
        this.camera.aspect =
            this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }
    // --- Backward compatibility helpers ---

    public getLookAtTarget(): THREE.Vector3 {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        return this.camera.position.clone().add(dir);
    }

    public setLookAtTarget(target: THREE.Vector3): void {
        this.camera.lookAt(target);
    }

    public setCameraHeight(height: number): void {
        this.camera.position.y = height;
    }

    public getRotationAngle(): number {
        // Interpret "rotation angle" as yaw (rotation around Y axis)
        return this.camera.rotation.y;
    }

    // Optional helpers if code uses them later:
    public getYaw(): number {
        return this.camera.rotation.y;
    }

    public getPitch(): number {
        return this.camera.rotation.x;
    }

    public getRoll(): number {
        return this.camera.rotation.z;
    }

}
