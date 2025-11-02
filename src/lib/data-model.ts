export type CurrencyCode = "INR" | "USD";

export type MonthName =
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November";

export interface MoneyByCurrency {
  INR: number;
  USD: number;
}

export interface MonthlyMoneyByCurrency extends MoneyByCurrency {
  month: MonthName;
}

export interface TimeSeriesByCurrency {
  totals: MoneyByCurrency; // overall
  byMonth: Record<MonthName, MoneyByCurrency>;
}

export interface SummaryKpis {
  invoiced: TimeSeriesByCurrency;
  receivedInBank: TimeSeriesByCurrency;
  expenseBilled: TimeSeriesByCurrency;
  spentFromBank: TimeSeriesByCurrency;
  liquidity: Record<MonthName, number>; // single currency (assumed INR)
  netProfit: TimeSeriesByCurrency;
}

export interface LiquidityAccountRow {
  accountName: string;
  byMonth: Record<MonthName, MoneyByCurrency>;
}

export interface LiquiditySnapshot {
  accounts: LiquidityAccountRow[];
  totalsByMonth: Record<MonthName, MoneyByCurrency>;
}

export interface CategoryBreakdownRow {
  name: string;
  byMonth: Record<MonthName, MoneyByCurrency>;
}

export interface ClientBreakdownRow extends CategoryBreakdownRow {}

export interface BillingViewDataset {
  monthlyNumbers: {
    billedRevenue: TimeSeriesByCurrency;
    billedExpenses: TimeSeriesByCurrency;
    profit: TimeSeriesByCurrency;
  };
  clientWiseRevenue: ClientBreakdownRow[];
  revenueType: CategoryBreakdownRow[];
  categoryWiseExpenses: CategoryBreakdownRow[];
}

export interface OutstandingViewDataset {
  monthlyNumbers: {
    billedRevenue: TimeSeriesByCurrency;
    billedExpenses: TimeSeriesByCurrency;
    profit: TimeSeriesByCurrency;
  };
  clientWiseOutstanding: ClientBreakdownRow[];
  revenueByClientType: CategoryBreakdownRow[];
  categoryWiseExpenses: CategoryBreakdownRow[];
}

export interface BankingViewDataset {
  monthlyNumbers: {
    bankRevenue: TimeSeriesByCurrency;
    bankExpenses: TimeSeriesByCurrency;
    profit: TimeSeriesByCurrency;
  };
  clientWiseRevenue: ClientBreakdownRow[];
  invoicingBreakdown: CategoryBreakdownRow[];
  categoryWiseExpenses: CategoryBreakdownRow[];
}

export interface ProfitDatasets {
  billed: {
    revenue: TimeSeriesByCurrency;
    directExpenses: TimeSeriesByCurrency;
    grossProfit: TimeSeriesByCurrency;
    indirectExpenses: TimeSeriesByCurrency;
    netProfit: TimeSeriesByCurrency;
    cashflow: TimeSeriesByCurrency;
  };
  banking: {
    revenue: TimeSeriesByCurrency;
    directExpenses: TimeSeriesByCurrency;
    grossProfit: TimeSeriesByCurrency;
    indirectExpenses: TimeSeriesByCurrency;
    netProfit: TimeSeriesByCurrency;
  };
}

export interface NormalizedSheetsData {
  summary?: SummaryKpis;
  liquidity?: LiquiditySnapshot;
  billing?: BillingViewDataset;
  outstanding?: OutstandingViewDataset;
  banking?: BankingViewDataset;
  profit?: ProfitDatasets;
}

export const MONTHS: MonthName[] = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
];

export function emptyMoney(): MoneyByCurrency {
  return { INR: 0, USD: 0 };
}

export function emptyTimeSeries(): TimeSeriesByCurrency {
  return {
    totals: emptyMoney(),
    byMonth: MONTHS.reduce((acc, m) => {
      acc[m] = emptyMoney();
      return acc;
    }, {} as Record<MonthName, MoneyByCurrency>),
  };
}
