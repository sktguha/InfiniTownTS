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

export class SceneManager {
    public scene: THREE.Scene;
    public cameraController: CameraController;
    public renderer: Renderer;
    private objects: IObject[] = [];
    private clock: THREE.Clock;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    protected inputMgr : InputMgr = new InputMgr();
    protected smController : SceneMoveController| null = null;
    //
    protected cityChkTbl: CityChunkTbl | null = null;
    //
    protected chunkScene: AppScene | null = null;

    //
    protected gridCoords: THREE.Vector2 = new THREE.Vector2(0, 0);

    // 是否初始化:
    protected bInited : boolean = false;

    constructor(container: HTMLElement) {

        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.FogExp2(GVar.bgColor, MiscFunc.getDensity(800));
        this.scene.background = new THREE.Color(GVar.bgColor);

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

                // 
                // 处理smController:
                this.smController = new SceneMoveController( this.inputMgr, this.chunkScene, this.cameraController );

                // 
                // 第一次刷新测试效果：
                
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

                    this.refreshChunkScene();
                    EventMgr.getins().on( "chunkmove",( xoff : number,yoff:number )=>{
                        this.gridCoords.x += xoff;
                        this.gridCoords.y += yoff;
                        this.refreshChunkScene();
                    });
                    this.cameraController.setCameraHeight(200);

                    this.bInited = true;

                    this.inputMgr.on("mousewheel", (value:any) =>{
                        //this.cameraController.(value.deltaY);
                        this.cameraController.updateHeight( value.deltaY*.1 );
                    });

                }, 1000);
            });

        });

        // 添加鼠标移动监听（用于物体拾取）
        /*
        renderer.renderer.domElement.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });*/
    }

    // 
    // 最核心的场景可视化函数：检测需要删除和重新安装的chunk数据，第一次初始化的时候，
    // remove的空，但会add上去一个新的结点,需要确认 v 是如何获取的，results
    protected refreshChunkScene(): void {
        let $this = this;
        this.chunkScene!.forEachChunk(function (results: any, xOffset : number, yOffset : number ) {
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
        if( this.bInited )
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