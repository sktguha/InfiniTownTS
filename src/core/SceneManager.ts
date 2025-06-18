import * as THREE from 'three';
import { Renderer } from './Renderer';
import type { IObject } from '../interfaces/IObject';
import { CityLoader } from './CityLoader';
import { MiscFunc } from '../utils/MiscFunc';
import { GVar } from '../utils/GVar';
import { AppScene } from './AppScene';
import { BinLoader } from '../loader/BinLoader';
import { BlockLoaded } from '../loader/BlockLoader';
import { CityChunkTbl } from './CityChunkTbl';
import { CameraController } from '../constrol/CameraController';
import { InputMgr } from '../constrol/InputMgr';
import { SceneMoveController } from '../constrol/SceneMoveController';
import { EventMgr } from '../utils/EventMgr';
import { LightProbeLoader } from '../loader/LightProbeLoader';
import { EXRLoader } from 'three/examples/jsm/Addons.js';

export class SceneManager {
    public scene: THREE.Scene;
    public cameraController: CameraController;
    public renderer: Renderer;
    private objects: IObject[] = [];
    private clock: THREE.Clock;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    //
    //! 输出与相机控制类，与ChunkScene关联，从而场景可以无限循环：
    protected inputMgr: InputMgr = new InputMgr();
    protected smController: SceneMoveController | null = null;
    // ChunkInstance核心数据类:
    protected cityChkTbl: CityChunkTbl | null = null;
    // ChunkScene场景核心组织类：
    protected chunkScene: AppScene | null = null;

    // 
    // 网格坐标,无限循环场景的核心算法类：
    protected gridCoords: THREE.Vector2 = new THREE.Vector2(0, 0);

    //! Environment Llighting:
    protected envLightProbe: LightProbeLoader = LightProbeLoader.getins();
    protected dirLight: THREE.DirectionalLight | null = null;

    // 是否初始化:
    protected bInited: boolean = false;

    constructor(container: HTMLElement) {

        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(GVar.FOG_COLOR, GVar.FOG_NEAR, GVar.FOG_FAR);
        this.scene.background = new THREE.Color(GVar.FOG_COLOR);

        // 创建相机控制器
        this.cameraController = new CameraController(container);

        // 初始化lightProbe:
        /*
        this.envLightProbe.initLightProbe("./assets/environments/envProbe/irradiance.json", (light: THREE.LightProbe) => {
            this.scene.add(light);
            this.scene.environment = light as any;
        });*/
        

        // 创建渲染器
        this.renderer = new Renderer(container);
        this.renderer.setSaturation( 1.6 );
        this.renderer.renderer.setClearColor(GVar.FOG_COLOR);
        this.loadEnvMapLighting();

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
        this.scene.add(ambientLight);

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


        // 加载City:
        // const cityLoader = new CityLoader(this.scene);
        // cityLoader.loadClusters();
        let asce: AppScene = new AppScene();
        asce.initChunks();

        BinLoader.loadBin("./assets/scenes/data/main.bin", (data: ArrayBuffer) => {
            let bl: BlockLoaded = new BlockLoaded(data);
            bl.loadBlock("./assets/scenes/main.json", (obj: any) => {

                if (!obj) return;
                // 下一步需要创建Chunk数据了:
                let arrBlocks: Array<any> = obj.getObjectByName("blocks").children;
                let arrLanes: Array<any> = obj.getObjectByName("lanes").children;
                let arrIntersections: Array<any> = obj.getObjectByName("intersections").children;
                let arrCars: Array<any> = obj.getObjectByName("cars").children;
                let arrClouds: Array<any> = obj.getObjectByName("clouds").children;

                let lenarr: Array<number> = [arrBlocks.length, arrLanes.length, arrIntersections.length, arrCars.length, arrClouds.length];
                console.log("The lenth is:" + JSON.stringify(lenarr));

                this.cityChkTbl = new CityChunkTbl(arrBlocks, arrLanes, arrIntersections, arrCars, arrClouds);
                this.chunkScene = new AppScene();
                this.chunkScene.initChunks();
                this.scene.add(this.chunkScene);

                // 初始化方向光：
                this.dirLight = this.renderer.initDirLight();
                this._resizeShadowMapFrustum(window.innerWidth, window.innerHeight);
                this.chunkScene.add(this.dirLight);
                this.chunkScene.add(this.dirLight.target);

                // 
                // 处理smController:
                this.smController = new SceneMoveController(this.inputMgr, this.chunkScene, this.cameraController);

                // 
                setTimeout(() => {
                    /*
                    let images: any = obj.userData["images"];
                    let arrtex: any = obj.userData["textures"];
                                        
                    const geometry = new THREE.BoxGeometry(2, 2, 2);
                    const material = new THREE.MeshStandardMaterial({ map: arrtex['0E12E1AB-1D22-4642-BFB5-BC955808BB55'] });
                    const cube = new THREE.Mesh(geometry, material);
                    this.scene.add(cube);

                    let tmesh : any = arrBlocks[0];
                    tmesh.position.set(0, 0, 0);
                    this.scene.add(tmesh);*/

                    // 第一次刷新测试效果：
                    this.refreshChunkScene();
                    // 响应chunkMove的消息处理与刷新：
                    EventMgr.getins().on("chunkmove", (xoff: number, yoff: number) => {
                        this.gridCoords.x += xoff;
                        this.gridCoords.y += yoff;
                        this.refreshChunkScene();
                    });
                    this.cameraController.setCameraHeight(200);

                    this.bInited = true;
                    this.inputMgr.on("mousewheel", (value: any) => {
                        this.cameraController.updateHeight(value.deltaY * .05);
                    });
                }, 500);
            });

        });
    }

