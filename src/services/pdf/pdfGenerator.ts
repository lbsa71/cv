import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { TransformedCVData } from "@cv/shared";

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

function ensureEnoughSpace(doc: PDFKit.PDFDocument, requiredHeight: number) {
  const currentY = doc.y;
  const pageHeight = doc.page.height - doc.page.margins.bottom;

  if (currentY + requiredHeight > pageHeight) {
    doc.addPage();
    return true;
  }
  return false;
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

  const linkedInRef = `www.linkedin.com/in/lbsa71`;

  // Linkedin
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("blue")
    .text(linkedInRef, {
      link: "https://" + linkedInRef,
      underline: true,
    })
    .fillColor("black")
    .moveDown(0.5);

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
    .map((site) => site.replace("OTHER:", "").replace("PORTFOLIO:", ""))
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
    .fontSize(14)
    .text("Professional Summary", rightColumnStart)
    .moveDown(1)
    .font("Helvetica")
    .fontSize(10)
    .text(data.profile["Summary"], {
      width: rightColumnWidth,
      align: "justify",
    })
    .moveDown(2);

  // Experience
  if (data.positions.length > 0) {
    // Calculate height for first position including section header
    const firstPosition = data.positions[0];
    const headerHeight = 50; // Height for section header
    const firstEntryHeight =
      100 + // Base height for title and company
      firstPosition["Description"].length / 5; // Rough estimate for description length

    // Check if we need a new page for header + first entry
    if (ensureEnoughSpace(doc, headerHeight + firstEntryHeight)) {
      doc.text("", rightColumnStart, doc.page.margins.top);
    }

    // Now write the header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Professional Experience", rightColumnStart)
      .moveDown(1);

    // Write first position
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(firstPosition["Title"], rightColumnStart, doc.y, {
        continued: true,
        width: rightColumnWidth,
      })
      .font("Helvetica")
      .fontSize(11)
      .text(
        `  (${formatDate(firstPosition["Started On"])} - ${formatDate(
          firstPosition["Finished On"]
        )})`
      )
      .font("Helvetica")
      .fontSize(12)
      .fillColor("rgb(80,80,80)")
      .moveDown(0.5)
      .text(
        `${firstPosition["Company Name"]} | ${trimLocation(
          firstPosition["Location"]
        )}`,
        {
          width: rightColumnWidth,
        }
      )
      .fillColor("black")
      .moveDown(0.5)
      .font("Helvetica")
      .fontSize(10)
      .text(firstPosition["Description"], {
        width: rightColumnWidth,
        align: "justify",
      });

    if (firstPosition.skills && firstPosition.skills.length > 0) {
      doc
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(8)
        .fillColor("rgb(100,100,100)")
        .text("Key Skills: ", {
          continued: true,
        })
        .text(firstPosition.skills.join(" • "), {
          width: rightColumnWidth,
          align: "left",
        })
        .fillColor("black");
    }

    doc.moveDown(1.5);

    // Process remaining positions
    for (let i = 1; i < data.positions.length; i++) {
      const position = data.positions[i];
      const estimatedHeight =
        100 + // Base height for title and company
        position["Description"].length / 5; // Rough estimate for description length

      if (ensureEnoughSpace(doc, estimatedHeight)) {
        doc.text("", rightColumnStart, doc.page.margins.top);
      }

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
        .fontSize(10)
        .text(position["Description"], {
          width: rightColumnWidth,
          align: "justify",
        });

      if (position.skills && position.skills.length > 0) {
        doc
          .moveDown(0.5)
          .font("Helvetica")
          .fontSize(8)
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
    }
  }

  // Projects
  if (data.projects.length > 0) {
    // Calculate height for first project including section header
    const firstProject = data.projects[0];
    const headerHeight = 50; // Height for section header
    const firstEntryHeight =
      80 + // Base height for title and dates
      firstProject["Description"].length / 5; // Rough estimate for description length

    // Check if we need a new page for header + first entry
    if (ensureEnoughSpace(doc, headerHeight + firstEntryHeight)) {
      doc.text("", rightColumnStart, doc.page.margins.top);
    }

    // Now write the header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Notable Projects", rightColumnStart)
      .moveDown(1);

    // Write first project
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(firstProject["Title"], rightColumnStart, doc.y, {
        continued: true,
        width: rightColumnWidth,
      })
      .font("Helvetica")
      .fontSize(11)
      .text(
        `  (${formatDate(firstProject["Started On"])} - ${formatDate(
          firstProject["Finished On"]
        )})`
      )
      .moveDown(0.5)
      .font("Helvetica")
      .fontSize(10)
      .text(firstProject["Description"], {
        width: rightColumnWidth,
        align: "justify",
      })
      .moveDown(1.5);

    // Process remaining projects
    for (let i = 1; i < data.projects.length; i++) {
      const project = data.projects[i];
      const estimatedHeight =
        80 + // Base height for title and dates
        project["Description"].length / 5; // Rough estimate for description length

      if (ensureEnoughSpace(doc, estimatedHeight)) {
        doc.text("", rightColumnStart, doc.page.margins.top);
      }

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
        .fontSize(10)
        .text(project["Description"], {
          width: rightColumnWidth,
          align: "justify",
        })
        .moveDown(1.5);
    }
  }

  // Education
  if (data.education.length > 0) {
    // Calculate height for first education entry including section header
    const firstEdu = data.education[0];
    const headerHeight = 50; // Height for section header
    const firstEntryHeight =
      100 + // Base height for school and degree
      (firstEdu["Notes"] || "").length / 5; // Rough estimate for notes length

    // Check if we need a new page for header + first entry
    if (ensureEnoughSpace(doc, headerHeight + firstEntryHeight)) {
      doc.text("", rightColumnStart, doc.page.margins.top);
    }

    // Now write the header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Education", rightColumnStart)
      .moveDown(1);

    // Write first education entry
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(firstEdu["School Name"], rightColumnStart, doc.y, {
        width: rightColumnWidth,
      })
      .font("Helvetica")
      .fontSize(12)
      .text(firstEdu["Degree Name"] || "")
      .fontSize(10)
      .text(
        `${formatDate(firstEdu["Start Date"])} - ${formatDate(
          firstEdu["End Date"]
        )}`
      )
      .moveDown(0.5)
      .text(firstEdu["Notes"] || "", {
        width: rightColumnWidth,
      })
      .moveDown(1.5);

    // Process remaining education entries
    for (let i = 1; i < data.education.length; i++) {
      const edu = data.education[i];
      const estimatedHeight =
        100 + // Base height for school and degree
        (edu["Notes"] || "").length / 5; // Rough estimate for notes length

      if (ensureEnoughSpace(doc, estimatedHeight)) {
        doc.text("", rightColumnStart, doc.page.margins.top);
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(edu["School Name"], rightColumnStart, doc.y, {
          width: rightColumnWidth,
        })
        .font("Helvetica")
        .fontSize(12)
        .text(edu["Degree Name"] || "")
        .fontSize(10)
        .text(
          `${formatDate(edu["Start Date"])} - ${formatDate(edu["End Date"])}`
        )
        .moveDown(0.5)
        .text(edu["Notes"] || "", {
          width: rightColumnWidth,
        })
        .moveDown(1.5);
    }
  }

  // Skills
  if (data.skillCategories.length > 0) {
    // Calculate height for first skill category including section header
    const firstCategory = data.skillCategories[0];
    const headerHeight = 50; // Height for section header
    const firstEntryHeight =
      60 + // Base height for category name
      firstCategory.skills.length * 2; // Rough estimate based on number of skills

    // Check if we need a new page for header + first entry
    if (ensureEnoughSpace(doc, headerHeight + firstEntryHeight)) {
      doc.text("", rightColumnStart, doc.page.margins.top);
    }

    // Now write the header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Technical Skills", rightColumnStart)
      .moveDown(1);

    // Write first skill category
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(firstCategory.name, rightColumnStart, doc.y)
      .moveDown(0.5)
      .font("Helvetica")
      .fontSize(10)
      .text(firstCategory.skills.join(" • "), {
        width: rightColumnWidth,
      })
      .moveDown(1.5);

    // Process remaining skill categories
    for (let i = 1; i < data.skillCategories.length; i++) {
      const category = data.skillCategories[i];
      const estimatedHeight =
        60 + // Base height for category name
        category.skills.length * 2; // Rough estimate based on number of skills

      if (ensureEnoughSpace(doc, estimatedHeight)) {
        doc.text("", rightColumnStart, doc.page.margins.top);
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(category.name, rightColumnStart, doc.y)
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(10)
        .text(category.skills.join(" • "), {
          width: rightColumnWidth,
        })
        .moveDown(1.5);
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
