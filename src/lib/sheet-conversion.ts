import { SheetData } from "../helper/sheetAPIs";

export enum Currency {
  INR = "INR",
  USD = "USD",
}

export interface MonthData {
  titles: string;
  INR: number;
  USD: number;
  percentage?: string;
  growthPercentage?: string;
}

export interface NamedMonthlyData {
  name: string;
  months: MonthData[];
}

export interface RevenueExpensesChart {
  billedRevenue?: MonthData[];
  billedDirectExpenses?: MonthData[];
  billedGrossProfit?: MonthData[];
  billedCashflow?: MonthData[];
  bankRevenue?: MonthData[];
  bankDirectExpenses?: MonthData[];
  bankGrossProfit?: MonthData[];
  bankCashflow?: MonthData[];
}

export interface BillingViewProfit {
  revenueExpensesChart: RevenueExpensesChart;
  allRows?: { [key: string]: MonthData[] };
  clientWiseProfitability: {
    name: string;
    revenue: MonthData[];
    projectExpenses: MonthData[];
    margin: MonthData[];
    marginPercentage: MonthData[];
  }[];
}

export interface BilledRevenue {
  monthlyRevenueChart: MonthData[];
  clientsByRevenue: NamedMonthlyData[];
  revenueType: NamedMonthlyData[];
  outStandingBalances: NamedMonthlyData[];
}

export interface BilledExpenses {
  monthlyExpensesChart: MonthData[];
  expensesCategories: NamedMonthlyData[];
}

export interface BillingView {
  billedRevenue: BilledRevenue;
  billedExpenses: BilledExpenses;
  billingViewProfit: BillingViewProfit;
}

export interface BankRevenue {
  monthlyRevenue: MonthData[];
  topClientByRevenue: NamedMonthlyData[];
  revenueType: NamedMonthlyData[];
}

export interface BankExpenses {
  monthlyExpensesChart: MonthData[];
  expensesCategories: NamedMonthlyData[];
}

export interface Cashflow {
  revenueExpensesChart: RevenueExpensesChart;
  allRows?: { [key: string]: MonthData[] };
  clientWiseProfitability: BillingViewProfit["clientWiseProfitability"];
}

export interface Liquidity extends NamedMonthlyData {}

export interface BankView {
  bankRevenue: BankRevenue;
  bankExpenses: BankExpenses;
  cashflow: Cashflow;
  liquidity: Liquidity[];
}

export interface SummaryItem {
  name: string;
  key?: string;
  months: MonthData[];
}

export interface FormattedModel {
  summary: SummaryItem[];
  billingView: BillingView;
  bankView: BankView;
}

