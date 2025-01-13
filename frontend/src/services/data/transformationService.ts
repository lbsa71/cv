import { 
  type RawData, 
  type TransformedCVData, 
  type Config, 
  transformData,
  parseCSV,
  defaultConfig
} from "@cv/shared";

// Re-export skillCategories from shared config
export const skillCategories = defaultConfig.skillCategories;

export { transformData };
