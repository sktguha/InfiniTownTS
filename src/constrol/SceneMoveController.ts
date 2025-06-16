import type { AppScene } from "../core/AppScene";
import { GVar } from "../utils/GVar";
import type { CameraController } from "./CameraController";
import type { InputMgr } from "./InputMgr";
import * as THREE from 'three';
/**
 * 场景移动控制器
 */
export class SceneMoveController {

    protected _panning: boolean = false;
    protected _startCoords = new THREE.Vector2;
    protected _lastOffset = new THREE.Vector2;
    protected _offset = new THREE.Vector2;
    protected _speed = new THREE.Vector3(GVar.PAN_SPEED, 0, GVar.PAN_SPEED);
    protected _sceneOffset = new THREE.Vector3;
    protected _worldOffset = new THREE.Vector3;

    protected _inputManager: InputMgr | null = null;
    protected _scene: AppScene | null = null;
    protected _camera: CameraController | null = null;
    protected enabled: boolean = false;

    public constructor(imgr: InputMgr, scene: AppScene, cam: CameraController) {
        this._inputManager = imgr;
        this._scene = scene;
        this._camera = cam;
        this.enabled = true;
    }

    protected _onStartDrag( evt : any ) : void {
        if (this.enabled) {
            this._panning = true;
            this._startCoords.set(evt.x, evt.y);
        }
    }

    protected _onEndDrag( evt : any ) : void {
        if (this.enabled) {
            this._panning = false;
            this._lastOffset.copy(this._offset);
        }
    }

    // WORK START:
}