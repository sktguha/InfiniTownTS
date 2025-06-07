import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Cluster {
    x: number;
    z: number;
    cluster: string;
    direction?: number;
}

export class CityLoader {
    private scene: THREE.Scene;
    private clusters: Cluster[];
    private loader: GLTFLoader;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.clusters = [
            { x: 1, z: 0, cluster: 'road' },
            { x: 2, z: 2, cluster: 'factory', direction: 2 },
            { x: 2, z: 1, cluster: 'house2', direction: 2 },
            { x: 2, z: 0, cluster: 'shoparea', direction: 2 },
            { x: 2, z: -1, cluster: 'house', direction: 2 },
            { x: 2, z: -2, cluster: 'factory', direction: 2 },
            { x: 2, z: -3, cluster: 'house2', direction: 2 },
            { x: 2, z: -4, cluster: 'shoparea', direction: 2 },
            { x: 2, z: -5, cluster: 'house', direction: 2 },
            { x: 1, z: 2, cluster: 'apartments', direction: 2 },
            { x: 1, z: 1, cluster: 'house3', direction: 2 },
            { x: 1, z: 0, cluster: 'stadium', direction: 2 },
            { x: 1, z: -1, cluster: 'gas', direction: 2 },
            { x: 1, z: -2, cluster: 'apartments', direction: 2 },
            { x: 1, z: -3, cluster: 'house3', direction: 2 },
            { x: 1, z: -4, cluster: 'stadium', direction: 2 },
            { x: 1, z: -5, cluster: 'gas', direction: 2 },
            { x: 0, z: 2, cluster: 'shops', direction: 2 },
            { x: 0, z: 1, cluster: 'supermarket', direction: 2 },
            { x: 0, z: 0, cluster: 'residence', direction: 2 },
            { x: 0, z: -1, cluster: 'bus', direction: 2 },
            { x: 0, z: -2, cluster: 'shops', direction: 2 },
            { x: 0, z: -3, cluster: 'supermarket', direction: 2 },
            { x: 0, z: -4, cluster: 'residence', direction: 2 },
            { x: 0, z: -5, cluster: 'bus', direction: 2 },
            { x: -1, z: 2, cluster: 'fastfood', direction: 2 },
            { x: -1, z: 1, cluster: 'coffeeshop', direction: 2 },
            { x: -1, z: 0, cluster: 'park', direction: 2 },
            { x: -1, z: -1, cluster: 'supermarket', direction: 2 },
            { x: -1, z: -2, cluster: 'fastfood', direction: 2 },
            { x: -1, z: -3, cluster: 'coffeeshop', direction: 2 },
            { x: -1, z: -4, cluster: 'park', direction: 2 },
            { x: -1, z: -5, cluster: 'supermarket', direction: 2 },
            { x: -2, z: 2, cluster: 'factory', direction: 2 },
            { x: -2, z: 1, cluster: 'house2', direction: 2 },
            { x: -2, z: 0, cluster: 'shoparea', direction: 2 },
            { x: -2, z: -1, cluster: 'house', direction: 2 },
            { x: -2, z: -2, cluster: 'factory', direction: 2 },
            { x: -2, z: -3, cluster: 'house2', direction: 2 },
            { x: -2, z: -4, cluster: 'shoparea', direction: 2 },
            { x: -2, z: -5, cluster: 'house', direction: 2 },
            { x: -3, z: 2, cluster: 'apartments', direction: 2 },
            { x: -3, z: 1, cluster: 'house3', direction: 2 },
            { x: -3, z: 0, cluster: 'stadium', direction: 2 },
            { x: -3, z: -1, cluster: 'gas', direction: 2 },
            { x: -3, z: -2, cluster: 'apartments', direction: 2 },
            { x: -3, z: -3, cluster: 'house3', direction: 2 },
            { x: -3, z: -4, cluster: 'stadium', direction: 2 },
            { x: -3, z: -5, cluster: 'gas', direction: 2 },
            { x: -4, z: 2, cluster: 'shops', direction: 2 },
            { x: -4, z: 1, cluster: 'supermarket', direction: 2 },
            { x: -4, z: 0, cluster: 'residence', direction: 2 },
            { x: -4, z: -1, cluster: 'bus', direction: 2 },
            { x: -4, z: -2, cluster: 'shops', direction: 2 },
            { x: -4, z: -3, cluster: 'supermarket', direction: 2 },
            { x: -4, z: -4, cluster: 'residence', direction: 2 },
            { x: -4, z: -5, cluster: 'bus', direction: 2 },
            { x: -5, z: 2, cluster: 'fastfood', direction: 2 },
            { x: -5, z: 1, cluster: 'coffeeshop', direction: 2 },
            { x: -5, z: 0, cluster: 'park', direction: 2 },
            { x: -5, z: -1, cluster: 'supermarket', direction: 2 },
            { x: -5, z: -2, cluster: 'fastfood', direction: 2 },
            { x: -5, z: -3, cluster: 'coffeeshop', direction: 2 },
            { x: -5, z: -4, cluster: 'park', direction: 2 },
            { x: -5, z: -5, cluster: 'stadium', direction: 2 },
        ];
        this.loader = new GLTFLoader();
    }

    public loadClusters(): void {
        this.clusters.forEach((cl) => {
            const url = `./gltf/${cl.cluster}.gltf`;
            this.loader.load(url, (gltf) => {
                /* ATTENTION TO FIX:
                gltf.scene.traverse((child) => {
                    //if (child.isMesh) {
                    //    child.castShadow = true;
                    //    child.receiveShadow = true;
                    //}
                });*/
                gltf.scene.position.set(cl.x * 60, 0, cl.z * 60);
                if (cl.direction !== undefined) {
                    gltf.scene.rotation.y = Math.PI * cl.direction;
                }
                this.scene.add(gltf.scene);
            }, undefined, (error) => {
                console.error(`Error loading ${url}:`, error);
            });
        });
    }
}