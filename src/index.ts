import path from "path";
import { loadLinkedInData } from "./utils/csvParser";
import { generateCV } from "./utils/pdfGenerator";

async function main() {
  try {
    console.log("Loading LinkedIn data...");
    const data = await loadLinkedInData();

    console.log("Generating CV...");
    const outputPath = path.join(process.cwd(), "output", "cv.pdf");
    await generateCV(data, outputPath);

    console.log(`CV generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error("Error generating CV:", error);
    process.exit(1);
  }
}

main();
