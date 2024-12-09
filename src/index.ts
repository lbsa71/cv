import path from "path";
import { loadAndTransformData } from "./services/data/transformationService";
import { generateCV } from "./services/pdf/pdfGenerator";

async function main() {
  try {
    console.log("Loading and transforming data...");
    const data = await loadAndTransformData();

    console.log("Generating PDF...");
    const outputPath = path.join(process.cwd(), "output", "cv.pdf");
    await generateCV(data, outputPath);

    console.log("CV generated successfully!");
    console.log("Output path:", outputPath);
  } catch (error) {
    console.error("Error generating CV:", error);
    process.exit(1);
  }
}

main();
