import path from "path";
import fs from "fs";
import { promisify } from "util";
import { Config, defaultConfig, parseFiles, transformData } from "@cv/shared";
import unzipper from "unzipper";
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
      config = { ...defaultConfig, ...JSON.parse(configFileContent) };
    }
    else
      config = defaultConfig;

    const files: Record<string, string> = {};

    if (zipFileName) {
      console.log(`\n=== Extracting ZIP file: ${zipFileName} ===`);
      await fs.createReadStream(zipFileName)
        .pipe(unzipper.Parse())
        .on('entry', async function (entry) {
          const fileName = entry.path;
          const content = await entry.buffer();
          const contentStr = content.toString('utf8');
          console.log(`Found file in ZIP: ${fileName} (${contentStr.length} characters)`);
          files[fileName] = contentStr;
        })
        .promise();
      console.log(`\nTotal files extracted from ZIP: ${Object.keys(files).length}`);
    } else {
      console.log("⚠️  No ZIP file provided");
    }

    let imageData = '';
    if (imageFileName) {
      console.log("Processing image file...");
      const imageBuffer = await promisify(fs.readFile)(imageFileName);
      imageData = `data:image/jpg;base64,${imageBuffer.toString('base64')}`;
    }

    const rawData = await parseFiles(files, imageData);
    console.log("\n=== Raw data summary ===");
    console.log("Raw data keys:", Object.keys(rawData));
    
    const transformedData = transformData(rawData, config);
    console.log("\n=== Transformed data summary ===");
    console.log("Transformed data structure:", {
      hasProfile: !!transformedData.profile,
      positionsCount: transformedData.positions?.length ?? 0,
      projectsCount: transformedData.projects?.length ?? 0,
      educationCount: transformedData.education?.length ?? 0,
      hasEmail: !!transformedData.email,
      languagesCount: transformedData.languages?.length ?? 0,
    });

    console.log("\nGenerating PDF...");
    const outputPath = path.join(process.cwd(), "output", "cv.pdf");
    await generateCV(transformedData, config, outputPath);

    console.log("CV generated successfully!");
    console.log("Output path:", outputPath);
  } catch (error) {
    console.error("Error generating CV:", error);
    process.exit(1);
  }
}

main();
