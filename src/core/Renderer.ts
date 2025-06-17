import * as THREE from 'three';
import { GVar } from '../utils/GVar';

export class Renderer {
    public renderer: THREE.WebGLRenderer;
    //private container: HTMLElement;

    constructor(container: HTMLElement) {
        //this.container = container;

        // 创建WebGL渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            logarithmicDepthBuffer: true
        });

        // 设置渲染器参数
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制最大像素比
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;

        // 将渲染器的DOM元素添加到容器中
        container.appendChild(this.renderer.domElement);

        // 添加CSS样式
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '0';
    }

    public initDirLight() : THREE.DirectionalLight {
        var light = new THREE.DirectionalLight(16774618, 1.25);
        light.position.set(100, 150, -40);
        //this.chunkScene.add(light);
        //this.chunkScene.add(light.target);
        //this.dirLight = light;
        /** @type {boolean} */
        light.castShadow = true;
        /** @type {number} */
        light.shadow.radius = 1;
        /** @type {number} */
        light.shadow.bias = -.001;
        light.shadow.mapSize.width = GVar.SHADOWMAP_RESOLUTION;
        light.shadow.mapSize.height = GVar.SHADOWMAP_RESOLUTION;
        /** @type {number} */
        light.shadow.camera.near = 50;
        /** @type {number} */
        light.shadow.camera.far = 300;
        //this._resizeShadowMapFrustum(window.innerWidth, window.innerHeight);
        /** @type {boolean} */
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        return light;
    }

    public render(scene: THREE.Scene, camera: THREE.Camera): void {
        this.renderer.render(scene, camera);
    }

    public onWindowResize(container: HTMLElement): void {
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    public dispose(): void {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer.domElement.remove();
    }
}