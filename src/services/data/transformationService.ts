import path from "path";
import { 
  type Position,
  type Profile,
  type Project,
  type Skill,
  type Education,
  type Email,
  type Language,
  type TransformedCVData,
  type Config,
  type RawData,
  parseCSV,
  transformData
} from "@cv/shared";

export async function loadAndTransformData(config: Config): Promise<TransformedCVData> {
  const exportsDir = path.join(process.cwd(), "exports");

  // Load all CSV files
  const [
    positions,
    profile,
    projects,
    skills,
    education,
    emails,
    languages,
  ] = await Promise.all([
    parseCSV<Position>(path.join(exportsDir, "Positions.csv"), "Positions"),
    parseCSV<Profile>(path.join(exportsDir, "Profile.csv"), "Profile"),
    parseCSV<Project>(path.join(exportsDir, "Projects.csv"), "Projects"),
    parseCSV<Skill>(path.join(exportsDir, "Skills.csv"), "Skills"),
    parseCSV<Education>(path.join(exportsDir, "Education.csv"), "Education"),
    parseCSV<Email>(path.join(exportsDir, "Email Addresses.csv"), "Emails"),
    parseCSV<Language>(path.join(exportsDir, "Languages.csv"), "Languages"),
  ]);

  // Create raw data object
  const rawData: RawData = {
    "Positions.csv": positions,
    "Profile.csv": profile,
    "Projects.csv": projects,
    "Education.csv": education,
    "Email Addresses.csv": emails,
    "Languages.csv": languages,
  };

  // Use shared transform function
  return transformData(rawData, config);
}
