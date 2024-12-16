import type {
  TransformedCVData,
  Language,
  PositionWithSkills,
} from "../../models/types";

// Declare proper types for jsPDF UMD module
declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options: {
        orientation: "portrait" | "landscape";
        unit: string;
        format: string;
      }) => any;
    };
  }
}

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

export async function generateCV(data: TransformedCVData): Promise<void> {
  // Use the UMD version of jsPDF loaded from CDN
  const doc = new window.jspdf.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
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
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Professional Experience", rightColumnStart, 180);

    data.positions.forEach((position: PositionWithSkills, index: number) => {
      const yOffset = 200 + index * 60;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text(position["Title"], rightColumnStart, yOffset);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.text(
        `(${formatDate(position["Started On"])} - ${formatDate(
          position["Finished On"]
        )})`,
        rightColumnStart + 200,
        yOffset
      );
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor("rgb(80,80,80)");
      doc.text(
        `${position["Company Name"]} | ${trimLocation(position["Location"])}`,
        rightColumnStart,
        yOffset + 20
      );
      doc.setTextColor("black");
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(position["Description"], rightColumnStart, yOffset + 40, {
        maxWidth: rightColumnWidth,
      });
    });
  }

  // Trigger automatic download
  doc.save("cv.pdf");
}
