import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
    public camera: THREE.PerspectiveCamera;
    public controls: OrbitControls;
    //private container : HTMLElement;

    constructor(container: HTMLElement) {
        //this.container = container;
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // 创建轨道控制器
        this.controls = new OrbitControls(this.camera, container);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
       // 禁用所有移动相关的功能
        this.controls.enablePan = false;      // 禁用平移（鼠标右键拖拽）
        this.controls.enableZoom = false;      // 禁用缩放（鼠标滚轮）
        this.controls.screenSpacePanning = false; // 禁用屏幕空间平移
        

    }
    
    public update(): void {
        this.controls.update();
    }
    
    public onWindowResize(container: HTMLElement): void {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
    }
}