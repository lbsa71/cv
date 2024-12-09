import path from "path";
import { parseCSV, loadPositionSkillsMap } from "../../utils/csvParser";
import {
  Position,
  Profile,
  Project,
  Skill,
  Education,
  Email,
  Language,
  TransformedCVData,
  SkillCategory,
} from "../../models/types";

const SKILL_CATEGORIES = {
  "Core Competencies": new Set([
    "Full-Stack Development",
    "Software Development",
    "Web Development",
    "Mobile Applications",
    "Programming",
    "Test Automation",
    "Mechatronics",
    "Interactive Voice Response (IVR)",
    "Natural Language Processing (NLP)",
  ]),
  "Programming Languages": new Set([
    "JavaScript",
    "TypeScript",
    "Python",
    "Python (Programming Language)",
    "C",
    "C++",
    "C#",
    "Java",
    "PHP",
    "Assembly Language",
    "CSS",
    "Tailwind CSS",
  ]),
  "Web Technologies": new Set([
    "React",
    "React Native",
    "Node.js",
    "Next.js",
    "AngularJS",
    "Microsoft.NET",
    "Mono",
    "PHP Symphony",
    "CSS",
    "ES6",
    "Web Services",
    "Web Applications",
  ]),
  "Cloud & Infrastructure": new Set([
    "Amazon Web Services (AWS)",
    "Google Cloud Platform (GCP)",
    "AWS Aurora",
    "AWS CloudFormation",
    "Infrastructure as code (IaC)",
    "Terraform",
    "DevOps",
    "Configuration Management",
    "Puppet",
    "Distributed Systems",
    "RabbitMQ",
  ]),
  "Artificial Intelligence": new Set([
    "Large Language Models (LLM)",
    "Prompt Engineering",
    "Vector Databases",
    "Fine Tuning",
  ]),
  Databases: new Set(["Microsoft SQL Server", "MySQL", "Entity Framework"]),
  "Development Tools": new Set(["Git", "Windows"]),
  "Engineering Practices": new Set([
    "Software Architecture",
    "Software Design",
    "Software Engineering",
    "Integration",
    "Open Source",
    "Security",
    "Compliance",
  ]),
  Management: new Set([
    "Team Leadership",
    "Software Project Management",
    "Product Management",
    "Product Development",
    "Business Strategy",
    "Backoffice IT Management",
    "Agile Methodologies",
    "Scrum",
    "Extreme Programming",
  ]),
};

function normalizeSkillName(skill: string): string {
  const skillMap: Record<string, string> = {
    ".NET": "Microsoft.NET",
    Databases: "", // This will be filtered out as empty
    Telephony: "",
    "SQL Server": "Microsoft SQL Server",
    AWS: "Amazon Web Services (AWS)",
    GCP: "Google Cloud Platform (GCP)",
  };

  return skillMap[skill] ?? skill;
}

function categorizeSkills(skills: string[]): SkillCategory[] {
  const normalizedSkills = new Set(
    skills.map(normalizeSkillName).filter((skill) => skill !== "")
  );

  const categorizedSkills = Array.from(normalizedSkills).reduce(
    (acc, skillName) => {
      let placed = false;

      for (const [category, skillSet] of Object.entries(SKILL_CATEGORIES)) {
        if (skillSet.has(skillName)) {
          if (!acc[category]) acc[category] = [];
          acc[category].push(skillName);
          placed = true;
          break;
        }
      }

      if (!placed) {
        if (!acc.other) acc.other = [];
        acc.other.push(skillName);
      }

      return acc;
    },
    {} as Record<string, string[]>
  );

  if (categorizedSkills.other && categorizedSkills.other.length > 0) {
    throw new Error(
      `Uncategorized skills: ${JSON.stringify(categorizedSkills.other)}`
    );
  }

  return Object.entries(categorizedSkills).map(([category, skills]) => ({
    name: category,
    skills: skills.sort(),
  }));
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
): (Position & { skills: string[] })[] {
  return positions.map((position) => {
    const companySkills = positionSkillsMap[position["Company Name"]];
    const skills = companySkills?.[position["Title"]] || [];
    return { ...position, skills };
  });
}

export async function loadAndTransformData(): Promise<TransformedCVData> {
  const exportsDir = path.join(process.cwd(), "exports");

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

  // Filter recent positions and map skills
  const recentPositions = filterRecentPositions(positions);
  const positionsWithSkills = mapSkillsToPositions(
    recentPositions,
    positionSkillsMap
  );

  // Get all unique skills from positions
  const allSkills = new Set<string>();
  positionsWithSkills.forEach((position) => {
    position.skills.forEach((skill) => allSkills.add(skill));
  });

  // Categorize skills
  const skillCategories = categorizeSkills(Array.from(allSkills));

  return {
    positions: positionsWithSkills,
    profile: profile[0],
    projects,
    education,
    email: emails[0],
    languages,
    skillCategories,
  };
}
