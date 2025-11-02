import {
  MONTHS,
  MoneyByCurrency,
  MonthName,
  NormalizedSheetsData,
  TimeSeriesByCurrency,
  emptyMoney,
  emptyTimeSeries,
} from "./data-model";
import { SheetData } from "@/helper/sheetAPIs";

function parseNumber(raw: string | number): number {
  if (typeof raw === "number") return raw;
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

function ensureMoney(obj?: Partial<MoneyByCurrency>): MoneyByCurrency {
  return { INR: obj?.INR ?? 0, USD: obj?.USD ?? 0 };
}

function addMoney(a: MoneyByCurrency, b: MoneyByCurrency): MoneyByCurrency {
  return { INR: a.INR + b.INR, USD: a.USD + b.USD };
}

function setMonthValue(
  ts: TimeSeriesByCurrency,
  month: MonthName,
  delta: MoneyByCurrency
) {
  ts.byMonth[month] = addMoney(ts.byMonth[month] ?? emptyMoney(), delta);
  ts.totals = addMoney(ts.totals, delta);
}

function monthFromHeader(header: string): MonthName | undefined {
  return MONTHS.find((m) => header?.trim().startsWith(m));
}

// Parse "Summary" sheet minimal metrics
function parseSummarySheet(
  values: string[][] | undefined
): NormalizedSheetsData["summary"] {
  if (!values || values.length < 2) return undefined;
  // headers row example: ["", "Total", "April", "May", ...]
  const header = values[0];
  const monthIndices: { month: MonthName; idx: number }[] = [];
  header.forEach((h, idx) => {
    const m = monthFromHeader(h);
    if (m) monthIndices.push({ month: m, idx });
  });

  const buildSeries = (rowLabel: string): TimeSeriesByCurrency => {
    const ts = emptyTimeSeries();
    const row = values.find((r) => (r[0] || "").trim() === rowLabel);
    if (!row) return ts;
    for (const { month, idx } of monthIndices) {
      const v = parseNumber(row[idx] || "0");
      setMonthValue(ts, month, { INR: v, USD: 0 });
    }
    return ts;
  };

  const liquidity: Record<MonthName, number> = MONTHS.reduce((acc, m) => {
    acc[m] = 0;
    return acc;
  }, {} as Record<MonthName, number>);
  const liqRow = values.find((r) => (r[0] || "").trim() === "Liquidity");
  if (liqRow) {
    for (const { month, idx } of monthIndices) {
      liquidity[month] = parseNumber(liqRow[idx] || "0");
    }
  }

  return {
    invoiced: buildSeries("Invoiced"),
    receivedInBank: buildSeries("Received in Bank"),
    expenseBilled: buildSeries("Expense Billed"),
    spentFromBank: buildSeries("Spent from Bank"),
    liquidity,
    netProfit: buildSeries("Net Profit"),
  };
}

// Parse liquidity table like Sheet34: account rows with INR/USD per month
function parseLiquidity(
  values: string[][] | undefined
): NormalizedSheetsData["liquidity"] {
  if (!values || values.length < 3) return undefined;
  // Row 0: ["Months", "April", , "May", , ...]
  // Row 1: ["Currency", "Amount in INR", "Amount in USD", ...]
  const header = values[0];
  const monthPairs: { month: MonthName; inrIdx: number; usdIdx: number }[] = [];
  let col = 1;
  while (col < header.length) {
    const m = monthFromHeader(header[col] || "");
    if (m) {
      // expect pattern: INR at col+0 (per second row), USD at col+1
      monthPairs.push({ month: m, inrIdx: col, usdIdx: col + 1 });
    }
    col += 2;
  }

  const accounts = [] as {
    accountName: string;
    byMonth: Record<MonthName, MoneyByCurrency>;
  }[];
  for (let r = 2; r < values.length; r++) {
    const row = values[r];
    const accountName = (row[0] || "").trim();
    if (!accountName || accountName.toLowerCase().startsWith("totals"))
      continue;
    const byMonth = MONTHS.reduce((acc, m) => {
      acc[m] = emptyMoney();
      return acc;
    }, {} as Record<MonthName, MoneyByCurrency>);
    for (const p of monthPairs) {
      const INR = parseNumber(row[p.inrIdx] || "0");
      const USD = parseNumber(row[p.usdIdx] || "0");
      byMonth[p.month] = { INR, USD };
    }
    accounts.push({ accountName, byMonth });
  }

  const totalsByMonth = MONTHS.reduce((acc, m) => {
    acc[m] = emptyMoney();
    return acc;
  }, {} as Record<MonthName, MoneyByCurrency>);
  for (const a of accounts) {
    for (const m of MONTHS) {
      totalsByMonth[m] = addMoney(totalsByMonth[m], ensureMoney(a.byMonth[m]));
    }
  }

  return { accounts, totalsByMonth };
}

// Generic grid parser for datasets like Frontend_* where blocks have rows with name and alternating INR/USD by month.
function parseGridWithNameAndMonth(
  values: string[][] | undefined,
  startRow: number
): { rows: { name: string; byMonth: Record<MonthName, MoneyByCurrency> }[] } {
  if (!values) return { rows: [] };
  const header = values[0] || [];
  const monthPairs: { month: MonthName; inrIdx: number; usdIdx: number }[] = [];
  // Heuristic: find consecutive month headers from header row two rows above "Monthly Numbers" block
  let idx = 1;
  while (idx < header.length) {
    const m = monthFromHeader(header[idx] || "");
    if (m) {
      monthPairs.push({ month: m, inrIdx: idx, usdIdx: idx + 1 });
    }
    idx += 2;
  }
  const rows: { name: string; byMonth: Record<MonthName, MoneyByCurrency> }[] =
    [];
  for (let r = startRow; r < values.length; r++) {
    const row = values[r];
    const name = (row[0] || "").trim();
    if (!name) continue;
    if (name.toLowerCase().startsWith("totals")) break;
    const byMonth = MONTHS.reduce((acc, m) => {
      acc[m] = emptyMoney();
      return acc;
    }, {} as Record<MonthName, MoneyByCurrency>);
    for (const p of monthPairs) {
      byMonth[p.month] = {
        INR: parseNumber(row[p.inrIdx] || "0"),
        USD: parseNumber(row[p.usdIdx] || "0"),
      };
    }
    rows.push({ name, byMonth });
  }
  return { rows };
}

function parseFrontendBilling(
  values: string[][] | undefined
): NormalizedSheetsData["billing"] {
  if (!values) return undefined;
  // Locate blocks by labels
  const findRowIndex = (label: string) =>
    values.findIndex((r) => (r[0] || "").trim() === label);
  const monthlyIdx = findRowIndex("Monthly Numbers");
  const clientIdx = findRowIndex("Client wise Revenue");
  const revenueTypeIdx = findRowIndex("Revenue Type");
  const categoryIdx = findRowIndex("Category Wise Expenses");

  const monthly = emptySectionSeries(values, monthlyIdx);
  const client = parseGridWithNameAndMonth(values, clientIdx + 1).rows;
  const revenueType =
    revenueTypeIdx >= 0
      ? parseGridWithNameAndMonth(values, revenueTypeIdx + 1).rows
      : [];
  const category =
    categoryIdx >= 0
      ? parseGridWithNameAndMonth(values, categoryIdx + 1).rows
      : [];

  return {
    monthlyNumbers: {
      billedRevenue: monthly.rowSeries["Billed Revenue"] ?? emptyTimeSeries(),
      billedExpenses: monthly.rowSeries["Billed Expenses"] ?? emptyTimeSeries(),
      profit: monthly.rowSeries["Profit"] ?? emptyTimeSeries(),
    },
    clientWiseRevenue: client,
    revenueType: revenueType,
    categoryWiseExpenses: category,
  };
}

function parseFrontendOutstanding(
  values: string[][] | undefined
): NormalizedSheetsData["outstanding"] {
  if (!values) return undefined;
  const findRowIndex = (label: string) =>
    values.findIndex((r) => (r[0] || "").trim() === label);
  const monthlyIdx = findRowIndex("Monthly Numbers");
  const clientIdx = findRowIndex("Client wise outstanding amount");
  const clientTypeIdx = findRowIndex("Revenue by Client Type");
  const categoryIdx = findRowIndex("Category Wise Expenses");

  const monthly = emptySectionSeries(values, monthlyIdx);
  const client = parseGridWithNameAndMonth(values, clientIdx + 1).rows;
  const clientType =
    clientTypeIdx >= 0
      ? parseGridWithNameAndMonth(values, clientTypeIdx + 1).rows
      : [];
  const category =
    categoryIdx >= 0
      ? parseGridWithNameAndMonth(values, categoryIdx + 1).rows
      : [];

  return {
    monthlyNumbers: {
      billedRevenue: monthly.rowSeries["Billed Revenue"] ?? emptyTimeSeries(),
      billedExpenses: monthly.rowSeries["Billed Expenses"] ?? emptyTimeSeries(),
      profit: monthly.rowSeries["Profit"] ?? emptyTimeSeries(),
    },
    clientWiseOutstanding: client,
    revenueByClientType: clientType,
    categoryWiseExpenses: category,
  };
}

function parseFrontendBanking(
  values: string[][] | undefined
): NormalizedSheetsData["banking"] {
  if (!values) return undefined;
  const findRowIndex = (label: string) =>
    values.findIndex((r) => (r[0] || "").trim() === label);
  const monthlyIdx = findRowIndex("Monthly Numbers");
  const clientIdx = findRowIndex("Client wise Revenue");
  const invoicingIdx = findRowIndex("Invoicing Breakdown");
  const categoryIdx = findRowIndex("Category Wise Expenses");

  const monthly = emptySectionSeries(values, monthlyIdx);
  const client =
    clientIdx >= 0 ? parseGridWithNameAndMonth(values, clientIdx + 1).rows : [];
  const invoicing =
    invoicingIdx >= 0
      ? parseGridWithNameAndMonth(values, invoicingIdx + 1).rows
      : [];
  const category =
    categoryIdx >= 0
      ? parseGridWithNameAndMonth(values, categoryIdx + 1).rows
      : [];

  return {
    monthlyNumbers: {
      bankRevenue: monthly.rowSeries["Bank Revenue"] ?? emptyTimeSeries(),
      bankExpenses: monthly.rowSeries["Bank Expenses"] ?? emptyTimeSeries(),
      profit: monthly.rowSeries["Profit"] ?? emptyTimeSeries(),
    },
    clientWiseRevenue: client,
    invoicingBreakdown: invoicing,
    categoryWiseExpenses: category,
  };
}

function emptySectionSeries(
  values: string[][],
  monthlyIdx: number
): { rowSeries: Record<string, TimeSeriesByCurrency> } {
  const rowSeries: Record<string, TimeSeriesByCurrency> = {};
  if (monthlyIdx < 0) return { rowSeries };
  // header two rows above has month columns
  const header = values[0] || [];
  const monthPairs: { month: MonthName; inrIdx: number; usdIdx: number }[] = [];
  let idx = 1;
  while (idx < header.length) {
    const m = monthFromHeader(header[idx] || "");
    if (m) monthPairs.push({ month: m, inrIdx: idx, usdIdx: idx + 1 });
    idx += 2;
  }
  for (let r = monthlyIdx + 1; r < values.length; r++) {
    const row = values[r];
    const name = (row[0] || "").trim();
    if (!name) continue;
    if (name.toLowerCase().startsWith("totals")) break;
    const ts = emptyTimeSeries();
    for (const p of monthPairs) {
      const INR = parseNumber(row[p.inrIdx] || "0");
      const USD = parseNumber(row[p.usdIdx] || "0");
      setMonthValue(ts, p.month, { INR, USD });
    }
    rowSeries[name] = ts;
  }
  return { rowSeries };
}

export function normalizeSheetsData(sheets: SheetData[]): NormalizedSheetsData {
  const byName = new Map<string, string[][]>();
  for (const s of sheets) byName.set(s.sheetName, s.values || []);
  const normData = {
    summary: parseSummarySheet(byName.get("Summary")),
    liquidity: parseLiquidity(byName.get("Sheet34")),
    billing: parseFrontendBilling(
      byName.get("Frontend_Billed Revenue_Expenses")
    ),
    outstanding: parseFrontendOutstanding(
      byName.get("Frontend_Billed_Outstanding View")
    ),
    banking: parseFrontendBanking(
      byName.get("Frontend_Banking Revenue_Expenses")
    ),
    profit: {
      billed: {
        revenue: emptyTimeSeries(),
        directExpenses: emptyTimeSeries(),
        grossProfit: emptyTimeSeries(),
        indirectExpenses: emptyTimeSeries(),
        netProfit: emptyTimeSeries(),
        cashflow: emptyTimeSeries(),
      },
      banking: {
        revenue: emptyTimeSeries(),
        directExpenses: emptyTimeSeries(),
        grossProfit: emptyTimeSeries(),
        indirectExpenses: emptyTimeSeries(),
        netProfit: emptyTimeSeries(),
      },
    },
  };
  return normData;
}
