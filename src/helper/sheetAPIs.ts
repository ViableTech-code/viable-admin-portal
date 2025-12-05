// helpers/googleSheets.ts
export interface SheetData {
  sheetName: string;
  values: string[][];
}

export async function getGoogleSheetData(
  sheetId: string
): Promise<SheetData[]> {
  const sData = await localStorage.getItem("sheetData");
  if (sData) {
    return JSON.parse(sData) as SheetData[];
  }
  const spreadsheetId = sheetId;
  if (!spreadsheetId) throw new Error("No spreadsheet ID found in session");
  // const accessToken = sessionStorage.getItem("accessToken");
  // if (!accessToken) throw new Error("No access token found in session");
  const sheetApiKey = import.meta.env.VITE_SHEET_API_KEY;

  if (!sheetApiKey) throw new Error("No api key found");
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

  // 1. Get metadata about the spreadsheet (to list sheets)
  const metaRes = await fetch(
    `${baseUrl}?fields=sheets.properties&key=${sheetApiKey}`,
    {}
  );

  if (!metaRes.ok) {
    throw new Error(
      `Failed to fetch spreadsheet metadata: ${metaRes.statusText}`
    );
  }

  const metaData = await metaRes.json();
  const sheets: string[] = metaData.sheets.map(
    (s: any) => s.properties.title as string
  );

  // 2. Fetch data for each sheet
  const data: SheetData[] = await Promise.all(
    sheets.map(async (sheetName) => {
      const res = await fetch(
        `${baseUrl}/values/${encodeURIComponent(sheetName)}?key=${sheetApiKey}`,
        {}
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch data for sheet ${sheetName}: ${res.statusText}`
        );
      }

      const json = await res.json();

      return {
        sheetName,
        values: json.values || [],
      };
    })
  );

  localStorage.setItem("sheetData", JSON.stringify(data));
  return data;
}
