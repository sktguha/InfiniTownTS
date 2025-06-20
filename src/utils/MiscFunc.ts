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

    public static random() : number{
        return Math.random();
    }

    /**
     * 从数组中随机选择一个元素
     * @param options 数组
     * @returns 随机元素
     */
    public static getRandElement<T>(options: T[]): T {
        return options[Math.floor(MiscFunc.random() * options.length)];
    }


    /**
     * 定义一个异步函数，用于获取 JSON 数据
     * @param filePath 
     * @returns 
     */
    public static async fetchJsonData(filePath: string): Promise<any> {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Network response was not ok`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching JSON data:', error);
            return null;
        }
    }

}