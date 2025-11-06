import type {
  Position,
  PositionWithSkills,
  TransformedCVData,
  RawData,
  Config,
  SkillCategories
} from '../models/types';

const skillMap: Record<string, string> = {
  ".NET": "Microsoft.NET",
  Databases: "",
  Telephony: "",
  Programming: "",
  "Product Development": "Product Management",
  "SQL Server": "Microsoft SQL Server",
  AWS: "Amazon Web Services (AWS)",
  GCP: "Google Cloud Platform (GCP)",
};

function normalizeSkillName(skill: string): string {
  const normalizedSkill = skillMap[skill];
  if (typeof normalizedSkill === "undefined") return skill;
  if (normalizedSkill === "") return "";
  return normalizedSkill;
}

function categorizeSkills(skills: string[], skillCategories: SkillCategories): SkillCategories {
  const normalizedSkills = new Set(
    skills.map(normalizeSkillName).filter((skill) => skill !== "")
  );

  const categorizedSkills = Array.from(normalizedSkills).reduce(
    (acc, skillName) => {
      let placed = false;

      for (const [category, skillSet] of Object.entries(skillCategories)) {
        if (skillSet.includes(skillName)) {
          if (!acc[category]) acc[category] = [];
          acc[category].push(skillName);
          placed = true;
          break;
        }
      }

      if (!placed) {
        console.warn(`Uncategorized skill: "${skillName}"`);
      }

      return acc;
    },
    {} as Record<string, string[]>
  );

  return categorizedSkills;
}

function filterRecentPositions(positions: Position[]): Position[] {
  return positions.filter((pos) => {
    const startYear = parseInt(pos["Started On"].split(" ")[1] || "0");
    return startYear >= 1997;
  });
}

function mapSkillsToPositions(
  positions: Position[],
  positionSkillsMap: Record<string, Record<string, string[]>>
): PositionWithSkills[] {
  return positions.map((position) => {
    const companySkills = positionSkillsMap[position["Company Name"]];
    const skills = companySkills?.[position.Title] || [];

    const normalizedSkills = skills
      .map(normalizeSkillName)
      .filter((skill) => skill !== "");

    return { ...position, skills: normalizedSkills };
  });
}

export function transformData(
  rawData: RawData,
  config: Config
): TransformedCVData {
  console.log("\n=== transformData: Starting transformation ===");
  console.log("Available raw data keys:", Object.keys(rawData));
  console.log("Profile.csv:", rawData["Profile.csv"] ? `${rawData["Profile.csv"].length} entries` : "MISSING");
  console.log("Positions.csv:", rawData["Positions.csv"] ? `${rawData["Positions.csv"].length} entries` : "MISSING");
  console.log("Projects.csv:", rawData["Projects.csv"] ? `${rawData["Projects.csv"].length} entries` : "MISSING");
  console.log("Education.csv:", rawData["Education.csv"] ? `${rawData["Education.csv"].length} entries` : "MISSING");
  console.log("Email Addresses.csv:", rawData["Email Addresses.csv"] ? `${rawData["Email Addresses.csv"].length} entries` : "MISSING");
  console.log("Languages.csv:", rawData["Languages.csv"] ? `${rawData["Languages.csv"].length} entries` : "MISSING");
  
  // Filter recent positions and map skills
  const positions = filterRecentPositions(rawData["Positions.csv"] || []);
  console.log(`Filtered positions: ${positions.length} (from ${rawData["Positions.csv"]?.length || 0})`);
  
  const positionsWithSkills = mapSkillsToPositions(positions, config.positions);

  // Get all unique skills from positions
  const allSkills = new Set<string>();
  positionsWithSkills.forEach((position) => {
    position.skills.forEach((skill) => allSkills.add(skill));
  });

  // Categorize skills
  const skillCategories = categorizeSkills(Array.from(allSkills), config.skillCategories);

  const transformed: TransformedCVData = {
    profile: rawData["Profile.csv"]?.[0],
    positions: positionsWithSkills,
    projects: rawData["Projects.csv"] || [],
    education: rawData["Education.csv"] || [],
    email: rawData["Email Addresses.csv"]?.[0],
    languages: rawData["Languages.csv"] || [],
    skillCategories,
    image: rawData.image,
  };

  console.log("\n=== transformData: Transformation complete ===");
  console.log("Profile:", transformed.profile ? "Present" : "MISSING - This will cause an error!");
  if (transformed.profile) {
    console.log("Profile keys:", Object.keys(transformed.profile));
  }
  console.log("Positions:", transformed.positions.length);
  console.log("Projects:", transformed.projects.length);
  console.log("Education:", transformed.education.length);
  console.log("Email:", transformed.email ? "Present" : "MISSING");
  console.log("Languages:", transformed.languages.length);
  console.log("Skill categories:", Object.keys(transformed.skillCategories).length);
  
  return transformed;
}
