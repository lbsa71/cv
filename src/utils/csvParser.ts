import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import { PositionSkillMapping } from "../types";

export async function parseCSV<T>(
  filePath: string,
  label: string
): Promise<T[]> {
  console.log(`Parsing ${label} from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }

  const records: T[] = [];

  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  for await (const record of parser) {
    records.push(record as T);
  }

  console.log(`Parsed ${records.length} records from ${label}`);
  console.log("Sample record:", JSON.stringify(records[0], null, 2));

  return records;
}

export async function loadPositionSkillsMap(): Promise<PositionSkillMapping> {
  const mapPath = path.join(
    process.cwd(),
    "src",
    "utils",
    "positionSkillsMap.json"
  );
  if (!fs.existsSync(mapPath)) {
    console.error("Position-skills mapping file not found");
    return {};
  }

  try {
    const content = fs.readFileSync(mapPath, "utf-8");
    return JSON.parse(content) as PositionSkillMapping;
  } catch (error) {
    console.error("Error loading position-skills mapping:", error);
    return {};
  }
}