const monthHeaders = [
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
];
export function parseCurrencyValue(value: string): number {
  if (!value || value === "N/A" || value === "Reflect Latest Month") return 0;
  const clean = value.replace(/[,₹$%]/g, "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function extractMonths(headers: string[]): string[] {
  return headers
    .filter(
      (h) =>
        h &&
        !h.includes("Currency") &&
        monthHeaders.includes(h.trim().toLowerCase())
    )
    .map((h) => h.trim().replace(/\d{4}/g, "").trim().toLowerCase());
}

export function createMonthData(
  titles: string,
  INR: string,
  USD: string,
  percentage?: string,
  growthPercentage?: string
): MonthData {
  return {
    titles,
    INR: parseCurrencyValue(INR),
    USD: parseCurrencyValue(USD),
    percentage,
    growthPercentage,
  };
}

const summaryRowNames = [
  "Billed Revenue",
  "Billed Expenses",
  "Billed Profit",
  "Billed Cashflow",
  "Bank Revenue",
  "Bank Expenses",
  "Bank Cashflow",
  "Bank Profit",
  "Liquidity",
  "",
];

const getRowByName = (sheet: string[][], name: string): string[] | undefined =>
  sheet.find((r: string[]) => r[0]?.toLowerCase() === name.toLowerCase());

// Helper function to create a map of sheets by name
function createSheetMap(rawSheets: SheetData[]): Map<string, string[][]> {
  const byName = new Map<string, string[][]>();
  for (const sheet of rawSheets) {
    byName.set(sheet.sheetName, sheet.values || []);
  }
  return byName;
}

// Helper function to build month data from a row
function buildMonthData(
  row: string[] | undefined,
  months: string[],
  rowPercentage?: string[],
  growthPercentage?: string[]
): MonthData[] {
  if (!row) return [];

  return ["total", ...months].map((title, i) => {
    const offset = i * 2 + 1;
    return createMonthData(
      title,
      row[offset] || "0",
      row[offset + 1] || "0",
      rowPercentage ? rowPercentage[i + 1] : undefined,
      growthPercentage && growthPercentage.length
        ? growthPercentage[offset]
        : undefined
    );
  });
}

// Helper function to parse named monthly data from a sheet section
function parseNamedMonthlyData(
  sheet: string[][],
  startIndex: number,
  months: string[],
  breakCondition?: (row: string[]) => boolean
): { data: NamedMonthlyData[]; nextIndex: number } {
  const data: NamedMonthlyData[] = [];
  let currentIndex = startIndex;

  for (let r = startIndex; r < sheet.length; r++) {
    const row = sheet[r];

    if (!row || !row.length) {
      currentIndex++;
      continue;
    }

    if (breakCondition && breakCondition(row)) {
      break;
    }

    data.push({
      name: row[0],
      months: ["total", ...months].map((title, j) => {
        const offset = j * 2 + 1;
        return createMonthData(
          title,
          row[offset] || "0",
          row[offset + 1] || "0"
        );
      }),
    });
    currentIndex++;
  }

  return { data, nextIndex: currentIndex };
}

// Parse summary data
function parseSummaryData(
  summarySheet: string[][],
  months: string[]
): SummaryItem[] {
  const midIndex = summarySheet.findIndex(
    (r) => r[0]?.toLowerCase() === "Summary View (%)".toLowerCase()
  );

  const valueSummary = midIndex > 0 ? summarySheet.slice(0, midIndex) : [];
  const percentageSummary =
    midIndex > 0 ? summarySheet.slice(midIndex + 1) : [];

  const getValueSummaryRowByName = (name: string): string[] | undefined =>
    valueSummary.find(
      (r: string[]) => r[0]?.toLowerCase() === name.toLowerCase()
    );

  const getPercentageSummaryRowByName = (name: string): string[] | undefined =>
    percentageSummary.find(
      (r: string[]) => r[0]?.toLowerCase() === name.toLowerCase()
    );

  return summaryRowNames.map((name) => {
    const rowValue = getValueSummaryRowByName(name);
    if (!rowValue) {
      return {
        name: name.replace(" ", "").toLowerCase(),
        key: name,
        months: [],
      };
    }

    const rowPercentage = getPercentageSummaryRowByName(name);
    let growthRawPercentage = [];

    if (name == "Billed Profit") {
      growthRawPercentage = [...getValueSummaryRowByName("Billed Profit %")];
    }
    if (name == "Bank Profit") {
      growthRawPercentage = [...getValueSummaryRowByName("Bank Profit %")];
    }
    return {
      name: name.replace(" ", "").toLowerCase(),
      key: name,
      months: buildMonthData(
        rowValue,
        months,
        rowPercentage,
        growthRawPercentage
      ),
    };
  });
}

// Parse billing revenue data
function parseBillingRevenue(
  byName: Map<string, string[][]>,
  months: string[]
): BilledRevenue {
  const sheet = byName.get("Billing View_Billed Revenue") || [];

  // Find the start of "Top Clients by Revenue" section
  const topClientsIndex = sheet.findIndex(
    (r) =>
      r[0]?.toLowerCase() ===
      "Top Clients by Revenue (Table + Pie Chart)".toLowerCase()
  );

  const clientRevenueSheet =
    topClientsIndex > 0 ? sheet.slice(topClientsIndex + 1) : sheet;

  // Parse top clients by revenue
  const { data: clientsByRevenue, nextIndex: clientsNextIndex } =
    parseNamedMonthlyData(
      clientRevenueSheet,
      0,
      months,
      (row) => row[0].toLowerCase() === "Revenue Type (Table)".toLowerCase()
    );
  // Parse revenue type
  const { data: revenueType, nextIndex: revenueNextIndex } =
    parseNamedMonthlyData(
      clientRevenueSheet,
      clientsNextIndex + 1,
      months,
      (row) =>
        row[0].toLowerCase() ===
        "Outstanding Balances (Table + Horizontal Chart)".toLowerCase()
    );

  // Parse outstanding balances
  const { data: outStandingBalances } = parseNamedMonthlyData(
    clientRevenueSheet,
    revenueNextIndex + 1,
    months
  );

  return {
    monthlyRevenueChart: buildMonthData(
      getRowByName(sheet, "Monthly Revenue (Chart)"),
      months
    ),
    clientsByRevenue,
    revenueType,
    outStandingBalances,
  };
}

// Parse billing expenses data
function parseBillingExpenses(
  byName: Map<string, string[][]>,
  months: string[]
): BilledExpenses {
  const sheet = byName.get("Billing View_Billed Expenses") || [];

  const expenseCategoriesIndex = sheet.findIndex(
    (r) => r[0]?.toLowerCase() === "Expense Categories (Table)".toLowerCase()
  );

  const expenseCategoriesSheet =
    expenseCategoriesIndex > 0
      ? sheet.slice(expenseCategoriesIndex + 1)
      : sheet;

  const { data: expensesCategories } = parseNamedMonthlyData(
    expenseCategoriesSheet,
    0,
    months
  );

  return {
    monthlyExpensesChart: buildMonthData(
      getRowByName(sheet, "Monthly Expenses (Chart)"),
      months
    ),
    expensesCategories,
  };
}

// Parse billing profit data
function parseBillingProfit(
  byName: Map<string, string[][]>,
  months: string[]
): BillingViewProfit {
  const profitSheet1 = byName.get("Billing View_Profit (1.1)") || [];
  const profitSheet2 = byName.get("Billing View_Profit (1.2)") || [];
  // Parse revenue expenses chart from profit sheet 1
  const revenueExpensesChart: RevenueExpensesChart = {
    billedRevenue: buildMonthData(
      getRowByName(profitSheet1, "Billed Revenue"),
      months
    ),
    billedDirectExpenses: buildMonthData(
      getRowByName(profitSheet1, "Billed Expenses"),
      months
    ),
    billedGrossProfit: buildMonthData(
      getRowByName(profitSheet1, "Billed Profit"),
      months
    ),
    billedCashflow: buildMonthData(
      getRowByName(profitSheet1, "Billed Cashflow"),
      months
    ),
  };

  // Collect all rows we care about from profitSheet1
  const profitSheet1RowNames = [
    "Billed Revenue",
    "Billed Direct Expenses",
    "Billed Gross Profit",
    "Billed Gross Profit %",
    "Billed Indirect Expenses",
    "Billed Profit",
    "Billed Profit %",
    "Assets",
    "Liabilities",
    "Equity",
    "Taxes & Compliances",
    "Billed Cashflow",
    "Billed Cashflow %",
    "Billed Expenses",
  ];

  const allRows: { [key: string]: MonthData[] } = {};
  for (const name of profitSheet1RowNames) {
    const row = getRowByName(profitSheet1, name);
    allRows[name] = buildMonthData(row, months);
  }
  const financialChart: RevenueExpensesChart = {
    billedRevenue: buildMonthData(
      getRowByName(profitSheet1, "Billed Revenue"),
      months
    ),
    billedDirectExpenses: buildMonthData(
      getRowByName(profitSheet1, "Billed Expenses"),
      months
    ),
    billedGrossProfit: buildMonthData(
      getRowByName(profitSheet1, "Billed Profit"),
      months
    ),
    billedCashflow: buildMonthData(
      getRowByName(profitSheet1, "Billed Cashflow"),
      months
    ),
  };

  // Parse client wise profitability from profit sheet 2
  const clientWiseProfitability = parseClientWiseProfitability(
    profitSheet2,
    months
  );

  return {
    revenueExpensesChart,
    allRows,
    clientWiseProfitability,
  };
}

// Parse client wise profitability data
function parseClientWiseProfitability(
  sheet: string[][],
  months: string[]
): BillingViewProfit["clientWiseProfitability"] {
  const clientWiseData: BillingViewProfit["clientWiseProfitability"] = [];

  // Find the start of client data (skip headers)
  let startIndex = 0;
  for (let i = 0; i < sheet.length; i++) {
    if (sheet[i][0]?.toLowerCase().includes("Type (INR)".toLowerCase())) {
      startIndex = i + 1;
      break;
    }
  }

  // Parse each client's data
  for (let i = startIndex; i < sheet.length; i++) {
    const row = sheet[i];
    if (!row || !row[0]) continue;

    // Skip empty rows or section headers
    if (!row[0].trim() || row[0].toLowerCase().includes("totals")) continue;

    // Each client row has the pattern: [ClientName, Revenue1, ProjectExpenses1, Margin1, Margin%1, Revenue2, ProjectExpenses2, Margin2, Margin%2, ...]
    // We need to extract data for each month (including total)
    const clientName = row[0];
    const revenueData: MonthData[] = [];
    const projectExpensesData: MonthData[] = [];
    const marginData: MonthData[] = [];
    const marginPercentageData: MonthData[] = [];

    // Process each month (total + months)
    const monthTitles = ["total", ...months];

    for (let monthIndex = 0; monthIndex < monthTitles.length; monthIndex++) {
      const dataStartIndex = 1 + monthIndex * 8; // Each month has 8 columns: INR Revenue, INR ProjectExpenses, INR Margin, INR Margin%, USD Revenue, USD ProjectExpenses, USD Margin, USD Margin%

      // Revenue data
      const revenueINR = row[dataStartIndex] || "0";
      const revenueUSD = row[dataStartIndex + 4] || "0";

      // Project Expenses data
      const projectExpensesINR = row[dataStartIndex + 1] || "0";
      const projectExpensesUSD = row[dataStartIndex + 5] || "0";

      // Margin data
      const marginINR = row[dataStartIndex + 2] || "0";
      const marginUSD = row[dataStartIndex + 6] || "0";

      // Margin Percentage data
      const marginPercentageINR = row[dataStartIndex + 3] || "0";
      const marginPercentageUSD = row[dataStartIndex + 7] || "0";

      revenueData.push(
        createMonthData(monthTitles[monthIndex], revenueINR, revenueUSD)
      );
      projectExpensesData.push(
        createMonthData(
          monthTitles[monthIndex],
          projectExpensesINR,
          projectExpensesUSD
        )
      );
      marginData.push(
        createMonthData(monthTitles[monthIndex], marginINR, marginUSD)
      );
      marginPercentageData.push(
        createMonthData(
          monthTitles[monthIndex],
          marginPercentageINR,
          marginPercentageUSD,
          marginPercentageINR
        )
      );
    }

    clientWiseData.push({
      name: clientName,
      revenue: revenueData,
      projectExpenses: projectExpensesData,
      margin: marginData,
      marginPercentage: marginPercentageData,
    });
  }

  return clientWiseData;
}

// Parse bank revenue data
function parseBankRevenue(
  byName: Map<string, string[][]>,
  months: string[]
): BankRevenue {
  const sheet = byName.get("Bank View_Bank Revenue") || [];

  // Parse top clients by revenue
  const topClientsIndex = sheet.findIndex(
    (r) =>
      r[0]?.toLowerCase() ===
      "Top Clients by Revenue (Table + Pie Chart)".toLowerCase()
  );

  const clientRevenueSheet =
    topClientsIndex > 0 ? sheet.slice(topClientsIndex + 1) : sheet;

  const { data: topClientByRevenue, nextIndex: clientsNextIndex } =
    parseNamedMonthlyData(
      clientRevenueSheet,
      0,
      months,
      (row) => row[0].toLowerCase() === "Revenue Type (Table)".toLowerCase()
    );

  // Parse revenue type
  const { data: revenueType } = parseNamedMonthlyData(
    clientRevenueSheet,
    clientsNextIndex + 1,
    months
  );

  return {
    monthlyRevenue: buildMonthData(
      getRowByName(sheet, "Monthly Revenue (Chart)"),
      months
    ),
    topClientByRevenue,
    revenueType,
  };
}

// Parse bank expenses data
function parseBankExpenses(
  byName: Map<string, string[][]>,
  months: string[]
): BankExpenses {
  const sheet = byName.get("Bank View_Bank Expenses") || [];

  const expenseCategoriesIndex = sheet.findIndex(
    (r) => r[0]?.toLowerCase() === "Expense Categories (Table)".toLowerCase()
  );

  const expenseCategoriesSheet =
    expenseCategoriesIndex > 0
      ? sheet.slice(expenseCategoriesIndex + 1)
      : sheet;

  const { data: expensesCategories } = parseNamedMonthlyData(
    expenseCategoriesSheet,
    0,
    months
  );

  return {
    monthlyExpensesChart: buildMonthData(
      getRowByName(sheet, "Monthly Expenses (Chart)"),
      months
    ),
    expensesCategories,
  };
}

// Parse cashflow data
function parseCashflow(
  byName: Map<string, string[][]>,
  months: string[]
): Cashflow {
  const profitSheet1 = byName.get("Bank View_Bank Profit (1.1)") || [];
  const profitSheet2 = byName.get("Bank View_Bank Profit (1.2)") || [];
  const revenueExpensesChart: RevenueExpensesChart = {
    bankRevenue: buildMonthData(
      getRowByName(profitSheet1, "Bank Revenue"),
      months
    ),
    bankDirectExpenses: buildMonthData(
      getRowByName(profitSheet1, "Bank Expenses"),
      months
    ),
    bankGrossProfit: buildMonthData(
      getRowByName(profitSheet1, "Bank Profit"),
      months
    ),
    bankCashflow: buildMonthData(
      getRowByName(profitSheet1, "Bank Cashflow"),
      months
    ),
  };

  const profitSheet1RowNames = [
    "Bank Revenue",
    "Bank Direct Expenses",
    "Bank Gross Profit",
    "Bank Gross Profit %",
    "Bank Indirect Expenses",
    "Bank Profit",
    "Bank Profit %",
    "Assets",
    "Liabilities",
    "Equity",
    "Taxes & Compliances",
    "Bank Cashflow",
    "Bank Cashflow %",
    "Bank Expenses",
  ];
  const allRows: { [key: string]: MonthData[] } = {};
  for (const name of profitSheet1RowNames) {
    const row = getRowByName(profitSheet1, name);
    allRows[name] = buildMonthData(row, months);
  }

  const clientWiseProfitability = parseClientWiseProfitability(
    profitSheet2,
    months
  );

  return {
    revenueExpensesChart,
    allRows,
    clientWiseProfitability,
  };
}

// Parse liquidity data
function parseLiquidity(
  byName: Map<string, string[][]>,
  months: string[]
): Liquidity[] {
  const sheet = byName.get("Bank View_Liquidity") || [];

  const { data: liquidity } = parseNamedLiquidityData(sheet, 0, months);

  return liquidity;
}

function parseNamedLiquidityData(
  sheet: string[][],
  startIndex: number,
  months: string[],
  breakCondition?: (row: string[]) => boolean
): { data: NamedMonthlyData[]; nextIndex: number } {
  const data: NamedMonthlyData[] = [];
  let currentIndex = startIndex;

  for (let r = startIndex; r < sheet.length; r++) {
    const row = sheet[r];

    if (!row || !row.length) {
      currentIndex++;
      continue;
    }

    if (breakCondition && breakCondition(row)) {
      break;
    }

    data.push({
      name: row[0],
      months: months.map((title, j) => {
        const offset = j * 2 + 1;
        return createMonthData(
          title,
          row[offset] || "0",
          row[offset + 1] || "0"
        );
      }),
    });
    currentIndex++;
  }

  return { data, nextIndex: currentIndex };
}

export async function transformGoogleSheet(
  rawSheets: SheetData[]
): Promise<FormattedModel | null> {
  return new Promise((resolve, reject) => {
    const cached = localStorage.getItem("formattedModel");
    if (cached) {
      const parsed = JSON.parse(cached) as FormattedModel;
      // Upgrade path: add allRows to billingViewProfit if missing
      try {
        if (!parsed?.billingView?.billingViewProfit?.allRows) {
          const byName = createSheetMap(rawSheets);
          const summarySheet = byName.get("Summary View") || [];
          const months = extractMonths(
            summarySheet.length ? summarySheet[1] : []
          );
          const upgradedBillingProfit = parseBillingProfit(byName, months);
          parsed.billingView.billingViewProfit = upgradedBillingProfit;
          localStorage.setItem("formattedModel", JSON.stringify(parsed));
        }
        // Upgrade path: add allRows to bankView.cashflow if missing
        if (!parsed?.bankView?.cashflow?.allRows) {
          const byName = createSheetMap(rawSheets);
          const summarySheet = byName.get("Summary View") || [];
          const months = extractMonths(
            summarySheet.length ? summarySheet[1] : []
          );
          const upgradedCashflow = parseCashflow(byName, months);
          parsed.bankView.cashflow = upgradedCashflow;
          localStorage.setItem("formattedModel", JSON.stringify(parsed));
        }
      } catch (_) {
        // If upgrade fails, fall through to rebuild below
      }
      resolve(parsed);
    }

    const byName = createSheetMap(rawSheets);
    const summarySheet = byName.get("Summary View") || [];
    const months = extractMonths(summarySheet.length ? summarySheet[1] : []);

    // Parse all sections
    const summary = parseSummaryData(summarySheet, months);
    const billedRevenue = parseBillingRevenue(byName, months);
    const billedExpenses = parseBillingExpenses(byName, months);
    const billingViewProfit = parseBillingProfit(byName, months);
    const bankRevenue = parseBankRevenue(byName, months);
    const bankExpenses = parseBankExpenses(byName, months);
    const cashflow = parseCashflow(byName, months);
    const liquidity = parseLiquidity(byName, months);

    const _res = {
      summary,
      billingView: {
        billedRevenue,
        billedExpenses,
        billingViewProfit,
      },
      bankView: {
        bankRevenue,
        bankExpenses,
        cashflow,
        liquidity,
      },
    };
    localStorage.setItem("formattedModel", JSON.stringify(_res));
    resolve(_res);
  });
}
