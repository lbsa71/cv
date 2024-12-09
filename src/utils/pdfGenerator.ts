import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { Position, Profile, Project, Skill, Education } from "../types";

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
};

function formatDate(date: string): string {
  return date || "Present";
}

function formatSkills(skills: Skill[]): string[] {
  const categories = {
    languages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "C++",
      "C#",
      "Java",
      "PHP",
    ],
    frameworks: ["React", "Node.js", "AngularJS", ".NET", "Entity Framework"],
    cloud: ["AWS", "Google Cloud Platform", "Infrastructure as code", "DevOps"],
    other: [] as string[],
  };

  const categorizedSkills = skills.reduce((acc, skill) => {
    const skillName = skill["Name"];
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

    return acc;
  }, {} as Record<string, string[]>);

  return Object.entries(categorizedSkills).map(
    ([category, skills]) =>
      `${category.charAt(0).toUpperCase() + category.slice(1)}: ${skills.join(
        ", "
      )}`
  );
}

export async function generateCV(
  data: CVData,
  outputPath: string
): Promise<void> {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  // Define column widths
  const pageWidth = doc.page.width - 2 * 50; // Total width minus margins
  const leftColumnWidth = 150;
  const rightColumnWidth = pageWidth - leftColumnWidth - 20; // 20px gap between columns
  const rightColumnStart = leftColumnWidth + 70;

  // Left Column - Profile Picture
  const imagePath = path.join(process.cwd(), "images", "default.jpg");
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, 50, 50, {
      width: leftColumnWidth,
    });
  }

  // Left Column - Contact Info
  doc.moveDown(12); // Move below the image
  doc.fontSize(10);

  // Extract websites from the profile
  const websites = data.profile["Websites"]
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((site) => site.replace("OTHER:", ""))
    .filter(Boolean);

  // Contact Information Section
  doc
    .fontSize(12)
    .text("Contact", 50, doc.y, { width: leftColumnWidth, align: "left" })
    .moveDown(0.5)
    .fontSize(9);

  // Location
  doc
    .fontSize(10)
    .text("Email:", { continued: true })
    .fontSize(9)
    .text(` lbsa71@hotmail.com`)
    .moveDown(0.5);

  doc
    .fontSize(10)
    .text("Phone:", { continued: true })
    .fontSize(9)
    .text(` +46-733 75 11 99`)
    .moveDown(0.5);

  // Websites
  if (websites.length > 0) {
    doc.fontSize(10).text("Links:").moveDown(0.2);

    websites.forEach((site) => {
      doc
        .fontSize(8)
        .text(site, { width: leftColumnWidth, link: site })
        .moveDown(0.2);
    });
  }

  // Right Column Content
  // Name and Title
  doc
    .fontSize(24)
    .text(
      `${data.profile["First Name"]} ${data.profile["Last Name"]}`,
      rightColumnStart,
      50
    )
    .fontSize(14)
    .moveDown(0.5)
    .text(data.profile["Headline"], { width: rightColumnWidth })
    .moveDown(1.5);

  // Summary
  doc
    .fontSize(16)
    .text("Professional Summary", rightColumnStart, doc.y, { underline: true })
    .fontSize(10)
    .moveDown(0.5)
    .text(data.profile["Summary"], {
      width: rightColumnWidth,
      align: "justify",
    })
    .moveDown(1.5);

  // Experience
  doc
    .fontSize(16)
    .text("Professional Experience", rightColumnStart, doc.y, {
      underline: true,
    })
    .moveDown(0.5);

  data.positions.forEach((position) => {
    doc
      .fontSize(12)
      .text(position["Title"], rightColumnStart, doc.y, {
        continued: true,
        width: rightColumnWidth,
      })
      .fontSize(10)
      .text(
        `  (${formatDate(position["Started On"])} - ${formatDate(
          position["Finished On"]
        )})`
      )
      .fontSize(11)
      .text(
        `${position["Company Name"]} | ${trimLocation(position["Location"])}`,
        {
          width: rightColumnWidth,
        }
      )
      .fontSize(10)
      .moveDown(0.5)
      .text(position["Description"], {
        width: rightColumnWidth,
        align: "justify",
      })
      .moveDown(1);
  });

  // Projects
  if (data.projects.length > 0) {
    doc
      .fontSize(16)
      .text("Notable Projects", rightColumnStart, doc.y, { underline: true })
      .moveDown(0.5);

    data.projects.forEach((project) => {
      doc
        .fontSize(12)
        .text(project["Title"], rightColumnStart, doc.y, {
          continued: true,
          width: rightColumnWidth,
        })
        .fontSize(10)
        .text(
          `  (${formatDate(project["Started On"])} - ${formatDate(
            project["Finished On"]
          )})`
        )
        .moveDown(0.5)
        .text(project["Description"], {
          width: rightColumnWidth,
          align: "justify",
        })
        .moveDown(1);
    });
  }

  // Education
  doc
    .fontSize(16)
    .text("Education", rightColumnStart, doc.y, { underline: true })
    .moveDown(0.5);

  data.education.forEach((edu) => {
    doc
      .fontSize(12)
      .text(edu["School Name"], rightColumnStart, doc.y, {
        width: rightColumnWidth,
      })
      .fontSize(11)
      .text(edu["Degree Name"] || "")
      .fontSize(10)
      .text(`${formatDate(edu["Start Date"])} - ${formatDate(edu["End Date"])}`)
      .moveDown(0.5)
      .text(edu["Notes"] || "", {
        width: rightColumnWidth,
      })
      .moveDown(1);
  });

  // Skills
  doc
    .fontSize(16)
    .text("Technical Skills", rightColumnStart, doc.y, { underline: true })
    .moveDown(0.5)
    .fontSize(10);

  const formattedSkills = formatSkills(data.skills);
  formattedSkills.forEach((skillCategory) => {
    doc
      .text(skillCategory, rightColumnStart, doc.y, {
        width: rightColumnWidth,
      })
      .moveDown(0.5);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
