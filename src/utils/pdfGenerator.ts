import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import {
  Position,
  Profile,
  Project,
  Skill,
  Education,
  Language,
  PositionSkillMapping,
} from "../types";

function trimLocation(location: string) {
  const locationMap: Record<string, string> = {
    "Gothenburg, Vastra Gotaland County, Sweden": "Gothenburg, Sweden",
    "Gothenburg Metropolitan Area": "Gothenburg, Sweden",
    "Göteborg, Sverige": "Gothenburg, Sweden",
  };

  return locationMap[location] || location;
}

type CVData = {
  profile: Profile;
  positions: Position[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  email: { "Email Address": string };
  languages: Language[];
  positionSkillsMap: PositionSkillMapping;
};

function formatDate(date: string): string {
  return date || "Present";
}

function normalizeSkillName(skill: string): string {
  const skillMap: Record<string, string> = {
    ".NET": "Microsoft.NET",
    Databases: "", // This will be filtered out as empty
    "SQL Server": "Microsoft SQL Server",
    AWS: "Amazon Web Services (AWS)",
    GCP: "Google Cloud Platform (GCP)",
  };

  return skillMap[skill] ?? skill;
}

function formatSkills(skills: Skill[]): string[] {
  const categories = {
    // Core Programming Languages
    languages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "C",
      "C++",
      "C#",
      "Java",
      "PHP",
      "Assembly Language",
    ],

    // Web Technologies & Frameworks
    webTechnologies: [
      "React",
      "React Native",
      "Node.js",
      "AngularJS",
      "Microsoft.NET",
      "PHP Symphony",
      "CSS",
      "ES6",
      "Web Services",
      "Web Applications",
    ],

    // Cloud & Infrastructure
    cloudInfrastructure: [
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
    ],

    // AI & Machine Learning
    artificialIntelligence: [
      "Large Language Models (LLM)",
      "Prompt Engineering",
      "Vector Databases",
      "Fine Tuning",
    ],

    // Databases & Data
    databases: ["Microsoft SQL Server", "MySQL", "Entity Framework"],

    // Development Tools & Practices
    developmentTools: ["Git", "Open Source", "Windows", "Test Automation"],

    // Software Engineering Practices
    engineeringPractices: [
      "Software Architecture",
      "Software Design",
      "Software Engineering",
      "Integration",
      "Security",
    ],

    // Management & Methodologies
    management: [
      "Team Leadership",
      "Software Project Management",
      "Product Management",
      "Product Development",
      "Business Strategy",
      "Backoffice IT Management",
      "Agile Methodologies",
      "Scrum",
      "Extreme Programming",
    ],

    // Core Competencies
    coreCompetencies: [
      "Full-Stack Development",
      "Software Development",
      "Web Development",
      "Mobile Applications",
      "Programming",
    ],
  };

  // Pre-process skills to normalize names and remove duplicates
  const normalizedSkills = new Set(
    skills
      .map((skill) => normalizeSkillName(skill["Name"]))
      .filter((skill) => skill !== "") // Remove empty strings (filtered out skills)
  );

  const categorizedSkills = Array.from(normalizedSkills).reduce(
    (acc, skillName) => {
      let placed = false;

      for (const [category, keywords] of Object.entries(categories)) {
        if (
          keywords.some((keyword) =>
            skillName.toLowerCase().includes(keyword.toLowerCase())
          )
        ) {
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

      if (acc.other) {
        throw new Error(`No categories for: ${JSON.stringify(acc.other)}`);
      }

      return acc;
    },
    {} as Record<string, string[]>
  );

  return Object.entries(categorizedSkills).map(([category, skills]) => {
    const formattedCategory = category
      .split(/(?=[A-Z])/)
      .join(" ")
      .replace(/^\w/, (c) => c.toUpperCase());
    return `${formattedCategory}\n${skills.join(" • ")}`;
  });
}

function getPositionSkills(
  position: Position,
  positionSkillsMap: PositionSkillMapping
): string[] {
  const companySkills = positionSkillsMap[position["Company Name"]];
  if (!companySkills) return [];

  return companySkills[position["Title"]] || [];
}

function filterRecentPositions(positions: Position[]): Position[] {
  return positions.filter((pos) => {
    const startYear = parseInt(pos["Started On"].split(" ")[1] || "0");
    return startYear >= 1997;
  });
}

export async function generateCV(
  data: CVData,
  outputPath: string
): Promise<void> {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    font: "Helvetica",
  });
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  // Define column widths and spacing
  const pageWidth = doc.page.width - 2 * 50;
  const leftColumnWidth = 160;
  const rightColumnWidth = pageWidth - leftColumnWidth - 30;
  const rightColumnStart = leftColumnWidth + 70;

  // Left Column - Profile Picture
  const imagePath = path.join(process.cwd(), "images", "default.jpg");
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, 50, 50, {
      width: leftColumnWidth,
    });
  }

  // Left Column - Contact Info
  doc.moveDown(12);

  // Contact Information Section
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Contact", 50, doc.y)
    .moveDown(1);

  // Email
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Email", { continued: true })
    .text(`: ${data.email["Email Address"]}`)
    .moveDown(0.5);

  // Phone
  doc
    .font("Helvetica")
    .text("Phone", { continued: true })
    .text(": +46-733 75 11 99")
    .moveDown(1.5);

  // Languages Section
  if (data.languages.length > 0) {
    doc.font("Helvetica-Bold").fontSize(14).text("Languages").moveDown(1);

    data.languages.forEach((lang) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(lang.Name, { continued: true })
        .text(`: ${lang.Proficiency}`)
        .moveDown(0.5);
    });
    doc.moveDown(1);
  }

  // Websites
  const websites = data.profile["Websites"]
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((site) => site.replace("OTHER:", ""))
    .filter(Boolean);

  if (websites.length > 0) {
    doc.font("Helvetica-Bold").fontSize(14).text("Links").moveDown(1);

    websites.forEach((site) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("blue")
        .text(site, {
          width: leftColumnWidth,
          link: site,
          underline: true,
        })
        .fillColor("black")
        .moveDown(0.5);
    });
  }

  // Right Column Content
  // Name and Title
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(
      `${data.profile["First Name"]} ${data.profile["Last Name"]}`,
      rightColumnStart,
      50
    )
    .font("Helvetica")
    .fontSize(16)
    .fillColor("rgb(80,80,80)")
    .moveDown(0.5)
    .text(data.profile["Headline"], {
      width: rightColumnWidth,
    })
    .fillColor("black")
    .moveDown(2);

  // Summary
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Professional Summary", rightColumnStart)
    .moveDown(1)
    .font("Helvetica")
    .fontSize(11)
    .text(data.profile["Summary"], {
      width: rightColumnWidth,
      align: "justify",
      lineGap: 2,
    })
    .moveDown(2);

  // Experience
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Professional Experience", rightColumnStart)
    .moveDown(1);

  const recentPositions = filterRecentPositions(data.positions);
  recentPositions.forEach((position) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(position["Title"], rightColumnStart, doc.y, {
        continued: true,
        width: rightColumnWidth,
      })
      .font("Helvetica")
      .fontSize(11)
      .text(
        `  (${formatDate(position["Started On"])} - ${formatDate(
          position["Finished On"]
        )})`
      )
      .font("Helvetica")
      .fontSize(12)
      .fillColor("rgb(80,80,80)")
      .text(
        `${position["Company Name"]} | ${trimLocation(position["Location"])}`,
        {
          width: rightColumnWidth,
        }
      )
      .fillColor("black")
      .moveDown(0.5)
      .font("Helvetica")
      .fontSize(11)
      .text(position["Description"], {
        width: rightColumnWidth,
        align: "justify",
        lineGap: 2,
      });

    // Add position-specific skills if available
    const positionSkills = getPositionSkills(position, data.positionSkillsMap);
    if (positionSkills.length > 0) {
      doc
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(10)
        .fillColor("rgb(100,100,100)")
        .text("Key Skills: ", {
          continued: true,
        })
        .text(positionSkills.join(" • "), {
          width: rightColumnWidth,
          align: "left",
        })
        .fillColor("black");
    }

    doc.moveDown(1.5);
  });

  // Projects
  if (data.projects.length > 0) {
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Notable Projects", rightColumnStart)
      .moveDown(1);

    data.projects.forEach((project) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(project["Title"], rightColumnStart, doc.y, {
          continued: true,
          width: rightColumnWidth,
        })
        .font("Helvetica")
        .fontSize(11)
        .text(
          `  (${formatDate(project["Started On"])} - ${formatDate(
            project["Finished On"]
          )})`
        )
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(11)
        .text(project["Description"], {
          width: rightColumnWidth,
          align: "justify",
          lineGap: 2,
        })
        .moveDown(1.5);
    });
  }

  // Education
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Education", rightColumnStart)
    .moveDown(1);

  data.education.forEach((edu) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(edu["School Name"], rightColumnStart, doc.y, {
        width: rightColumnWidth,
      })
      .font("Helvetica")
      .fontSize(12)
      .text(edu["Degree Name"] || "")
      .fontSize(11)
      .text(`${formatDate(edu["Start Date"])} - ${formatDate(edu["End Date"])}`)
      .moveDown(0.5)
      .text(edu["Notes"] || "", {
        width: rightColumnWidth,
        lineGap: 2,
      })
      .moveDown(1.5);
  });

  // Skills
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Technical Skills", rightColumnStart)
    .moveDown(1);

  const formattedSkills = formatSkills(data.skills);
  formattedSkills.forEach((skillCategory) => {
    const [category, skills] = skillCategory.split("\n");
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(category, rightColumnStart, doc.y)
      .moveDown(0.5)
      .font("Helvetica")
      .fontSize(11)
      .text(skills, {
        width: rightColumnWidth,
        lineGap: 2,
      })
      .moveDown(1.5);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
