import { parseCSV } from "../utils/csvParser";

export function parseFiles(files: Record<string, any>, imageFile?: File) {
    const rawData: Record<string, any> = {};

    for (const fileName of Object.keys(files)) {
        console.log("Processing file:", fileName);
        const file = files[fileName];
        if (!file) continue;

        if (fileName.endsWith(".csv")) {
            const fileData = file.async("text");
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
        } else if (
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".png")
        ) {
            // Skip image files in ZIP if we have a separate image upload
            if (!imageFile) {
                const imageData = file.async("base64");
                rawData.image = `data:image/jpeg;base64,${imageData}`;
            }
        }
    }

    return rawData;
}
