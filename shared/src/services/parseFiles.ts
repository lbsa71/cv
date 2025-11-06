import { parseCSV } from "../utils/csvParser";

export function parseFiles(files: Record<string, any>, image?: string) {
    console.log("\n=== parseFiles: Starting file processing ===");
    console.log("Total files received:", Object.keys(files).length);
    console.log("File names:", Object.keys(files));
    
    const rawData: Record<string, any> = { image };

    for (const fileName of Object.keys(files)) {
        console.log(`\nProcessing file: ${fileName}`);
        const fileData = files[fileName];

        if (!fileData) {
            console.log(`  ⚠️  File data is empty or undefined`);
            continue;
        }

        console.log(`  File size: ${fileData.length} characters`);

        if (fileName.endsWith(".csv")) {
            const baseName = fileName.split("/").pop();
            console.log(`  Base name: ${baseName}`);
            
            if (
                baseName &&
                (baseName === "Profile.csv" ||
                    baseName === "Positions.csv" ||
                    baseName === "Projects.csv" ||
                    baseName === "Education.csv" ||
                    baseName === "Email Addresses.csv" ||
                    baseName === "Languages.csv")
            ) {
                console.log(`  ✓ Recognized CSV file: ${baseName}`);
                try {
                    const parsedData = parseCSV(fileData);
                    rawData[baseName] = parsedData;
                    console.log(`  ✓ Parsed ${parsedData.length} rows from ${baseName}`);
                    if (parsedData.length > 0) {
                        console.log(`  First row keys:`, Object.keys(parsedData[0]));
                    }
                } catch (error) {
                    console.error(`  ✗ Error parsing ${baseName}:`, error);
                }
            } else {
                console.log(`  ⚠️  CSV file not recognized (expected: Profile.csv, Positions.csv, etc.)`);
            }
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".png")) {
            console.log(`  ✓ Image file detected`);
            if (!image) {
                rawData.image = fileData;
                console.log(`  ✓ Image data stored`);
            } else {
                console.log(`  ⚠️  Image already provided, skipping`);
            }
        } else {
            console.log(`  ⚠️  Unknown file type: ${fileName}`);
        }
    }

    console.log("\n=== parseFiles: Completed ===");
    console.log("Raw data keys:", Object.keys(rawData));
    return rawData;
}