    /**
     * 加载全局的环境光数据:
     */
    protected loadEnvMapLighting(): void {
        // ⚙️ 创建环境贴图生成器
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer.renderer);
        pmremGenerator.compileEquirectangularShader();
        // 🔧 加载 .exr 文件
        new EXRLoader()
            .load('./assets/environments/DayStreet.exr', (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;

                // 生成环境贴图
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;

                // 应用到场景
                this.scene.environment = envMap;
                //scene.background = envMap; // 如果想让它作为背景

                texture.dispose();
                pmremGenerator.dispose();
            });
    }

    /**
     * 窗口大小变化时，阴影贴图需要重新计算：
     * window.innerWidth, window.innerHeight
     * @param wid 
     * @param hei 
     */
    protected _resizeShadowMapFrustum(wid: number, hei: number): void {
        var start = 1.25;
        var childStartView2 = Math.max(wid / hei, start);
        var halfHeight = 75 * childStartView2;
        this.dirLight!.shadow.camera.left = .9 * -halfHeight;
        this.dirLight!.shadow.camera.right = 1.3 * halfHeight;
        this.dirLight!.shadow.camera.top = halfHeight;
        this.dirLight!.shadow.camera.bottom = -halfHeight;
        this.dirLight!.shadow.camera.updateProjectionMatrix();
    }



    // 
    // 最核心的场景可视化函数：检测需要删除和重新安装的chunk数据，第一次初始化的时候，
    // remove的空，但会add上去一个新的结点,需要确认 v 是如何获取的，results
    protected refreshChunkScene(): void {
        let $this = this;
        this.chunkScene!.forEachChunk(function (results: any, xOffset: number, yOffset: number) {
            // 只显示0,0处的Chunk.
            //if (xOffset != 0 && yOffset != 0)
            //    return;

            var xcor = $this.gridCoords.x + xOffset;
            var ycor = $this.gridCoords.y + yOffset;
            var v = $this.cityChkTbl!.getChunkData(xcor, ycor);
            if (!v) return;
            results.remove(results.getObjectByName("chunk"));
            results.add(v.node);
        });
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

        //! SceneMoveController:
        if (this.bInited)
            this.smController?.update();


        // 更新射线投射器
        this.raycaster.setFromCamera(this.mouse, this.cameraController.camera);


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
        this.renderer.renderer.domElement.removeEventListener('mousemove', () => { });
    }
}