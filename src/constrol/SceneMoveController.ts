import type { AppScene } from "../core/AppScene";
import { EventMgr } from "../utils/EventMgr";
import { GVar } from "../utils/GVar";
import type { CameraController } from "./CameraController";
import type { InputMgr } from "./InputMgr";
import * as THREE from 'three';
/**
 * 场景移动控制器
 */
export class SceneMoveController {

    public vec2 = new THREE.Vector2;
    protected _panning: boolean = false;
    protected _startCoords = new THREE.Vector2;
    protected _lastOffset = new THREE.Vector2;
    protected _offset = new THREE.Vector2;
    protected _speed = new THREE.Vector3(GVar.PAN_SPEED, 0, GVar.PAN_SPEED);
    protected _sceneOffset = new THREE.Vector3(0,0,0 );
    protected _worldOffset = new THREE.Vector3;

    protected _inputManager: InputMgr | null = null;
    protected _scene: AppScene | null = null;
    protected _camera: CameraController | null = null;
    protected enabled: boolean = false;

    protected _raycaster = new THREE.Raycaster;

    protected tmpVec2: THREE.Vector2 = new THREE.Vector2(0, 0);

    public constructor(imgr: InputMgr, scene: AppScene, cam: CameraController) {
        this._inputManager = imgr;
        this._scene = scene;
        this._camera = cam;
        this.enabled = true;

        imgr.on("startdrag", this._onStartDrag.bind(this));
        imgr.on("enddrag", this._onEndDrag.bind(this));
        imgr.on("drag", this._onDrag.bind(this));
    }

    protected _onStartDrag(evt: any): void {
        if (this.enabled) {
            this._panning = true;
            this._startCoords.set(evt.x, evt.y);
        }
    }

    protected _onEndDrag(): void {
        if (this.enabled) {
            this._panning = false;
            this._lastOffset.copy(this._offset);
        }
    }
    protected _onDrag(evt: any): void {
        var vector = new THREE.Vector2(0, 0);
        this.tmpVec2.x = evt.x;
        this.tmpVec2.y = evt.y;
        this.vec2.copy(this.tmpVec2);
        if (this.enabled && this._panning) {
            vector.subVectors(this.tmpVec2, this._startCoords);
            this._offset.addVectors(this._lastOffset, vector);
        }
    }


    public raycast(): void {
        //this._raycaster.setFromCamera(this.vec2, this._camera!.camera);

        this._raycaster.set( new THREE.Vector3( 0,0,0 ),new THREE.Vector3( 0,-1,0 ) );
        var intersectors = this._raycaster.intersectObjects(this._scene!.getPickables());
        if (intersectors.length > 0) {
            let insectObj = intersectors[0].object;
            let cx : number = (insectObj as any).userData["centeredX"];
            let cy : number = (insectObj as any).userData["centeredY"];
            this._sceneOffset.x += cx * GVar.CHUNK_SIZE;
            this._sceneOffset.z += cy * GVar.CHUNK_SIZE;
            if (!(0 === cx && 0 === cy)) {
                EventMgr.getins().trigger("chunkmove", cx,cy );
            }
        }
    }

    /**
     * 更新控制器.
     */
    public update(): void {
        var offset = new THREE.Vector2;
        var angle = new THREE.Vector2(0,0);
        var point = new THREE.Vector3(0,0,0 );

        this.raycast();
        offset.copy(this._offset);

        // 这个是计算场景与相机旋转的转换数据:
        offset.rotateAround(angle, -this._camera!.getRotationAngle() );

        // 根据移动速度，来拟合一个最终的效果
        this._worldOffset.set(offset.x, 0, offset.y).multiply(this._speed);
        // 使用线性插值（lerp）技术，使 point 值以每帧 5% 的步幅平滑趋向 _worldOffset。
        // 这意味着场景不会立即跳到新位置，而是逐渐移动，使移动过程更自然流畅。这种平滑效果对用户体验至关重要。
        // 因为有offset的实际数据，所以最终还是会到达目标位置的
        point.lerp(this._worldOffset, .25);

        // 
        // 处理场景内的位置偏移量：
        this._scene!.position.addVectors(this._sceneOffset, point);

        // WORK START: 接下来的重点，相机移动与整体的材质数据： 
        // 优化为相机移动:
        //this._camera!.updateCamPos( point.addVectors(this._sceneOffset, point));
        //console.log( "Scene Move:" + point.x + "," + point.z ); 
    }
}