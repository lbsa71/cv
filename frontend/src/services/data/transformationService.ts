import type { RawData, TransformedCVData, Config, SkillCategories, SkillCategory } from "../../models/types";

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

const defaultSkillCategories = {
  "Core Competencies": [
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
  ],
  "Programming Languages": [
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
  ],
  Frameworks: [
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
  ],
  "Cloud & Infrastructure": [
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
  ],
  "Artificial Intelligence": [
    "Large Language Models (LLM)",
    "Prompt Engineering",
    "Vector Databases",
    "Fine Tuning",
    "Model Hosting",
    "RAG"
  ],
  Databases: [
    "Microsoft SQL Server",
    "GraphQL",
    "Firestore",
    "MongoDB",
    "AWS Aurora",
    "AWS DocumentDB",
    "Firestore",
    "MySQL",
    "Entity Framework",
  ],
  Tools: [
    "Git",
    "Windows",
    "Linux",
    "MacOS",
    "Expo",
    "App Center",
    "Google Workspace",
    "GitHub Actions",
    "GCP Cloud Build",
  ],
  "Engineering Practices": [
    "Software Architecture",
    "Software Design",
    "Software Engineering",
    "Integration",
    "Open Source",
    "Security",
    "Compliance",
  ],
  Management: [
    "Team Leadership",
    "Software Project Management",
    "Product Management",
    "Business Strategy",
    "Agile Methodologies",
    "Scrum",
    "Extreme Programming",
  ],
};

function normalizeSkillName(skill: string): string {
  const normalizedSkill = skillMap[skill];
  if (typeof normalizedSkill === "undefined") return skill;
  if (normalizedSkill === "") return "";
  return normalizedSkill;
}

function categorizeSkills(skills: string[], skillCategories: SkillCategories = defaultSkillCategories): SkillCategories {
  const normalizedSkills = new Set(
    skills.map(normalizeSkillName).filter((skill) => skill !== "")
  );

  const categorizedSkills = Array.from(normalizedSkills).reduce(
    (acc, skillName) => {
      let placed = false;

      for (const [category, _skillSet] of Object.entries(skillCategories)) {

        const skillSet = Array.isArray(_skillSet) ? new Set(_skillSet) : _skillSet;

        if (skillSet.has(skillName)) {
          if (!acc[category]) acc[category] = [];
          acc[category].push(skillName);
          placed = true;
          break;
        }
      }

      if (!placed) {
        // if (!acc.other) acc.other = [];
        // acc.other.push(skillName);
        // console.warn(`Uncategorized skill: "${skillName}"`);
      }

      return acc;
    },
    {} as Record<string, string[]>
  );


  console.log("skillsByCategory", categorizedSkills);
  return categorizedSkills;
}

function filterRecentPositions(positions: any[]): any[] {
  return positions.filter((pos) => {
    const startYear = parseInt(pos["Started On"].split(" ")[1] || "0");
    return startYear >= 1997;
  });
}

export function parseCSV(text: string): any[] {
  const rows = text.split(/\r?\n/);
  const headers = rows[0].split(",").map((h) => h.trim());

  const parseRow = (row: string) => {
    const values: string[] = [];
    let currentValue = "";
    let inQuotes = false;
    let i = 0;

    while (i < row.length) {
      const char = row[i];

      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Handle escaped quotes
          currentValue += '"';
          i += 2;
        } else {
          // Toggle quotes mode
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(currentValue.trim());
        currentValue = "";
        i++;
      } else {
        currentValue += char;
        i++;
      }
    }

    // Add the last field
    values.push(currentValue.trim());

    // Create object from headers and values
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || "";
      return obj;
    }, {} as { [key: string]: string });
  };

  return rows
    .slice(1)
    .filter((row) => row.trim())
    .map(parseRow);
}

export function transformData(
  rawData: RawData,
  config: Config
): TransformedCVData {
  // Filter recent positions and map skills

  const positionSkillsMap = config.positions;

  console.log("positionSkillsMap", positionSkillsMap);

  const positions = filterRecentPositions(rawData["Positions.csv"]).map((pos) => {
    const companySkills = positionSkillsMap[pos["Company Name"]];
    const positionSkills = companySkills ? companySkills[pos["Title"]] : [];
    const normalizedSkills = (positionSkills || [])
      .map(normalizeSkillName)
      .filter((skill) => skill !== "");
    
    return {
      ...pos,
      skills: normalizedSkills,
    };
  });

  // Get all unique skills from positions
  const allSkills = new Set<string>();
  positions.forEach((position) => {
    position.skills.forEach((skill) => allSkills.add(skill));
  });

  // Categorize skills
  const skillCategories = categorizeSkills(Array.from(allSkills), config.skillCategories);

  return {
    profile: rawData["Profile.csv"][0],
    positions,
    projects: rawData["Projects.csv"] || [],
    education: rawData["Education.csv"] || [],
    email: rawData["Email Addresses.csv"][0],
    languages: rawData["Languages.csv"] || [],
    skillCategories,
    image: rawData.image,
  };
}
