import {
  CurrencyCode,
  MoneyByCurrency,
  MonthName,
  NormalizedSheetsData,
  TimeSeriesByCurrency,
} from "./data-model";

export function getMonthName(date: Date): MonthName {
  const names: MonthName[] = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
  ];
  // naive map: assume FY starting April; clamp to known months
  const idx = Math.min(names.length - 1, Math.max(0, date.getMonth() - 3));
  return names[idx];
}

export function valueForCurrency(
  m: MoneyByCurrency,
  currency: CurrencyCode
): number {
  return currency === "USD" ? m.USD : m.INR;
}

export function seriesValueForMonth(
  series: TimeSeriesByCurrency,
  month: MonthName,
  currency: CurrencyCode
): number {
  return valueForCurrency(
    series.byMonth[month] || { INR: 0, USD: 0 },
    currency
  );
}

export function sumRowsForMonth(
  rows: { byMonth: Record<MonthName, MoneyByCurrency> }[] | undefined,
  month: MonthName,
  currency: CurrencyCode
): number {
  if (!rows || !rows.length) return 0;
  return rows.reduce(
    (acc, r) =>
      acc + valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
    0
  );
}

export function selectSummaryTopMetrics(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode
) {
  const s = data?.summary;
  return {
    billedRevenue: s ? seriesValueForMonth(s.invoiced, month, currency) : 0,
    billedExpenses: s
      ? seriesValueForMonth(s.expenseBilled, month, currency)
      : 0,
    bankRevenue: s ? seriesValueForMonth(s.receivedInBank, month, currency) : 0,
    bankExpenses: s ? seriesValueForMonth(s.spentFromBank, month, currency) : 0,
    netProfit: s ? seriesValueForMonth(s.netProfit, month, currency) : 0,
    liquidity: s ? s.liquidity[month] || 0 : 0,
  };
}

export function selectBankingTopMetrics(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode
) {
  const b = data?.banking?.monthlyNumbers;
  return {
    bankRevenue: b ? seriesValueForMonth(b.bankRevenue, month, currency) : 0,
    bankExpenses: b ? seriesValueForMonth(b.bankExpenses, month, currency) : 0,
    profit: b ? seriesValueForMonth(b.profit, month, currency) : 0,
  };
}

// Billing view selectors
export function selectBillingTopMetrics(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode
) {
  const m = data?.billing?.monthlyNumbers;
  return {
    billedRevenue: m
      ? seriesValueForMonth(m.billedRevenue, month, currency)
      : 0,
    billedExpenses: m
      ? seriesValueForMonth(m.billedExpenses, month, currency)
      : 0,
    profit: m ? seriesValueForMonth(m.profit, month, currency) : 0,
  };
}

export function selectBillingMonthlySeries(
  data: NormalizedSheetsData | undefined,
  currency: CurrencyCode,
  kind: "revenue" | "expenses"
): { month: MonthName; value: number }[] {
  const m = data?.billing?.monthlyNumbers;
  const series = kind === "revenue" ? m?.billedRevenue : m?.billedExpenses;
  if (!series) return [];
  return Object.entries(series.byMonth).map(([month, money]) => ({
    month: month as MonthName,
    value: valueForCurrency(money, currency),
  }));
}

export function selectTopClientsByRevenue(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode,
  topN = 5
): { name: string; amount: number; percent: number }[] {
  const rows = data?.billing?.clientWiseRevenue || [];
  const items = rows.map((r) => ({
    name: r.name,
    amount: valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
  }));
  const total = items.reduce((a, b) => a + b.amount, 0) || 1;
  const sorted = items.sort((a, b) => b.amount - a.amount);
  return sorted.slice(0, topN).map((it) => ({
    name: it.name,
    amount: it.amount,
    percent: (it.amount / total) * 100,
  }));
}

export function selectRevenueTypeBreakdown(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode
): { name: string; amount: number; percent: number }[] {
  const rows = data?.billing?.revenueType || [];
  const items = rows.map((r) => ({
    name: r.name,
    amount: valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
  }));
  const total = items.reduce((a, b) => a + b.amount, 0) || 1;
  return items.map((it) => ({
    name: it.name,
    amount: it.amount,
    percent: (it.amount / total) * 100,
  }));
}

export function selectExpenseCategoryBreakdown(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode
): { name: string; amount: number; percent: number }[] {
  const rows = data?.billing?.categoryWiseExpenses || [];
  const items = rows.map((r) => ({
    name: r.name,
    amount: valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
  }));
  const total = items.reduce((a, b) => a + b.amount, 0) || 1;
  return items.map((it) => ({
    name: it.name,
    amount: it.amount,
    percent: (it.amount / total) * 100,
  }));
}

// Banking view helpers
export function selectBankingMonthlySeries(
  data: NormalizedSheetsData | undefined,
  currency: CurrencyCode,
  kind: "revenue" | "expenses" | "profit"
): { month: MonthName; value: number }[] {
  const m = data?.banking?.monthlyNumbers;
  const series =
    kind === "revenue"
      ? m?.bankRevenue
      : kind === "expenses"
      ? m?.bankExpenses
      : m?.profit;
  if (!series) return [];
  return Object.entries(series.byMonth).map(([month, money]) => ({
    month: month as MonthName,
    value: valueForCurrency(money, currency),
  }));
}

export function selectBankingTopClients(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode,
  topN = 5
): { name: string; amount: number; percent: number }[] {
  const rows = data?.banking?.clientWiseRevenue || [];
  const items = rows.map((r) => ({
    name: r.name,
    amount: valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
  }));
  const total = items.reduce((a, b) => a + b.amount, 0) || 1;
  const sorted = items.sort((a, b) => b.amount - a.amount);
  return sorted.slice(0, topN).map((it) => ({
    name: it.name,
    amount: it.amount,
    percent: (it.amount / total) * 100,
  }));
}

export function selectBankingInvoicingBreakdown(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode
): { name: string; amount: number; percent: number }[] {
  const rows = data?.banking?.invoicingBreakdown || [];
  const items = rows.map((r) => ({
    name: r.name,
    amount: valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
  }));
  const total = items.reduce((a, b) => a + b.amount, 0) || 1;
  return items.map((it) => ({
    name: it.name,
    amount: it.amount,
    percent: (it.amount / total) * 100,
  }));
}

export function selectBankingExpenseCategoryBreakdown(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode
): { name: string; amount: number; percent: number }[] {
  const rows = data?.banking?.categoryWiseExpenses || [];
  const items = rows.map((r) => ({
    name: r.name,
    amount: valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
  }));
  const total = items.reduce((a, b) => a + b.amount, 0) || 1;
  return items.map((it) => ({
    name: it.name,
    amount: it.amount,
    percent: (it.amount / total) * 100,
  }));
}

export function selectOutstandingByClient(
  data: NormalizedSheetsData | undefined,
  month: MonthName,
  currency: CurrencyCode,
  topN = 5
): { name: string; amount: number; percent: number }[] {
  const rows = data?.outstanding?.clientWiseOutstanding || [];
  const items = rows.map((r) => ({
    name: r.name,
    amount: valueForCurrency(r.byMonth[month] || { INR: 0, USD: 0 }, currency),
  }));
  const total = items.reduce((a, b) => a + b.amount, 0) || 1;
  const sorted = items.sort((a, b) => b.amount - a.amount);
  return sorted.slice(0, topN).map((it) => ({
    name: it.name,
    amount: it.amount,
    percent: (it.amount / total) * 100,
  }));
}
