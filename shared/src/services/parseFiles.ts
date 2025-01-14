import { parseCSV } from "../utils/csvParser";

export function parseFiles(files: Record<string, any>, image?: string) {
    const rawData: Record<string, any> = { image };


    for (const fileName of Object.keys(files)) {
        console.log("Processing file:", fileName);
        const fileData = files[fileName];

        if (!fileData) continue;

        if (fileName.endsWith(".csv")) {
            const baseName = fileName.split("/").pop();
            if (
                baseName &&
                (baseName === "Profile.csv" ||
                    baseName === "Positions.csv" ||
                    baseName === "Projects.csv" ||
                    baseName === "Education.csv" ||
                    baseName === "Email Addresses.csv" ||
                    baseName === "Languages.csv")
            ) {
                rawData[baseName] = parseCSV(fileData);
            }
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".png")
        ) {
            if (!image) {
                rawData.image = fileData;
            }
        }
    }

    console.log("rawData:", JSON.stringify(rawData, null, 2));

    return rawData;
}
