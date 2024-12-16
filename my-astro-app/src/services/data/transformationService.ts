import type {
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

const SKILL_CATEGORIES = {
  "Core Competencies": new Set([
    "Full-Stack Development",
    "Software Development",
    "Web Development",
    "CI/CD",
    "Mobile Applications",
    "Programming",
    "Test Automation",
    "Mechatronics",
    "Interactive Voice Response (IVR)",
    "Natural Language Processing (NLP)",
    "Web Services",
    "Web Applications",
    "Backoffice IT Management",
  ]),
  "Programming Languages": new Set([
    "JavaScript",
    "TypeScript",
    "Python",
    "C",
    "C++",
    "C#",
    "Java",
    "PHP",
    "Assembly Language",
    "CSS",
    "SQL",
    "Tailwind CSS",
    "Terraform Script",
  ]),
  Frameworks: new Set([
    "React",
    "React Native",
    "Node.js",
    "Next.js",
    "AngularJS",
    "Microsoft.NET",
    "Mono",
    "Symphony",
    "Firebase",
    "Docker",
  ]),
  "Cloud & Infrastructure": new Set([
    "Amazon Web Services (AWS)",
    "Google Cloud Platform (GCP)",
    "AWS Aurora",
    "AWS CloudFormation",
    "Infrastructure as code (IaC)",
    "Terraform Cloud",
    "GitHub Actions",
    "GCP Cloud Build",
    "DevOps",
    "Configuration Management",
    "Puppet",
    "Distributed Systems",
    "RabbitMQ",
    "Serverless",
  ]),
  "Artificial Intelligence": new Set([
    "Large Language Models (LLM)",
    "Prompt Engineering",
    "Vector Databases",
    "Fine Tuning",
  ]),
  Databases: new Set([
    "Microsoft SQL Server",
    "GraphQL",
    "Firestore",
    "MongoDB",
    "AWS Aurora",
    "AWS DocumentDB",
    "Firestore",
    "MySQL",
    "Entity Framework",
  ]),
  Tools: new Set([
    "Git",
    "Windows",
    "Linux",
    "MacOS",
    "Expo",
    "App Center",
    "Google Workspace",
    "GitHub Actions",
    "GCP Cloud Build",
  ]),
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
    "Business Strategy",
    "Agile Methodologies",
    "Scrum",
    "Extreme Programming",
  ]),
};

function normalizeSkillName(skill: string): string {
  const normalizedSkill = skillMap[skill];

  if (typeof normalizedSkill === "undefined") return skill;
  if (normalizedSkill === "") return "";

  return normalizedSkill;
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
        console.warn(`Uncategorized skill: "${skillName}"`);
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

    // Normalize and filter skills at the position level
    const normalizedSkills = skills
      .map(normalizeSkillName)
      .filter((skill) => skill !== "");

    return { ...position, skills: normalizedSkills };
  });
}

function parseCSV<T>(csvContent: string, type: string): T[] {
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',');
  return rows.slice(1).map(row => {
    const values = row.split(',');
    return headers.reduce((obj, header, index) => {
      (obj as any)[header] = values[index] ? values[index].trim() : '';
      return obj;
    }, {} as T);
  });
}

function loadPositionSkillsMap(): Record<string, Record<string, string[]>> {
  // Implement logic to load position skills map here
  return {};
}

export async function loadAndTransformData(): Promise<TransformedCVData> {
  const exportsDir = "/exports"; // Adjusted for frontend environment

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
    fetch(`${exportsDir}/Positions.csv`).then(res => res.text()).then(text => parseCSV<Position>(text, "Positions")),
    fetch(`${exportsDir}/Profile.csv`).then(res => res.text()).then(text => parseCSV<Profile>(text, "Profile")),
    fetch(`${exportsDir}/Projects.csv`).then(res => res.text()).then(text => parseCSV<Project>(text, "Projects")),
    fetch(`${exportsDir}/Skills.csv`).then(res => res.text()).then(text => parseCSV<Skill>(text, "Skills")),
    fetch(`${exportsDir}/Education.csv`).then(res => res.text()).then(text => parseCSV<Education>(text, "Education")),
    fetch(`${exportsDir}/Email Addresses.csv`).then(res => res.text()).then(text => parseCSV<Email>(text, "Emails")),
    fetch(`${exportsDir}/Languages.csv`).then(res => res.text()).then(text => parseCSV<Language>(text, "Languages")),
    Promise.resolve(loadPositionSkillsMap()),
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
