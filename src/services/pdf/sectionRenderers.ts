import fs from "fs";
import path from "path";
import {
  PDFState,
  RIGHT_COLUMN_START,
  RIGHT_COLUMN_WIDTH,
  LEFT_COLUMN_WIDTH,
  PAGE_MARGIN,
  trimLocation,
  formatDate,
  moveDown,
  checkPageBreak,
} from "./layoutUtils";
import {
  Position,
  Profile,
  Project,
  Education,
  Language,
  SkillCategory,
} from "../../models/types";

export function renderProfile(
  state: PDFState,
  profile: Profile,
  email: { "Email Address": string }
): void {
  const { doc } = state;

  // Profile Picture
  const imagePath = path.join(process.cwd(), "images", "default.jpg");
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, PAGE_MARGIN, PAGE_MARGIN, {
      width: LEFT_COLUMN_WIDTH,
    });
  }

  // Contact Info
  state.currentY = PAGE_MARGIN + 400; // Approximate position after image

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Contact", PAGE_MARGIN, state.currentY);

  moveDown(state);

  // Email
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Email", PAGE_MARGIN, state.currentY, { continued: true })
    .text(`: ${email["Email Address"]}`);

  moveDown(state, 0.5);

  // Phone
  doc
    .text("Phone", PAGE_MARGIN, state.currentY, { continued: true })
    .text(": +46-733 75 11 99");

  moveDown(state, 1.5);

  // Right side - Name and Title
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(
      `${profile["First Name"]} ${profile["Last Name"]}`,
      RIGHT_COLUMN_START,
      PAGE_MARGIN
    )
    .font("Helvetica")
    .fontSize(16)
    .fillColor("rgb(80,80,80)")
    .moveDown(0.5)
    .text(profile["Headline"], {
      width: RIGHT_COLUMN_WIDTH,
    })
    .fillColor("black")
    .moveDown(2);

  // Summary
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Professional Summary", RIGHT_COLUMN_START)
    .moveDown(1)
    .font("Helvetica")
    .fontSize(11)
    .text(profile["Summary"], {
      width: RIGHT_COLUMN_WIDTH,
      align: "justify",
      lineGap: 7,
    })
    .moveDown(2);
}

export function renderLanguages(state: PDFState, languages: Language[]): void {
  if (languages.length === 0) return;

  const { doc } = state;

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Languages", PAGE_MARGIN, state.currentY)
    .moveDown(1);

  languages.forEach((lang) => {
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(lang.Name, PAGE_MARGIN, state.currentY, { continued: true })
      .text(`: ${lang.Proficiency}`);
    moveDown(state, 0.5);
  });
  moveDown(state, 1.5);
}

export function renderWebsites(state: PDFState, websitesStr: string): void {
  const websites = websitesStr
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((site) => site.replace("OTHER:", ""))
    .filter(Boolean);

  if (websites.length === 0) return;

  const { doc } = state;

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Links", PAGE_MARGIN, state.currentY)
    .moveDown(1);

  websites.forEach((site) => {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("blue")
      .text(site, {
        width: LEFT_COLUMN_WIDTH,
        link: site,
        underline: true,
      })
      .fillColor("black");
    moveDown(state, 0.5);
  });
  moveDown(state, 1);
}

export function renderExperience(state: PDFState, positions: Position[]): void {
  const { doc } = state;

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Professional Experience", RIGHT_COLUMN_START, state.currentY)
    .moveDown(1);

  positions.forEach((position) => {
    checkPageBreak(state, 180); // Adjusted for better spacing

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(position["Title"], RIGHT_COLUMN_START, state.currentY, {
        continued: true,
        width: RIGHT_COLUMN_WIDTH,
      })
      .font("Helvetica")
      .fontSize(11)
      .text(
        `  (${formatDate(position["Started On"])} - ${formatDate(
          position["Finished On"]
        )})`
      );

    moveDown(state);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("rgb(80,80,80)")
      .text(
        `${position["Company Name"]} | ${trimLocation(position["Location"])}`,
        RIGHT_COLUMN_START,
        state.currentY,
        {
          width: RIGHT_COLUMN_WIDTH,
        }
      )
      .fillColor("black");

    moveDown(state, 0.5);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(position["Description"], RIGHT_COLUMN_START, state.currentY, {
        width: RIGHT_COLUMN_WIDTH,
        align: "justify",
        lineGap: 7,
      });

    moveDown(state);

    // Position-specific skills
    if (position.skills && position.skills.length > 0) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("rgb(100,100,100)")
        .text("Key Skills: ", RIGHT_COLUMN_START, state.currentY, {
          continued: true,
        })
        .text(position.skills.join(" • "), {
          width: RIGHT_COLUMN_WIDTH,
          align: "left",
        })
        .fillColor("black");
    }

    moveDown(state, 1.5);
  });
}

export function renderProjects(state: PDFState, projects: Project[]): void {
  if (projects.length === 0) return;

  const { doc } = state;

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Notable Projects", RIGHT_COLUMN_START, state.currentY)
    .moveDown(1);

  projects.forEach((project) => {
    checkPageBreak(state, 130);

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(project["Title"], RIGHT_COLUMN_START, state.currentY, {
        continued: true,
        width: RIGHT_COLUMN_WIDTH,
      })
      .font("Helvetica")
      .fontSize(11)
      .text(
        `  (${formatDate(project["Started On"])} - ${formatDate(
          project["Finished On"]
        )})`
      );

    moveDown(state, 0.5);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(project["Description"], RIGHT_COLUMN_START, state.currentY, {
        width: RIGHT_COLUMN_WIDTH,
        align: "justify",
        lineGap: 7,
      });

    moveDown(state, 1.5);
  });
}

export function renderEducation(state: PDFState, education: Education[]): void {
  const { doc } = state;

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Education", RIGHT_COLUMN_START, state.currentY)
    .moveDown(1);

  education.forEach((edu) => {
    checkPageBreak(state, 130);

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(edu["School Name"], RIGHT_COLUMN_START, state.currentY, {
        width: RIGHT_COLUMN_WIDTH,
      });

    moveDown(state);

    doc
      .font("Helvetica")
      .fontSize(12)
      .text(edu["Degree Name"] || "", RIGHT_COLUMN_START, state.currentY);

    moveDown(state);

    doc
      .fontSize(11)
      .text(
        `${formatDate(edu["Start Date"])} - ${formatDate(edu["End Date"])}`,
        RIGHT_COLUMN_START,
        state.currentY
      );

    moveDown(state, 0.5);

    if (edu["Notes"]) {
      doc.text(edu["Notes"], RIGHT_COLUMN_START, state.currentY, {
        width: RIGHT_COLUMN_WIDTH,
        lineGap: 7,
      });
    }

    moveDown(state, 1.5);
  });
}

export function renderSkills(
  state: PDFState,
  skillCategories: SkillCategory[]
): void {
  const { doc } = state;

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Technical Skills", RIGHT_COLUMN_START, state.currentY)
    .moveDown(1);

  skillCategories.forEach((category) => {
    checkPageBreak(state, 90);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(category.name, RIGHT_COLUMN_START, state.currentY);

    moveDown(state, 0.5);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(category.skills.join(" • "), RIGHT_COLUMN_START, state.currentY, {
        width: RIGHT_COLUMN_WIDTH,
        lineGap: 7,
      });

    moveDown(state, 1.5);
  });
}
