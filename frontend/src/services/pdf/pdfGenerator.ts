import type {
  TransformedCVData,
  Language,
  Config
} from "@cv/shared";
import { formatDate, trimLocation } from "@cv/shared";

import * as jspdf from 'jspdf';

export async function fileToBase64(file?: File): Promise<string | undefined> {

  if (!file) return undefined;

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => {

      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string"));
      }

      return resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function ensureEnoughSpace(doc: jspdf.jsPDF, requiredHeight: number, currentY: number): number {
  const pageHeight = doc.internal.pageSize.getHeight() - 50; // 50pt margin

  if (currentY + requiredHeight > pageHeight) {
    doc.addPage();
    return 50; // Return new Y position at top of page
  }
  return currentY;
}

export function generateCV(data: TransformedCVData, config: Config): void {
  const doc = new jspdf.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  // Define column widths and spacing
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftColumnWidth = 160;
  const rightColumnWidth = pageWidth - leftColumnWidth - 90; // Increased margin
  const rightColumnStart = leftColumnWidth + 70;

  // Initialize currentY for vertical positioning
  let currentY = 50;

  // Left Column - Profile Picture
  if (typeof data.image === 'string' && data.image.trim() !== '') {
    doc.addImage(data.image, "JPEG", 50, currentY, leftColumnWidth, leftColumnWidth);
    currentY += leftColumnWidth + 50; // Increased spacing after image
  } else {
    currentY = 50; // Reset if no image
  }

  // Left Column - Contact Info
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Contact", 50, currentY);
  currentY += 20;

  const linkedInRef = `www.linkedin.com/in/lbsa71`;

  // Linkedin
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("blue");
  doc.textWithLink(linkedInRef, 50, currentY, { url: "https://" + linkedInRef });
  doc.setTextColor("black");

  // Email
  currentY += 20;
  doc.text(`Email: ${data.email["Email Address"]}`, 50, currentY);

  // Phone
  currentY += 20;
  doc.text("Phone: +46-733 75 11 99", 50, currentY);

  // Languages Section
  if (Array.isArray(data.languages) && data.languages.length > 0) {
    currentY += 40;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Languages", 50, currentY);

    data.languages.forEach((lang: Language) => {
      currentY += 20;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${lang.Name}: ${lang.Proficiency}`, 50, currentY);
    });
  }

  // Websites
  const websites = (data.profile["Websites"] || '')
    .replace(/[[\]]/g, "")
    .split(",")
    .map((site: string) => site.replace("OTHER:", "").replace("PORTFOLIO:", ""))
    .filter((site: string) => site.trim().length > 0);

  if (websites.length > 0) {
    currentY += 40;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Links", 50, currentY);

    websites.forEach((site: string) => {
      currentY += 20;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("blue");
      doc.textWithLink(site, 50, currentY, { url: site });
      doc.setTextColor("black");
    });
  }

  // Right Column Content
  // Name and Title
  currentY = 50;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(28);
  doc.text(
    `${data.profile["First Name"]} ${data.profile["Last Name"]}`,
    rightColumnStart,
    currentY
  );

  currentY = 80;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor("rgb(80,80,80)");
  const headline = data.profile["Headline"] || '';
  const splitHeadline = doc.splitTextToSize(headline, rightColumnWidth) as string;
  doc.text(splitHeadline, rightColumnStart, currentY);
  doc.setTextColor("black");
  currentY += splitHeadline.length * 20 + 20;

  // Summary
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Professional Summary", rightColumnStart, currentY);

  currentY += 20;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  const summary = data.profile["Summary"] || '';
  const splitSummary = doc.splitTextToSize(summary, rightColumnWidth) as string;
  doc.text(splitSummary, rightColumnStart, currentY);
  currentY += splitSummary.length * 12 + 30;

  // Experience
  if (Array.isArray(data.positions) && data.positions.length > 0) {
    // Professional Experience header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Professional Experience", rightColumnStart, currentY);
    currentY += 30;

    // Process each position
    for (const position of data.positions) {
      const estimatedHeight = 120 + (position["Description"] ? position["Description"].length : 0) / 5;
      currentY = ensureEnoughSpace(doc, estimatedHeight, currentY);

      // Title and dates
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      const titleWidth = doc.getTextWidth(position["Title"]);
      doc.text(position["Title"], rightColumnStart, currentY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      const dateText = `(${formatDate(position["Started On"])} - ${formatDate(position["Finished On"])})`;
      doc.text(dateText, rightColumnStart + titleWidth + 10, currentY);

      currentY += 20;

      // Company and location
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor("rgb(80,80,80)");
      doc.text(
        `${position["Company Name"]} | ${trimLocation(position["Location"], config.locationMap)}`,
        rightColumnStart,
        currentY
      );
      doc.setTextColor("black");

      currentY += 20;

      // Description
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const description = position["Description"] || '';
      const splitDescription = doc.splitTextToSize(description, rightColumnWidth) as string;
      doc.text(splitDescription, rightColumnStart, currentY);

      currentY += splitDescription.length * 12 + 20;

      // Add normalized skills from the position
      if (position.skills.length > 0) {
        currentY = ensureEnoughSpace(doc, 40, currentY);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor("rgb(100,100,100)");
        const skillsText = "Key Skills: " + position.skills.join(" • ");
        const splitSkills = doc.splitTextToSize(skillsText, rightColumnWidth) as string;
        doc.text(splitSkills, rightColumnStart, currentY);
        doc.setTextColor("black");

        currentY += splitSkills.length * 10 + 30;
      }
    }
  }

  // Projects
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    // Projects header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    currentY = ensureEnoughSpace(doc, 30, currentY);
    doc.text("Notable Projects", rightColumnStart, currentY);
    currentY += 30;

    // Process each project
    for (const project of data.projects) {
      const estimatedHeight = 80 + (project["Description"] ? project["Description"].length : 0) / 5;
      currentY = ensureEnoughSpace(doc, estimatedHeight, currentY);

      // Title and dates
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      const titleWidth = doc.getTextWidth(project["Title"]);
      doc.text(project["Title"], rightColumnStart, currentY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      const dateText = `(${formatDate(project["Started On"])} - ${formatDate(project["Finished On"])})`;
      doc.text(dateText, rightColumnStart + titleWidth + 10, currentY);

      currentY += 20;

      // Description
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const description = project["Description"] || '';
      const splitDescription = doc.splitTextToSize(description, rightColumnWidth) as string;
      doc.text(splitDescription, rightColumnStart, currentY);

      currentY += splitDescription.length * 12 + 30;
    }
  }

  // Education
  if (Array.isArray(data.education) && data.education.length > 0) {
    // Education header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    currentY = ensureEnoughSpace(doc, 30, currentY);
    doc.text("Education", rightColumnStart, currentY);
    currentY += 30;

    // Process each education entry
    for (const edu of data.education) {
      const notesLength = edu["Notes"] ? edu["Notes"].length : 0;
      const estimatedHeight = 100 + notesLength / 5;
      currentY = ensureEnoughSpace(doc, estimatedHeight, currentY);

      // School name
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text(edu["School Name"], rightColumnStart, currentY);
      currentY += 20;

      // Degree name
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      if (edu["Degree Name"]) {
        doc.text(edu["Degree Name"], rightColumnStart, currentY);
        currentY += 20;
      }

      // Dates
      doc.setFontSize(10);
      doc.text(
        `${formatDate(edu["Start Date"])} - ${formatDate(edu["End Date"])}`,
        rightColumnStart,
        currentY
      );
      currentY += 20;

      // Notes
      if (typeof edu["Notes"] === 'string' && edu["Notes"].length > 0) {
        const notes = edu["Notes"] || '';
        const splitNotes = doc.splitTextToSize(notes, rightColumnWidth) as string;
        doc.text(splitNotes, rightColumnStart, currentY);
        currentY += splitNotes.length * 12 + 20;
      }
    }
  }

  // Skills
  if (typeof data.skillCategories === 'object' && Object.keys(data.skillCategories).length > 0) {
    // Technical Skills header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    currentY = ensureEnoughSpace(doc, 30, currentY);
    doc.text("Technical Skills", rightColumnStart, currentY);
    currentY += 30;

    // Process each skill category
    for (const [categoryName, skillSet] of Object.entries(data.skillCategories)) {
      const skills = Array.from(skillSet);
      const estimatedHeight = 40 + skills.length * 10;
      currentY = ensureEnoughSpace(doc, estimatedHeight, currentY);

      // Category name
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(categoryName, rightColumnStart, currentY);
      currentY += 15;

      // Skills
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const skillsText = skills.join(" • ");
      const splitSkills = doc.splitTextToSize(skillsText, rightColumnWidth) as string;
      doc.text(splitSkills, rightColumnStart, currentY);
      currentY += splitSkills.length * 12 + 20;
    }
  }

  // Add "Generated with" section at bottom of left column
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.text("This CV generated with", 50, doc.internal.pageSize.getHeight() - 80);

  const backRef = "https://github.com/lbsa71/cv";
  doc.setTextColor("blue");
  doc.textWithLink(backRef, 50, doc.internal.pageSize.getHeight() - 60, { url: backRef });
  doc.setTextColor("black");

  // Trigger automatic download
  doc.save("cv.pdf");
}
