import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { TransformedCVData } from "../../models/types";

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

export async function generateCV(
  data: TransformedCVData,
  outputPath: string
): Promise<void> {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    font: "Helvetica",
    bufferPages: true,
    autoFirstPage: true,
    compress: true,
    info: {
      Title: `${data.profile["First Name"]} ${data.profile["Last Name"]} - CV`,
      Author: `${data.profile["First Name"]} ${data.profile["Last Name"]}`,
      Subject: "Curriculum Vitae",
      Keywords: "CV, Resume, Professional Experience",
    },
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

  doc.moveDown(2);

  const backRef = "https://github.com/lbsa71/cv";
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("This CV generated with", {
      width: leftColumnWidth,
    })
    .moveDown(0.5)
    .fillColor("blue")
    .text(backRef, {
      width: leftColumnWidth,
      link: backRef,
      underline: true,
    })
    .fillColor("black");

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
      lineGap: 7,
    })
    .moveDown(2);

  // Experience
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Professional Experience", rightColumnStart)
    .moveDown(1);

  data.positions.forEach((position) => {
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
      .moveDown(0.5)
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
        lineGap: 7,
      });

    // Add position-specific skills if available
    if (position.skills && position.skills.length > 0) {
      doc
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(10)
        .fillColor("rgb(100,100,100)")
        .text("Key Skills: ", {
          continued: true,
        })
        .text(position.skills.join(" • "), {
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
          lineGap: 7,
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
        lineGap: 7,
      })
      .moveDown(1.5);
  });

  // Skills
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Technical Skills", rightColumnStart)
    .moveDown(1);

  data.skillCategories.forEach((category) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(category.name, rightColumnStart, doc.y)
      .moveDown(0.5)
      .font("Helvetica")
      .fontSize(11)
      .text(category.skills.join(" • "), {
        width: rightColumnWidth,
        lineGap: 7,
      })
      .moveDown(1.5);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
