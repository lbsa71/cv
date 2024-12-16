import type { RawData, TransformedCVData } from "../../models/types";


export function transformData(rawData: RawData): TransformedCVData {
  return {
    profile: rawData["Profile.csv"][0],
    positions: rawData["Positions.csv"].map((pos) => ({
      ...pos,
      skills: [], // We'll populate this from a mapping if needed
    })),
    projects: rawData["Projects.csv"] || [],
    education: rawData["Education.csv"] || [],
    email: rawData["Email Addresses.csv"][0],
    languages: rawData["Languages.csv"] || [],
    skillCategories: [], // We'll populate this if needed
    image: rawData.image,
  };
}

export function parseCSV(text: string): any[] {
  const rows = text.split("\n");
  const headers = rows[0].split(",");
  return rows.slice(1).map((row) => {
    const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] ? values[index].replace(/(^"|"$)/g, "") : "";
      return obj;
    }, {} as { [key: string]: string });
  });
}
