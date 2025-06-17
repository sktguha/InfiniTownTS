import { MiscFunc } from "../utils/MiscFunc";

/**
 * 环境光照加载.
 */
export class LightProbeLoader {
    private static _ins: LightProbeLoader;
    public static getins(): LightProbeLoader {
        if (!this._ins ) {
            this._ins = new LightProbeLoader();
        }
        return this._ins;
    }

    public initLightProbe( url : string ) : void{
        MiscFunc.fetchJsonData(url).then( (data) => {
            console.log(data.length);
            debugger;
        });
    }
}