import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
    public camera: THREE.PerspectiveCamera;
    public controls: OrbitControls;
    //private container : HTMLElement;
    public targetHeight: number = 140;
    private originalMinPolarAngle: number = 0;
    private originalMaxPolarAngle: number = Math.PI;
    private bPolarAdj: boolean = false;
    private readonly tolerance: number = 0.005;


    constructor(container: HTMLElement) {
        //this.container = container;

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            30,
            container.clientWidth / container.clientHeight,
            10,
            400
        );
        this.camera.position.set(80, 140, 80); //initCamera
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));


        // 创建轨道控制器
        this.controls = new OrbitControls(this.camera, container);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        // 禁用所有移动相关的功能
        this.controls.enablePan = false;      // 禁用平移（鼠标右键拖拽）
        this.controls.enableZoom = false;      // 禁用缩放（鼠标滚轮）
        this.controls.screenSpacePanning = false; // 禁用屏幕空间平移

        let pa: number = this.controls.getPolarAngle();
        this.controls.minPolarAngle = pa;
        this.controls.maxPolarAngle = pa;
        this.bPolarAdj = false;

    }

    public setCameraHeight(height: number): void {
        this.camera.position.y = height;

        this.unlockVerticalRotation();
    }

    public updateHeight( value : number ) : void{
        this.targetHeight = this.targetHeight + value;
        if( this.targetHeight < 30 ){
            this.targetHeight = 30;
        }
        if( this.targetHeight>140 )
            this.targetHeight = 140;

        this.unlockVerticalRotation();
    }

    // 锁定垂直旋转
    private lockVerticalRotation(): void {
        const currentAngle = this.controls.getPolarAngle();
        this.controls.minPolarAngle = currentAngle;
        this.controls.maxPolarAngle = currentAngle;
        this.bPolarAdj = false;
        this.controls.enabled = true;
    }

    // 解除垂直旋转限制
    private unlockVerticalRotation(): void {
        this.controls.minPolarAngle = this.originalMinPolarAngle;
        this.controls.maxPolarAngle = this.originalMaxPolarAngle;
        this.bPolarAdj = true;
        this.controls.enabled = false;
    }

    public update(): void {

        // 允许垂直旋转：恢复默认角度范围
        if (this.bPolarAdj) {
            this.camera.position.y += .05 * (this.targetHeight - this.camera.position.y);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));

            let diff: number = this.camera.position.y - this.targetHeight;
            if (Math.abs(diff) < this.tolerance) {
                this.lockVerticalRotation();
            }
            //console.log("New　Cammera Pos is:" + this.camera.position.y);
        }

        this.controls.update();

        console.log( "Rotation Angle:" + this.controls.getAzimuthalAngle() );

    }

    /**
     * 获取旋转角度，根据旋转角度移动场景：
     * @returns 
     */
    public getRotationAngle(): number {
        return this.controls.getAzimuthalAngle();
    }

    public onWindowResize(container: HTMLElement): void {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
    }
}