export function parseCSV<T extends object = any>(
  text: string,
  filename?: string
): T[] {
  try {
    console.log("text", text);

    // Parse CSV properly handling multi-line quoted fields
    const rows: string[] = [];
    let currentRow = "";
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes
          currentRow += '"';
          i += 2;
        } else {
          // Toggle quotes mode
          inQuotes = !inQuotes;
          currentRow += char;
          i++;
        }
      } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
        // End of row (only if not in quotes)
        if (currentRow.trim()) {
          rows.push(currentRow);
        }
        currentRow = "";
        if (char === '\r' && nextChar === '\n') {
          i += 2; // Skip \r\n
        } else {
          i++; // Skip \n
        }
      } else {
        currentRow += char;
        i++;
      }
    }

    // Add the last row if it exists
    if (currentRow.trim()) {
      rows.push(currentRow);
    }

    if (rows.length < 2) {
      throw new Error(
        `CSV file ${filename || ""} is empty or has no data rows`
      );
    }

    const parseRow = (row: string): T => {
      const values: string[] = [];
      let currentValue = "";
      let inQuotes = false;
      let i = 0;

      while (i < row.length) {
        const char = row[i];

        if (char === '"') {
          if (inQuotes && row[i + 1] === '"') {
            // Handle escaped quotes
            currentValue += '"';
            i += 2;
          } else {
            // Toggle quotes mode
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === "," && !inQuotes) {
          // End of field
          values.push(currentValue.trim());
          currentValue = "";
          i++;
        } else {
          currentValue += char;
          i++;
        }
      }

      // Add the last field
      values.push(currentValue.trim());

      if (values.length !== headers.length) {
        throw new Error(
          `CSV row has ${values.length} values but expected ${
            headers.length
          } (headers: ${headers.join(", ")})`
        );
      }

      // Create object from headers and values
      return headers.reduce((obj, header, index) => {
        obj[header as keyof T] = values[index] as any;
        return obj;
      }, {} as T);
    };

    // Extract header names from first row
    const headerRow = rows[0];
    const headers: string[] = [];
    let headerValue = "";
    let headerInQuotes = false;
    let headerIndex = 0;

    while (headerIndex < headerRow.length) {
      const char = headerRow[headerIndex];
      if (char === '"') {
        if (headerInQuotes && headerRow[headerIndex + 1] === '"') {
          headerValue += '"';
          headerIndex += 2;
        } else {
          headerInQuotes = !headerInQuotes;
          headerIndex++;
        }
      } else if (char === "," && !headerInQuotes) {
        headers.push(headerValue.trim());
        headerValue = "";
        headerIndex++;
      } else {
        headerValue += char;
        headerIndex++;
      }
    }
    headers.push(headerValue.trim());

    if (headers.length === 0) {
      throw new Error(`CSV file ${filename || ""} has no headers`);
    }

    console.log("rows", rows.length);

    return rows
      .slice(1)
      .filter((row) => row.trim())
      .map((row, index) => {
        try {
          return parseRow(row);
        } catch (error) {
          throw new Error(
            `Error parsing row ${index + 2} in ${filename || "CSV"}: ${
              (error as Error).message
            }`
          );
        }
      });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `CSV parsing error${filename ? ` for ${filename}` : ""}: ${
          error.message
        }`
      );
    }
    throw error;
  }
}

export function validateCSVData<T extends object>(
  data: T[],
  requiredFields: (keyof T)[],
  filename?: string
): void {
  if (!Array.isArray(data)) {
    throw new Error(
      `Invalid CSV data for ${filename || "file"}: expected array`
    );
  }

  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!(field in row)) {
        throw new Error(
          `Missing required field "${String(field)}" in row ${index + 1} of ${
            filename || "CSV"
          }`
        );
      }
    });
  });
}
