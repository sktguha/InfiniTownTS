import * as THREE from "three";

/**
 * Backward-compatible camera controller with keyboard fly + legacy helpers.
 *
 * Constructor is flexible so existing code won't break:
 *  - new CameraController(container: HTMLElement)
 *  - new CameraController(camera: THREE.PerspectiveCamera, container?: HTMLElement)
 */
export class CameraControls {
  private _camera: THREE.PerspectiveCamera;
  private _container?: HTMLElement;
  private _keys = new Set<string>();

  // Tunables
  private _moveSpeed = 2.0; // units per update
  private _rotSpeed = 0.03; // radians per update
  private _rollSpeed = 0.03;
  private _finePitch = 0.015;

  // Persisted look target for legacy get/setLookAtTarget()
  private _lookTarget = new THREE.Vector3(0, 0, -1);

  // --- Constructors (overload-friendly) ---
  constructor(container: HTMLElement);
  constructor(camera: THREE.PerspectiveCamera, container?: HTMLElement);
  constructor(arg1: HTMLElement | THREE.PerspectiveCamera, arg2?: HTMLElement) {
    if (arg1 instanceof THREE.PerspectiveCamera) {
      // Style: new CameraController(camera, container?)
      this._camera = arg1;
      this._container = arg2;
      if (!this._camera.position) this._camera.position.set(0, 5, 10);
    } else {
      // Style: new CameraController(container)
      this._container = arg1;
      this._camera = new THREE.PerspectiveCamera(
        75,
        this._container.clientWidth / this._container.clientHeight,
        0.1,
        1000
      );
      this._camera.position.set(0, 5, 10);
    }

    // Initialize look target straight ahead from current pose
    const dir = new THREE.Vector3();
    this._camera.getWorldDirection(dir);
    this._lookTarget.copy(this._camera.position).add(dir);
    this._camera.lookAt(this._lookTarget);

    // Keyboard listeners
    window.addEventListener("keydown", (e) => this._keys.add(e.code));
    window.addEventListener("keyup", (e) => this._keys.delete(e.code));
  }

  // --- Public accessors ---
  public get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  // --- Main per-frame update ---
  public update(delta: number = 0.016): void {
    // Movement basis
    const forward = new THREE.Vector3();
    this._camera.getWorldDirection(forward);
    // Keep ground-style forward by default (ignore vertical component)
    const groundForward = new THREE.Vector3(forward.x, 0, forward.z).normalize();
    const right = new THREE.Vector3().crossVectors(groundForward, new THREE.Vector3(0, 1, 0)).normalize();

    // --- Translation ---
    if (this._keys.has("ArrowUp") || this._keys.has("KeyW")) {
      this._camera.position.addScaledVector(groundForward, this._moveSpeed);
    }
    if (this._keys.has("ArrowDown") || this._keys.has("KeyS")) {
      this._camera.position.addScaledVector(groundForward, -this._moveSpeed);
    }
    if (this._keys.has("ArrowLeft") || this._keys.has("KeyA")) {
      this._camera.position.addScaledVector(right, -this._moveSpeed);
    }
    if (this._keys.has("ArrowRight") || this._keys.has("KeyD")) {
      this._camera.position.addScaledVector(right, this._moveSpeed);
    }
    // Vertical (height)
    if (this._keys.has("KeyR")) this._camera.position.y += this._moveSpeed;
    if (this._keys.has("KeyF")) this._camera.position.y -= this._moveSpeed;

    // --- Rotation ---
    // Yaw (Q/E)
    if (this._keys.has("KeyQ")) this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this._rotSpeed);
    if (this._keys.has("KeyE")) this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -this._rotSpeed);

    // Pitch (T/Y) — local X
    if (this._keys.has("KeyT")) this._camera.rotateX(this._rotSpeed);
    if (this._keys.has("KeyY")) this._camera.rotateX(-this._rotSpeed);

    // Roll (G/H) — local Z
    if (this._keys.has("KeyG")) this._camera.rotateZ(this._rollSpeed);
    if (this._keys.has("KeyH")) this._camera.rotateZ(-this._rollSpeed);

    // Fine pitch (B/N)
    if (this._keys.has("KeyB")) this._camera.rotateX(this._finePitch);
    if (this._keys.has("KeyN")) this._camera.rotateX(-this._finePitch);

    // Update persistent look target
    const dir = new THREE.Vector3();
    this._camera.getWorldDirection(dir);
    this._lookTarget.copy(this._camera.position).add(dir);
    this._camera.lookAt(this._lookTarget);
  }

  // --- Backward-compatibility helpers (match old API) ---
  /** SceneMoveController expects this. */
  public getLookAtTarget(): THREE.Vector3 {
    return this._lookTarget.clone();
  }

  public setLookAtTarget(target: THREE.Vector3): void {
    this._lookTarget.copy(target);
    this._camera.lookAt(this._lookTarget);
  }

  public setCameraHeight(y: number): void {
    this._camera.position.y = y;
    this._camera.lookAt(this._lookTarget);
  }

  /** Interpret rotation angle as yaw (azimuth around Y). */
  public getRotationAngle(): number {
    const e = new THREE.Euler().setFromQuaternion(this._camera.quaternion, "YXZ");
    return e.y; // yaw in radians
  }

  public getAzimuthalAngle(): number {
    return this.getRotationAngle();
  }

  public getPosition(): THREE.Vector3 { return this._camera.position.clone(); }
  public setPosition(v: THREE.Vector3): void { this._camera.position.copy(v); }
  public getYaw(): number { return this.getRotationAngle(); }
  public getPitch(): number { const e = new THREE.Euler().setFromQuaternion(this._camera.quaternion, "YXZ"); return e.x; }
  public getRoll(): number { const e = new THREE.Euler().setFromQuaternion(this._camera.quaternion, "YXZ"); return e.z; }

  // --- Resize helper (works when constructed with container) ---
  public onWindowResize(): void {
    if (!this._container) return;
    this._camera.aspect = this._container.clientWidth / this._container.clientHeight;
    this._camera.updateProjectionMatrix();
  }
}

// ✅ Alias to keep old imports working: import { CameraController } ...
export { CameraControls as CameraController };
