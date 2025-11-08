import fs from "fs";
import { TransformedCVData, Config, formatDate, trimLocation } from "@cv/shared";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatTextWithLineBreaks(text: string): string {
  return escapeHtml(text)
    .split(/\n+/)
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${p.trim()}</p>`)
    .join('');
}

export async function generateHTML(
  data: TransformedCVData,
  config: Config,
  outputPath: string,
  privatize: boolean = false
): Promise<void> {
  console.log("\n=== generateHTML: Starting HTML generation ===");
  if (privatize) {
    console.log("🔒 Privatize mode: Email and phone will be excluded");
  }
  console.log("Data structure check:");
  console.log("- Profile:", data.profile ? "Present" : "MISSING");
  console.log("- Positions:", data.positions?.length ?? 0);
  console.log("- Projects:", data.projects?.length ?? 0);
  console.log("- Education:", data.education?.length ?? 0);
  console.log("- Email:", data.email ? "Present" : "MISSING");
  console.log("- Languages:", data.languages?.length ?? 0);

  if (!data.profile) {
    throw new Error("Profile data is missing! Cannot generate HTML without profile information.");
  }

  const linkedInRef = config.linkedInRef || "";
  const linkedInUrl = linkedInRef ? (linkedInRef.startsWith('http') ? linkedInRef : `https://${linkedInRef}`) : "";

  // Parse websites
  const websites = (data.profile["Websites"] || '')
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((site) => site.replace("OTHER:", "").replace("PORTFOLIO:", "").trim())
    .filter(Boolean);

  // Build HTML
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(`${data.profile["First Name"]} ${data.profile["Last Name"]} - CV`)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .page {
        page-break-after: always;
        margin: 0;
        padding: 0;
      }
      .page:last-child {
        page-break-after: auto;
      }
    }
    
    body {
      font-family: 'Helvetica', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 20px;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
      padding: 50px;
      display: flex;
      gap: 30px;
    }
    
    .left-column {
      width: 160px;
      flex-shrink: 0;
    }
    
    .right-column {
      flex: 1;
      min-width: 0;
    }
    
    .profile-image {
      width: 160px;
      height: auto;
      max-width: 160px;
      margin-bottom: 20px;
      display: block;
    }
    
    .section-title {
      font-weight: bold;
      font-size: 14pt;
      margin-bottom: 10px;
      color: #000;
    }
    
    .contact-info {
      font-size: 10pt;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .contact-info a {
      color: #0000ff;
      text-decoration: underline;
    }
    
    .contact-info p {
      margin-bottom: 5px;
    }
    
    .languages-list {
      list-style: none;
      margin-bottom: 20px;
    }
    
    .languages-list li {
      font-size: 10pt;
      margin-bottom: 5px;
    }
    
    .links-list {
      list-style: none;
      margin-bottom: 20px;
    }
    
    .links-list a {
      color: #0000ff;
      text-decoration: underline;
      font-size: 10pt;
      display: block;
      margin-bottom: 5px;
      word-break: break-all;
    }
    
    .name {
      font-weight: bold;
      font-size: 28pt;
      margin-bottom: 5px;
      color: #000;
    }
    
    .headline {
      font-size: 16pt;
      color: #505050;
      margin-bottom: 20px;
    }
    
    .summary-section {
      margin-bottom: 30px;
    }
    
    .summary-section .section-title {
      font-size: 14pt;
      margin-bottom: 10px;
    }
    
    .summary-section p {
      font-size: 10pt;
      text-align: justify;
      margin-bottom: 8px;
    }
    
    .experience-section,
    .projects-section,
    .education-section,
    .skills-section {
      margin-bottom: 30px;
    }
    
    .section-header {
      font-weight: bold;
      font-size: 16pt;
      margin-bottom: 15px;
      margin-top: 20px;
    }
    
    .position,
    .project,
    .education-entry {
      margin-bottom: 20px;
    }
    
    .position-title,
    .project-title,
    .education-school {
      font-weight: bold;
      font-size: 13pt;
      display: inline;
    }
    
    .position-dates,
    .project-dates,
    .education-dates {
      font-size: 11pt;
      display: inline;
      margin-left: 5px;
    }
    
    .position-company,
    .education-degree {
      font-size: 12pt;
      color: #505050;
      margin: 5px 0;
    }
    
    .position-description,
    .project-description,
    .education-notes {
      font-size: 10pt;
      text-align: justify;
      margin-top: 5px;
      line-height: 1.5;
    }
    
    .position-skills {
      font-size: 8pt;
      color: #646464;
      margin-top: 5px;
    }
    
    .education-degree-name {
      font-size: 12pt;
      margin: 5px 0;
    }
    
    .skill-category {
      margin-bottom: 15px;
    }
    
    .skill-category-name {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 5px;
    }
    
    .skill-category-skills {
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <div class="left-column">
`;

  // Left Column - Profile Picture
  if (typeof data.image === 'string' && data.image.trim() !== '') {
    html += `      <img src="${data.image}" alt="Profile Picture" class="profile-image" />\n`;
  }

  // Contact Information
  html += `      <div class="contact-info">
        <div class="section-title">Contact</div>
`;

  if (linkedInUrl) {
    html += `        <p><a href="${escapeHtml(linkedInUrl)}" target="_blank">${escapeHtml(linkedInRef)}</a></p>\n`;
  }

  if (!privatize) {
    html += `        <p>Email: ${escapeHtml(data.email["Email Address"])}</p>\n`;

    if (config.phone) {
      html += `        <p>Phone: ${escapeHtml(config.phone)}</p>\n`;
    }
  }

  html += `      </div>\n`;

  // Languages
  if (data.languages.length > 0) {
    html += `      <div class="section-title">Languages</div>
      <ul class="languages-list">
`;
    data.languages.forEach((lang) => {
      html += `        <li>${escapeHtml(lang.Name)}: ${escapeHtml(lang.Proficiency)}</li>\n`;
    });
    html += `      </ul>\n`;
  }

  // Links
  if (websites.length > 0) {
    html += `      <div class="section-title">Links</div>
      <ul class="links-list">
`;
    websites.forEach((site) => {
      const url = site.startsWith('http') ? site : `https://${site}`;
      html += `        <li><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(site)}</a></li>\n`;
    });
    html += `      </ul>\n`;
  }

  html += `    </div>
    <div class="right-column">
      <div class="name">${escapeHtml(`${data.profile["First Name"]} ${data.profile["Last Name"]}`)}</div>
      <div class="headline">${escapeHtml(data.profile["Headline"])}</div>
`;

  // Summary
  html += `      <div class="summary-section">
        <div class="section-title">Professional Summary</div>
        ${formatTextWithLineBreaks(data.profile["Summary"] || "")}
      </div>
`;

  // Experience
  if (data.positions.length > 0) {
    html += `      <div class="experience-section">
        <div class="section-header">Professional Experience</div>
`;
    data.positions.forEach((position) => {
      html += `        <div class="position">
          <div>
            <span class="position-title">${escapeHtml(position["Title"])}</span>
            <span class="position-dates">(${escapeHtml(formatDate(position["Started On"]))} - ${escapeHtml(formatDate(position["Finished On"]))})</span>
          </div>
          <div class="position-company">${escapeHtml(position["Company Name"])} | ${escapeHtml(trimLocation(position["Location"], config.locationMap))}</div>
          <div class="position-description">${formatTextWithLineBreaks(position["Description"])}</div>
`;
      if (position.skills && position.skills.length > 0) {
        html += `          <div class="position-skills">Key Skills: ${escapeHtml(position.skills.join(" • "))}</div>\n`;
      }
      html += `        </div>
`;
    });
    html += `      </div>
`;
  }

  // Projects
  if (data.projects.length > 0) {
    html += `      <div class="projects-section">
        <div class="section-header">Notable Projects</div>
`;
    data.projects.forEach((project) => {
      html += `        <div class="project">
          <div>
            <span class="project-title">${escapeHtml(project["Title"])}</span>
            <span class="project-dates">(${escapeHtml(formatDate(project["Started On"]))} - ${escapeHtml(formatDate(project["Finished On"]))})</span>
          </div>
          <div class="project-description">${formatTextWithLineBreaks(project["Description"])}</div>
        </div>
`;
    });
    html += `      </div>
`;
  }

  // Education
  if (data.education.length > 0) {
    html += `      <div class="education-section">
        <div class="section-header">Education</div>
`;
    data.education.forEach((edu) => {
      html += `        <div class="education-entry">
          <div class="education-school">${escapeHtml(edu["School Name"])}</div>
`;
      if (edu["Degree Name"]) {
        html += `          <div class="education-degree-name">${escapeHtml(edu["Degree Name"])}</div>
`;
      }
      html += `          <div class="education-dates">${escapeHtml(formatDate(edu["Start Date"]))} - ${escapeHtml(formatDate(edu["End Date"]))}</div>
`;
      if (edu["Notes"]) {
        html += `          <div class="education-notes">${formatTextWithLineBreaks(edu["Notes"])}</div>
`;
      }
      html += `        </div>
`;
    });
    html += `      </div>
`;
  }

  // Skills
  if (typeof data.skillCategories === 'object' && Object.keys(data.skillCategories).length > 0) {
    html += `      <div class="skills-section">
        <div class="section-header">Technical Skills</div>
`;
    Object.entries(data.skillCategories).forEach(([categoryName, skills]) => {
      html += `        <div class="skill-category">
          <div class="skill-category-name">${escapeHtml(categoryName)}</div>
          <div class="skill-category-skills">${escapeHtml(skills.join(" • "))}</div>
        </div>
`;
    });
    html += `      </div>
`;
  }

  html += `    </div>
  </div>
</body>
</html>`;

  // Write to file
  await fs.promises.writeFile(outputPath, html, 'utf8');
  console.log("HTML generated successfully!");
}

