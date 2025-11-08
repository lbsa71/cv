import path from "path";
import fs from "fs";
import { promisify } from "util";
import { Config, defaultConfig, parseFiles, transformData } from "@cv/shared";
import unzipper from "unzipper";
import { generateCV } from "./services/pdf/pdfGenerator";
import { generateHTML } from "./services/html/htmlGenerator";

async function main() {
  try {
    console.log("Loading and transforming data...");
    const args = process.argv.slice(2);
    const configFileName = args.find(arg => arg.endsWith('.json'));
    const zipFileName = args.find(arg => arg.endsWith('.zip'));
    const imageFileName = args.find(arg => /\.(jpg|jpeg|png)$/.test(arg));
    const privatize = args.includes('--privatize') || args.includes('-p');
    
    if (privatize) {
      console.log("\n⚠️  Privatize enabled: scrubbing email and phone from output");
    }

    let config: Config;

    if (configFileName) {
      console.log("Loading configuration from JSON file...");
      const configFileContent = await promisify(fs.readFile)(configFileName, 'utf8');
      config = { ...defaultConfig, ...JSON.parse(configFileContent) };
    }
    else
      config = defaultConfig;

    const files: Record<string, string> = {};

    let zipFileToUse: string | null = zipFileName || null;

    // If no zip specified on CLI, scan exports folder
    if (!zipFileToUse) {
      const exportsDir = path.join(process.cwd(), "exports");
      if (fs.existsSync(exportsDir)) {
        console.log(`\n=== Scanning exports folder: ${exportsDir} ===`);
        const filesInExports = await promisify(fs.readdir)(exportsDir);
        const zipFiles = filesInExports.filter(file => file.endsWith('.zip'));
        
        if (zipFiles.length > 0) {
          // Use the most recently modified zip file
          const zipFilesWithStats = await Promise.all(
            zipFiles.map(async (file) => {
              const filePath = path.join(exportsDir, file);
              const stats = await promisify(fs.stat)(filePath);
              return { file, filePath, mtime: stats.mtime };
            })
          );
          
          zipFilesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
          zipFileToUse = zipFilesWithStats[0].filePath;
          console.log(`Found ${zipFiles.length} ZIP file(s) in exports folder`);
          console.log(`Using most recent: ${zipFilesWithStats[0].file}`);
        } else {
          // No ZIP files found, check for individual CSV files
          console.log("No ZIP files found, checking for individual CSV files...");
          const csvFiles = filesInExports.filter(file => file.endsWith('.csv'));
          
          if (csvFiles.length > 0) {
            console.log(`Found ${csvFiles.length} CSV file(s) in exports folder`);
            // Read CSV files directly
            for (const csvFile of csvFiles) {
              const filePath = path.join(exportsDir, csvFile);
              const content = await promisify(fs.readFile)(filePath, 'utf8');
              files[csvFile] = content;
              console.log(`Loaded: ${csvFile} (${content.length} characters)`);
            }
            console.log(`\nTotal CSV files loaded: ${Object.keys(files).length}`);
          } else {
            console.log("⚠️  No ZIP or CSV files found in exports folder");
          }
        }
      } else {
        console.log("⚠️  Exports folder does not exist");
      }
    }

    if (zipFileToUse) {
      console.log(`\n=== Extracting ZIP file: ${zipFileToUse} ===`);
      await fs.createReadStream(zipFileToUse)
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
    } else if (Object.keys(files).length === 0) {
      console.log("⚠️  No ZIP file provided and no CSV files found in exports folder");
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
    const pdfOutputPath = path.join(process.cwd(), "output", "cv.pdf");
    await generateCV(transformedData, config, pdfOutputPath, privatize);

    console.log("\nGenerating HTML...");
    const htmlOutputPath = path.join(process.cwd(), "output", "cv.html");
    await generateHTML(transformedData, config, htmlOutputPath, privatize);

    console.log("\nCV generated successfully!");
    console.log("PDF output path:", pdfOutputPath);
    console.log("HTML output path:", htmlOutputPath);
  } catch (error) {
    console.error("Error generating CV:", error);
    process.exit(1);
  }
}

main();
