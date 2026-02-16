/**
 * Google Sheets API Client
 * Reads data from publicly shared Google Sheets
 */

interface GoogleSheetsRow {
  [key: string]: string;
}

export async function readGoogleSheet(
  sheetId: string,
  sheetName: string = "Products",
): Promise<GoogleSheetsRow[]> {
  if (!sheetId) {
    throw new Error("Sheet ID is required");
  }

  // Google Sheets CSV export URL
  const gid = await getSheetGid(sheetName);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google Sheet: ${response.status} ${response.statusText}`,
    );
  }

  const csv = await response.text();
  return parseCSV(csv);
}

async function getSheetGid(sheetName: string): Promise<string> {
  // Default to 0 (first sheet) - in production, parse the actual sheet name
  // For now, assuming the sheet name is the first one or provide gid manually
  const normalized = sheetName.trim();
  return normalized ? "0" : "0";
}

function parseCSV(csv: string): GoogleSheetsRow[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: GoogleSheetsRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: GoogleSheetsRow = {};

    headers.forEach((header, index) => {
      row[header.toLowerCase().replace(/\s+/g, "_")] = values[index] || "";
    });

    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
