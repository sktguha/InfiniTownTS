import * as THREE from 'three';
import { CameraController } from './CameraController';
import { Renderer } from './Renderer';
import type { IObject } from '../interfaces/IObject';

export class SceneManager {
    public scene: THREE.Scene;
    public cameraController: CameraController;
    public renderer: Renderer;
    private objects: IObject[] = [];
    private clock: THREE.Clock;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    constructor(container: HTMLElement) {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);
        
        // 创建相机控制器
        this.cameraController = new CameraController(container);
        
        // 创建渲染器
        this.renderer = new Renderer(container);
        
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // 添加方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // 添加坐标轴
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        
        // 添加网格
        const gridHelper = new THREE.GridHelper(20, 20);
        (gridHelper.material as THREE.Material).opacity = 0.2;
        (gridHelper.material as THREE.Material).transparent = true;
        this.scene.add(gridHelper);
        
        // 初始化时钟
        this.clock = new THREE.Clock();
        
        // 初始化射线投射器（用于后续交互）
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // 添加窗口大小调整监听
        window.addEventListener('resize', () => this.onWindowResize(container));
        
        // 添加鼠标移动监听（用于物体拾取）
        /*
        renderer.renderer.domElement.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });*/
    }
    
    public addObject(object: IObject): void {
        this.objects.push(object);
        this.scene.add(object.mesh);
    }
    
    public removeObject(object: IObject): void {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.scene.remove(object.mesh);
            this.objects.splice(index, 1);
        }
    }
    
    public removeAllObjects(): void {
        this.objects.forEach(obj => {
            this.scene.remove(obj.mesh);
            if (obj.dispose) obj.dispose();
        });
        this.objects = [];
    }
    
    public update(): void {
        const delta = this.clock.getDelta();
        
        // 更新所有对象
        this.objects.forEach(obj => {
            obj.update(delta);
        });
        
        // 更新相机控制器
        this.cameraController.update();
        
        // 更新射线投射器
        this.raycaster.setFromCamera(this.mouse, this.cameraController.camera);
        
        // 检测鼠标悬停的物体
        /*
        const intersects = this.raycaster.intersectObjects(
            this.objects.map(obj => obj.mesh)
        );*/
        
        // 渲染场景
        this.renderer.render(this.scene, this.cameraController.camera);
    }
    
    private onWindowResize(container: HTMLElement): void {
        this.cameraController.onWindowResize(container);
        this.renderer.onWindowResize(container);
    }
    
    public dispose(): void {
        this.removeAllObjects();
        this.renderer.dispose();
        
        // 移除事件监听器
        // ATTENTION TO FIX:
        //window.removeEventListener('resize', this.onWindowResize);
        this.renderer.renderer.domElement.removeEventListener('mousemove', () => {});
    }
}