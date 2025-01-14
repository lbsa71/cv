import path from "path";
import fs from "fs";
import { promisify } from "util";
import { parse } from "json5";
import { Config, defaultConfig, parseFiles, transformData } from "@cv/shared";
import { generateCV } from "./services/pdf/pdfGenerator";

async function main() {
  try {
    console.log("Loading and transforming data...");
    const args = process.argv.slice(2);
    const configFileName = args.find(arg => arg.endsWith('.json'));
    const zipFileName = args.find(arg => arg.endsWith('.zip'));
    const imageFileName = args.find(arg => /\.(jpg|jpeg|png)$/.test(arg));

    let config: Config;

    if (configFileName) {
      console.log("Loading configuration from JSON file...");
      const configFileContent = await promisify(fs.readFile)(configFileName, 'utf8');
      config = { ...defaultConfig, ...parse(configFileContent) };
    }
    else
      config = defaultConfig;

    if (zipFileName) {
      console.log("Extracting ZIP file...");
      await fs.createReadStream(zipFileName)
        // TODO: hm, what import is missing?
        .pipe(unzipper.Extract({ path: 'extracted' }))
        .promise();

      // TODO: The file contents should populate a 'files' object with filename as key and file content as value
    }

    if (imageFileName) {
      console.log("Processing image file...");

    }

    // TODO: Load imageData from imageFileName as data:image/jpg;base64 

    const rawData = await parseFiles(files, imageData);
    const transformedData = transformData(rawData, config);

    console.log("Generating PDF...");
    const outputPath = path.join(process.cwd(), "output", "cv.pdf");
    await generateCV(transformedData, outputPath);

    console.log("CV generated successfully!");
    console.log("Output path:", outputPath);
  } catch (error) {
    console.error("Error generating CV:", error);
    process.exit(1);
  }
}

main();
