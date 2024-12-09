import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import { Position, Profile, Project, Skill, Education } from "../types";

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

export async function loadLinkedInData() {
  const exportsDir = path.join(process.cwd(), "exports");
  console.log("Loading data from directory:", exportsDir);

  // First, verify all required files exist
  const requiredFiles = [
    "Positions.csv",
    "Profile.csv",
    "Projects.csv",
    "Skills.csv",
    "Education.csv",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(exportsDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Required file not found: ${file}`);
    } else {
      console.log(`Found file: ${file}`);
    }
  }

  const [positions, profile, projects, skills, education] = await Promise.all([
    parseCSV<Position>(path.join(exportsDir, "Positions.csv"), "Positions"),
    parseCSV<Profile>(path.join(exportsDir, "Profile.csv"), "Profile"),
    parseCSV<Project>(path.join(exportsDir, "Projects.csv"), "Projects"),
    parseCSV<Skill>(path.join(exportsDir, "Skills.csv"), "Skills"),
    parseCSV<Education>(path.join(exportsDir, "Education.csv"), "Education"),
  ]);

  // Log the counts
  console.log({
    positionsCount: positions.length,
    profileCount: profile.length,
    projectsCount: projects.length,
    skillsCount: skills.length,
    educationCount: education.length,
  });

  return {
    positions,
    profile: profile[0], // Profile CSV typically has only one row
    projects,
    skills,
    education,
  };
}
