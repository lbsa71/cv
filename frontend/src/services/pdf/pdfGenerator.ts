import type {
  TransformedCVData,
  Language,
  PositionWithSkills,
  PositionSkillMapping,
} from "../../models/types";

import * as jspdf from 'jspdf';
// Declare proper types for jsPDF UMD module

function trimLocation(location: string): string {
  const locationMap: Record<string, string> = {
    "Gothenburg, Vastra Gotaland County, Sweden": "Gothenburg, Sweden",
    "Gothenburg, Västra Götaland County, Sweden": "Gothenburg, Sweden",
    "Gothenburg Metropolitan Area": "Gothenburg, Sweden",
    "Göteborg, Sverige": "Gothenburg, Sweden",
  };

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
  positionSkillsMap: PositionSkillMapping = {}
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

  // Left Column - Profile Picture
  if (data.image) {
    doc.addImage(data.image, "JPEG", 50, 50, leftColumnWidth, leftColumnWidth);
  }

  // Left Column - Contact Info
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Contact", 50, 220);

  const linkedInRef = `www.linkedin.com/in/lbsa71`;

  // Linkedin
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("blue");
  doc.textWithLink(linkedInRef, 50, 240, { url: "https://" + linkedInRef });
  doc.setTextColor("black");

  // Email
  doc.text(`Email: ${data.email["Email Address"]}`, 50, 260);

  // Phone
  doc.text("Phone: +46-733 75 11 99", 50, 280);

  // Languages Section
  if (data.languages.length > 0) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Languages", 50, 300);

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
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Links", 50, 400);

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
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(28);
  doc.text(
    `${data.profile["First Name"]} ${data.profile["Last Name"]}`,
    rightColumnStart,
    50
  );
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor("rgb(80,80,80)");
  doc.text(data.profile["Headline"], rightColumnStart, 80);
  doc.setTextColor("black");

  // Summary
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Professional Summary", rightColumnStart, 120);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.profile["Summary"], rightColumnStart, 140, {
    maxWidth: rightColumnWidth,
  });

  // Experience
  if (data.positions.length > 0) {
    let currentY = 180;
    
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
        `${position["Company Name"]} | ${trimLocation(position["Location"])}`,
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

  // Trigger automatic download
  doc.save("cv.pdf");
}
