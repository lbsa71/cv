import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import {
  Position,
  Profile,
  Project,
  Skill,
  Education,
  Email,
  Language,
  PositionSkillMapping,
} from "../types";

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
    "Email Addresses.csv",
    "Languages.csv",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(exportsDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Required file not found: ${file}`);
    } else {
      console.log(`Found file: ${file}`);
    }
  }

  const [
    positions,
    profile,
    projects,
    skills,
    education,
    emails,
    languages,
    positionSkillsMap,
  ] = await Promise.all([
    parseCSV<Position>(path.join(exportsDir, "Positions.csv"), "Positions"),
    parseCSV<Profile>(path.join(exportsDir, "Profile.csv"), "Profile"),
    parseCSV<Project>(path.join(exportsDir, "Projects.csv"), "Projects"),
    parseCSV<Skill>(path.join(exportsDir, "Skills.csv"), "Skills"),
    parseCSV<Education>(path.join(exportsDir, "Education.csv"), "Education"),
    parseCSV<Email>(path.join(exportsDir, "Email Addresses.csv"), "Emails"),
    parseCSV<Language>(path.join(exportsDir, "Languages.csv"), "Languages"),
    loadPositionSkillsMap(),
  ]);

  // Log the counts
  console.log({
    positionsCount: positions.length,
    profileCount: profile.length,
    projectsCount: projects.length,
    skillsCount: skills.length,
    educationCount: education.length,
    emailsCount: emails.length,
    languagesCount: languages.length,
  });

  return {
    positions,
    profile: profile[0], // Profile CSV typically has only one row
    projects,
    skills,
    education,
    email: emails[0], // Assuming primary email is first
    languages,
    positionSkillsMap,
  };
}
