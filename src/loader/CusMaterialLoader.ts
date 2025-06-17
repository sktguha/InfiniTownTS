import * as THREE from 'three';

// 材质选项接口定义
interface MaterialOptions {
    uuid?: string;
    name?: string;
    customType?: 'MatcapMaterial' | 'PBRMaterial' | 'SkyboxMaterial';
    
    // 通用属性
    color?: number;
    opacity?: number;
    transparent?: boolean;
    alphaTest?: number;
    
    // PBR材质特有属性
    environment?: any;
    exposure?: number;
    metalFactor?: number;
    glossFactor?: number;
    normalFactor?: number;
    aoFactor?: number;
    occludeSpecular?: boolean;
    
    // 贴图属性
    map?: string;
    map2?: string;
    normalMap?: string;
    normalMap2?: string;
    metalGlossMap?: string;
    aoMap?: string;
    aoMap2?: string;
    lightMap?: string;
    lightMapM?: string;
    lightMapDir?: string;
    emissiveMap?: string;
    packedPBRMap?: string;
    cubemap?: string;
}

// MatcapMaterial创建器接口
interface MatcapMaterialCreator {
    create(options: {
        uuid?: string;
        name?: string;
        normalMap?: THREE.Texture;
        matcapMap?: THREE.Texture;
        normalMapFactor?: number;
    }): THREE.Material;
}

// PBRMaterial创建器接口
interface PBRMaterialCreator {
    create(options: {
        vertexShader?: string;
        fragmentShader?: string;
        uuid?: string;
        name?: string;
        color?: number;
        opacity?: number;
        transparent?: boolean;
        alphaTest?: number;
        environment?: any;
        exposure?: number;
        albedoMap?: THREE.Texture;
        albedoMap2?: THREE.Texture;
        metalGlossMap?: THREE.Texture;
        packedMap?: THREE.Texture;
        metalFactor?: number;
        glossFactor?: number;
        normalMapFactor?: number;
        normalMap?: THREE.Texture;
        normalMap2?: THREE.Texture;
        lightMap?: THREE.Texture;
        lightMapM?: THREE.Texture;
        lightMapDir?: THREE.Texture;
        aoMap?: THREE.Texture;
        aoMap2?: THREE.Texture;
        aoFactor?: number;
        occludeSpecular?: boolean;
        emissiveMap?: THREE.Texture;
    }): THREE.Material;
}

// 扩展的MaterialLoader类
export class CusMaterialLoader extends THREE.MaterialLoader {
    private static shaders: { [key: string]: string } | null = null;
    private matcapCreator: MatcapMaterialCreator;
    private pbrCreator: PBRMaterialCreator;
    private originalParse: (json: any) => THREE.Material;

    constructor(
        matcapCreator: MatcapMaterialCreator,
        pbrCreator: PBRMaterialCreator,
        manager?: THREE.LoadingManager
    ) {
        super(manager);
        this.matcapCreator = matcapCreator;
        this.pbrCreator = pbrCreator;
        
        // 保存原始parse函数的引用
        this.originalParse = THREE.MaterialLoader.prototype.parse.bind(this);
    }

    /**
     * 设置着色器资源
     */
    static setShaders(shaderResources: { [key: string]: string }): void {
        CusMaterialLoader.shaders = shaderResources;
    }

    /**
     * 重写的parse函数，支持自定义材质类型
     */
    parse(options: MaterialOptions): THREE.Material {
        // 首先调用原始的parse函数获取基础材质
        const baseMaterial = this.originalParse(options);


        // 处理PBRMaterial
        if (options.customType === 'PBRMaterial') {
            //return this.createPBRMaterial(options, baseMaterial);
        }


        // 默认返回基础材质
        return baseMaterial;
    }

    /**
     * 创建PBRMaterial
     */
    /*
    private createPBRMaterial(options: MaterialOptions, baseMaterial: THREE.Material): THREE.Material {
        if (!ExtendedMaterialLoader.shaders) {
            throw new Error('Shaders must be set before creating PBR materials');
        }

        // 获取各种纹理
        const metalGlossMap = options.metalGlossMap ? this.getTexture(options.metalGlossMap) : null;
        const map2 = options.map2 ? this.getTexture(options.map2) : null;
        const normalMap2 = options.normalMap2 ? this.getTexture(options.normalMap2) : null;
        const aoMap2 = options.aoMap2 ? this.getTexture(options.aoMap2) : null;
        const lightMapM = options.lightMapM ? this.getTexture(options.lightMapM) : null;
        const lightMapDir = options.lightMapDir ? this.getTexture(options.lightMapDir) : null;
        const emissiveMap = options.emissiveMap ? this.getTexture(options.emissiveMap) : null;
        const packedPBRMap = options.packedPBRMap ? this.getTexture(options.packedPBRMap) : null;

        return this.pbrCreator.create({
            vertexShader: ExtendedMaterialLoader.shaders["pbr.vs"],
            fragmentShader: ExtendedMaterialLoader.shaders["pbr.fs"],
            uuid: options.uuid,
            name: options.name,
            color: options.color,
            opacity: (baseMaterial as any).opacity,
            transparent: (baseMaterial as any).transparent,
            alphaTest: (baseMaterial as any).alphaTest,
            environment: options.environment,
            exposure: options.exposure,
            albedoMap: (baseMaterial as any).map,
            albedoMap2: map2,
            metalGlossMap: metalGlossMap,
            packedMap: packedPBRMap,
            metalFactor: options.metalFactor,
            glossFactor: options.glossFactor,
            normalMapFactor: options.normalFactor,
            normalMap: (baseMaterial as any).normalMap,
            normalMap2: normalMap2,
            lightMap: (baseMaterial as any).lightMap,
            lightMapM: lightMapM,
            lightMapDir: lightMapDir,
            aoMap: (baseMaterial as any).aoMap,
            aoMap2: aoMap2,
            aoFactor: options.aoFactor,
            occludeSpecular: options.occludeSpecular,
            emissiveMap: emissiveMap
        });
    }*/
}
