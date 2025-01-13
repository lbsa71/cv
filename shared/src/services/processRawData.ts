import { transformData } from "./transformationService";
import type { Config } from "@cv/shared";

export function processRawData(rawData: Record<string, any>, config?: Config) {
    console.log("Raw data processed:", rawData);
    const transformedData = transformData(rawData, config);
    console.log("Transformed data:", transformedData);
    return transformedData;
}
