import { generateCV } from "../services/pdf/pdfGenerator";
import type {
  TransformedCVData,
  Position,
  Profile,
  Project,
  Education,
  Language,
} from "../models/types";

declare const JSZip: any;

// Type for CSV row data
type CSVRow = Record<string, string>;

// Type for parsed data structure
type DataKey =
  | "Profile"
  | "Positions"
  | "Projects"
  | "Education"
  | "Languages"
  | "Email";

type ParsedData = {
  [K in DataKey]?: CSVRow[];
} & {
  image?: string;
};

// Function to parse CSV data
function parseCSV(text: string): CSVRow[] {
  console.log("Parsing CSV data");
  const rows = text.split("\n");
  const headers = rows[0].split(",");
  return rows.slice(1).map((row) => {
    const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    return headers.reduce<CSVRow>((obj, header, index) => {
      obj[header.trim()] = values[index]
        ? values[index].replace(/(^"|"$)/g, "").trim()
        : "";
      return obj;
    }, {});
  });
}

// Function to transform CSV data to typed data
function transformData(data: ParsedData): TransformedCVData {
  return {
    profile: (data.Profile?.[0] as Profile) || {
      "First Name": "",
      "Last Name": "",
      Headline: "",
      Summary: "",
      Industry: "",
      "Geo Location": "",
      Websites: "",
    },
    positions: (data.Positions || []).map((pos) => ({
      ...(pos as Position),
      skills: [],
    })),
    projects: (data.Projects || []) as Project[],
    education: (data.Education || []) as Education[],
    email: {
      "Email Address": data.Email?.[0]?.["Email Address"] || "",
    },
    languages: (data.Languages || []) as Language[],
    skillCategories: [],
    image: data.image,
  };
}

// Function to handle file upload and processing
export async function handleFileUploadAndProcess() {
  console.log("Handling file upload");
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  if (!fileInput?.files?.[0]) {
    console.error("No file selected");
    return;
  }

  const zip = new JSZip();
  const zipContent = await zip.loadAsync(fileInput.files[0]);
  const data: ParsedData = {};

  for (const fileName of Object.keys(zipContent.files)) {
    console.log("Processing file:", fileName);
    if (fileName.endsWith(".csv")) {
      const fileData = await zipContent.files[fileName].async("text");
      const baseName = fileName.split("/").pop()?.replace(".csv", "") || "";
      if (baseName && Object.keys(data).includes(baseName)) {
        (data as any)[baseName] = parseCSV(fileData);
      }
    } else if (fileName.endsWith(".jpg") || fileName.endsWith(".png")) {
      const imageData = await zipContent.files[fileName].async("base64");
      data.image = `data:image/jpeg;base64,${imageData}`;
    }
  }

  console.log("Data processed:", data);
  const transformedData = transformData(data);
  await generateCV(transformedData);
}
