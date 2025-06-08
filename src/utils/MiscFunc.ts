/**
 * 杂项函数：
 */
export class MiscFunc{

    /**
     * exp2Fog的参数计算.
     * @param d 
     * @param threshold 
     * @returns 
     */
    public static getDensity(d : number, threshold : number = 0.01) {
        return Math.sqrt(-Math.log(threshold)) / d;
    }
}