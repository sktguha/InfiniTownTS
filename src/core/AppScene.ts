import * as THREE from 'three';
import { GVar } from '../utils/GVar';

/**
 * AppScene组织类:
 * 最上层的组织类，用于全局的数据处理:
 */
export class AppScene extends THREE.Scene {
    protected _pickables: THREE.Mesh[] = [];
    protected arrChunkContainer: THREE.Object3D[][] = [];

    /**
     * 生成Chunk数据：
     * @param x 
     * @param z 
     */
    protected createChunkAt(x: number, z: number): THREE.Object3D {
        // 创建容器对象
        const chunkInsContainer = new THREE.Object3D();

        // 创建平面几何体和材质
        const geometry = new THREE.PlaneGeometry(
            GVar.CHUNK_SIZE,
            GVar.CHUNK_SIZE,
            1,
            1
        );
        const material = new THREE.MeshBasicMaterial();

        // 创建网格对象并添加自定义属性
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;

        // 计算中心偏移量
        const centerOffset = Math.floor(GVar.CHUNK_COUNT / 2);
        mesh.userData["centeredX"] = x - centerOffset;
        mesh.userData["centeredY"] = z - centerOffset;

        // TEST CODE TO DELETE:
        mesh.visible = false;
        mesh.position.y += 0.25;

        // 添加到可拾取对象数组
        this._pickables.push(mesh);

        // 计算位置
        const halfSize = (GVar.CHUNK_COUNT - 1) / 2 * -GVar.CHUNK_SIZE;
        chunkInsContainer.position.x = halfSize + x * GVar.CHUNK_SIZE;
        chunkInsContainer.position.z = halfSize + z * GVar.CHUNK_SIZE;

        // 添加自定义属性
        chunkInsContainer.userData["centeredX"] = mesh.userData["centeredX"];
        chunkInsContainer.userData["centeredY"] = mesh.userData["centeredY"];
        chunkInsContainer.userData["material"] = mesh.material;

        // 将网格添加到容器对象
        chunkInsContainer.add(mesh);

        return chunkInsContainer;
    }


    public initChunks(): void {
        /** @type {number} */
        let j : number = 0;
        for (; j < GVar.CHUNK_COUNT; j++) {
            /** @type {number} */
            let i : number = 0;
            for (; i < GVar.CHUNK_COUNT; i++) {
                if ( !this.arrChunkContainer[i]) {
                    this.arrChunkContainer[i] = [];
                }
                let chunkObj : THREE.Object3D = this.createChunkAt(i, j);
                this.arrChunkContainer[i][j] = chunkObj;
                this.add( chunkObj );
            }
        }
        return;
    }

    public getPickables(): THREE.Mesh[] {
        return this._pickables;
    }

    /**
     * 当前场景内Chunk数组的数据回调：
     * @param cb 
     */
    public forEachChunk(cb: (chunk: THREE.Object3D, centX: number, centY: number) => void): void {
        var i = 0;
        for (; i < GVar.CHUNK_COUNT; i++) {
            /** @type {number} */
            var j = 0;
            for (; j < GVar.CHUNK_COUNT; j++) {
                let value: THREE.Object3D = this.arrChunkContainer[i][j];
                cb(value, value.userData["centeredX"], value.userData["centeredY"]);
            }
        }
    }
}