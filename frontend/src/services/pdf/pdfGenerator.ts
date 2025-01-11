import type {
  TransformedCVData,
  Language,
  Config,
  LocationMap,
  SkillCategories
} from "../../models/types";

import * as jspdf from 'jspdf';
// Declare proper types for jsPDF UMD module

const defaultLocationMap: Record<string, string> = {
  "Gothenburg, Vastra Gotaland County, Sweden": "Gothenburg, Sweden",
  "Gothenburg, Västra Götaland County, Sweden": "Gothenburg, Sweden",
  "Gothenburg Metropolitan Area": "Gothenburg, Sweden",
  "Göteborg, Sverige": "Gothenburg, Sweden",
};

function trimLocation(location: string, locationMap: LocationMap = defaultLocationMap): string {
  return locationMap[location] || location;
}

function formatDate(date: string): string {
  return date || "Present";
}

function ensureEnoughSpace(doc: any, requiredHeight: number, currentY: number) {
  const pageHeight = doc.internal.pageSize.getHeight() - 50; // 50pt margin

  if (currentY + requiredHeight > pageHeight) {
    doc.addPage();
    return 50; // Return new Y position at top of page
  }
  return currentY;
}

export async function generateCV(
  data: TransformedCVData,
  config: Config
): Promise<void> {
  const doc = new jspdf.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  // Define column widths and spacing
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftColumnWidth = 160;
  const rightColumnWidth = pageWidth - leftColumnWidth - 30;
  const rightColumnStart = leftColumnWidth + 70;

  // Initialize currentY for vertical positioning
  let currentY = 50;

  // Left Column - Profile Picture
  if (data.image) {
    doc.addImage(data.image, "JPEG", 50, currentY, leftColumnWidth, leftColumnWidth);
  }

  // Left Column - Contact Info
  currentY = 220;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Contact", 50, currentY);

  const linkedInRef = `www.linkedin.com/in/lbsa71`;

  // Linkedin
  currentY = 240;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("blue");
  doc.textWithLink(linkedInRef, 50, currentY, { url: "https://" + linkedInRef });
  doc.setTextColor("black");

  // Email
  currentY = 260;
  doc.text(`Email: ${data.email["Email Address"]}`, 50, currentY);

  // Phone
  currentY = 280;
  doc.text("Phone: +46-733 75 11 99", 50, currentY);

  // Languages Section
  if (data.languages.length > 0) {
    currentY = 300;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Languages", 50, currentY);

    data.languages.forEach((lang: Language, index: number) => {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${lang.Name}: ${lang.Proficiency}`, 50, 320 + index * 20);
    });
  }

  // Websites
  const websites = data.profile["Websites"]
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((site) => site.replace("OTHER:", "").replace("PORTFOLIO:", ""))
    .filter(Boolean);

  if (websites.length > 0) {
    currentY = 400;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Links", 50, currentY);

    websites.forEach((site: string, index: number) => {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("blue");
      doc.textWithLink(site, 50, 420 + index * 20, { url: site });
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
  doc.text(data.profile["Headline"], rightColumnStart, currentY);
  doc.setTextColor("black");

  // Summary
  currentY = 120;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Professional Summary", rightColumnStart, currentY);
  
  currentY = 140;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.profile["Summary"], rightColumnStart, currentY, {
    maxWidth: rightColumnWidth,
  });

  // Experience
  if (data.positions.length > 0) {
    currentY = 180;
    
    // Professional Experience header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Professional Experience", rightColumnStart, currentY);
    currentY += 30;

    // Process each position
    for (const position of data.positions) {
      const estimatedHeight = 120 + position["Description"].length / 5;
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
      const splitDescription = doc.splitTextToSize(position["Description"], rightColumnWidth);
      doc.text(splitDescription, rightColumnStart, currentY);
      
      currentY += splitDescription.length * 12 + 20;

      // Add normalized skills from the position
      if (position.skills && position.skills.length > 0) {
        currentY = ensureEnoughSpace(doc, 40, currentY);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor("rgb(100,100,100)");
        const skillsText = "Key Skills: " + position.skills.join(" • ");
        const splitSkills = doc.splitTextToSize(skillsText, rightColumnWidth);
        doc.text(splitSkills, rightColumnStart, currentY);
        doc.setTextColor("black");
        
        currentY += splitSkills.length * 10 + 30;
      }
    }
  }

  // Projects
  if (data.projects.length > 0) {
    // Projects header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    currentY = ensureEnoughSpace(doc, 30, currentY);
    doc.text("Notable Projects", rightColumnStart, currentY);
    currentY += 30;

    // Process each project
    for (const project of data.projects) {
      const estimatedHeight = 80 + project["Description"].length / 5;
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
      const splitDescription = doc.splitTextToSize(project["Description"], rightColumnWidth);
      doc.text(splitDescription, rightColumnStart, currentY);
      
      currentY += splitDescription.length * 12 + 30;
    }
  }

  // Education
  if (data.education.length > 0) {
    // Education header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    currentY = ensureEnoughSpace(doc, 30, currentY);
    doc.text("Education", rightColumnStart, currentY);
    currentY += 30;

    // Process each education entry
    for (const edu of data.education) {
      const estimatedHeight = 100 + (edu["Notes"]?.length || 0) / 5;
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
      if (edu["Notes"]) {
        const splitNotes = doc.splitTextToSize(edu["Notes"], rightColumnWidth);
        doc.text(splitNotes, rightColumnStart, currentY);
        currentY += splitNotes.length * 12 + 20;
      }
    }
  }

  // Skills
  if (data.skillCategories && Object.keys(data.skillCategories).length > 0) {
    // Technical Skills header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    currentY = ensureEnoughSpace(doc, 30, currentY);
    doc.text("Technical Skills", rightColumnStart, currentY);
    currentY += 30;

    console.log(data.skillCategories);

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
      const splitSkills = doc.splitTextToSize(skillsText, rightColumnWidth);
      doc.text(splitSkills, rightColumnStart, currentY);
      currentY += splitSkills.length * 12 + 20;
    }
  }

  // Trigger automatic download
  doc.save("cv.pdf");
}
