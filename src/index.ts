import path from "path";
import fs from "fs";
import { promisify } from "util";
import { parse } from "json5";
import unzipper from "unzipper";
import sharp from "sharp";
import { loadAndTransformData } from "./services/data/transformationService";
import { Config } from "./types";
import { generateCV } from "./services/pdf/pdfGenerator";

async function main() {
  try {
    console.log("Loading and transforming data...");
    const args = process.argv.slice(2);
    const configFileName = args.find(arg => arg.endsWith('.json'));
    const zipFileName = args.find(arg => arg.endsWith('.zip'));
    const imageFileName = args.find(arg => /\.(jpg|jpeg|png)$/.test(arg));

    let config: Config | undefined;

    if (configFileName) {
      console.log("Loading configuration from JSON file...");
      const configFileContent = await promisify(fs.readFile)(configFileName, 'utf8');
      config = parse(configFileContent);
    }

    if (zipFileName) {
      console.log("Extracting ZIP file...");
      await fs.createReadStream(zipFileName)
        .pipe(unzipper.Extract({ path: 'extracted' }))
        .promise();
    }

    if (imageFileName) {
      console.log("Processing image file...");

    }
    const data = await loadAndTransformData(config);

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
