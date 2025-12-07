import { FormattedModel, MonthData, Currency } from "./sheet-conversion";

export interface SummaryMetric {
  title: string;
  label?: string;
  value: number;
  change: number;
  currency: Currency;
  isHighlighted?: boolean;
  sorting?: number;
  growthPercentage?: number;
}

export interface MonthOption {
  value: string;
  label: string;
}

export class DataService {
  private formattedData: FormattedModel | null = null;
  private currentCurrency: Currency = Currency.USD;
  private currentMonth: string = "total";

  constructor() {
    this.loadDataFromStorage();
  }

  private loadDataFromStorage(): void {
    try {
      const cached = localStorage.getItem("formattedModel");
      if (cached) {
        this.formattedData = JSON.parse(cached) as FormattedModel;
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      this.formattedData = null;
    }
  }

  public setCurrency(currency: Currency): void {
    this.currentCurrency = currency;
  }

  public setMonth(month: string): void {
    this.currentMonth = month;
  }

  public monthKeyFromDate(date: Date): string {
    // Our model uses lowercase month names april..march
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    return monthNames[date.getMonth()];
  }

  public setMonthFromDate(date: Date): void {
    this.currentMonth = this.monthKeyFromDate(date);
  }

  public getCurrentCurrency(): Currency {
    return this.currentCurrency;
  }

  public getCurrentMonth(): string {
    return this.currentMonth;
  }

  public getAvailableMonths(): MonthOption[] {
    if (!this.formattedData) return [{ value: "total", label: "Total" }];

    const months: MonthOption[] = [{ value: "total", label: "Total" }];

    // Get months from the first summary item that has data
    const firstSummaryItem = this.formattedData.summary.find(
      (item) => item.months.length > 0
    );
    if (firstSummaryItem) {
      firstSummaryItem.months.forEach((month) => {
        if (month.titles !== "total") {
          months.push({
            value: month.titles,
            label: month.titles.charAt(0).toUpperCase() + month.titles.slice(1),
          });
        }
      });
    }

    return months;
  }

  private getValueFromMonthData(monthData: MonthData | undefined): number {
    if (!monthData) return 0;
    return this.currentCurrency === Currency.USD
      ? monthData.USD
      : monthData.INR;
  }

  private getMonthDataForCurrentSelection(
    summaryItem: any
  ): MonthData | undefined {
    if (!summaryItem || !summaryItem.months) return undefined;

    return summaryItem.months.find(
      (month: MonthData) => month.titles === this.currentMonth
    );
  }

  private calculateChange(currentValue: number, previousValue: number): number {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  }

  private stringPercentageToNumber(percentage: string): number | undefined {
    if (
      !percentage ||
      percentage === "" ||
      percentage == "N/A" ||
      isNaN(parseFloat(percentage.replace("%", "")))
    )
      return undefined;
    return parseFloat(percentage.replace("%", ""));
  }
  public getSummaryMetrics(): SummaryMetric[] {
    if (!this.formattedData) {
      return this.getDefaultMetrics();
    }

    const metrics: SummaryMetric[] = [];

    // Billed Revenue
    const billedRevenueItem = this.formattedData.summary.find(
      (item) => item.key === "Billed Revenue"
    );
    const billedRevenueData =
      this.getMonthDataForCurrentSelection(billedRevenueItem);

    const billedRevenueValue = this.getValueFromMonthData(billedRevenueData);

    // Calculate change (comparing with previous month or total)
    // const billedRevenueChange = this.calculateChangeForMetric(
    //   billedRevenueItem,
    //   "Billed Revenue"
    // );

    metrics.push({
      title: "Billed Revenue",
      label: "Revenue",
      value: billedRevenueValue,
      change: this.stringPercentageToNumber(billedRevenueData?.percentage),
      currency: this.currentCurrency,
      isHighlighted: true,
      sorting: 1,
    });

    // Billed Expenses
    const billedExpensesItem = this.formattedData.summary.find(
      (item) => item.key === "Billed Expenses"
    );
    const billedExpensesData =
      this.getMonthDataForCurrentSelection(billedExpensesItem);
    const billedExpensesValue = this.getValueFromMonthData(billedExpensesData);
    // const billedExpensesChange = this.calculateChangeForMetric(
    //   billedExpensesItem,
    //   "Billed Expenses"
    // );

    metrics.push({
      title: "Billed Expenses",
      label: "Expenses",
      value: billedExpensesValue,
      change: this.stringPercentageToNumber(billedExpensesData?.percentage),
      currency: this.currentCurrency,
      sorting: 2,
    });

    // Billed Profit (calculated)
    // const billedProfitValue = billedRevenueValue - billedExpensesValue;
    // const billedProfitChange = this.calculateChangeForMetric(
    //   billedRevenueItem,
    //   "Billed Profit"
    // );

    const billedProfitItem = this.formattedData.summary.find(
      (item) => item.key === "Billed Profit"
    );
    const billedProfitData =
      this.getMonthDataForCurrentSelection(billedProfitItem);
    const billedProfitValue = this.getValueFromMonthData(billedProfitData);

    metrics.push({
      title: "Billed Profit",
      label: "Profit",
      value: billedProfitValue,
      change: this.stringPercentageToNumber(billedProfitData?.percentage),
      currency: this.currentCurrency,
      sorting: 3,
      growthPercentage: this.stringPercentageToNumber(
        billedProfitData?.growthPercentage || "0"
      ),
    });

    // Billed Cashflow

    const billedCashflowItem = this.formattedData.summary.find(
      (item) => item.key === "Billed Cashflow"
    );
    const billedCashflowData =
      this.getMonthDataForCurrentSelection(billedCashflowItem);
    const billedCashflowValue = this.getValueFromMonthData(billedCashflowData);

    metrics.push({
      title: "Billed Cashflow",
      label: "Cashflow",
      value: billedCashflowValue,
      change: this.stringPercentageToNumber(billedCashflowData?.percentage),
      currency: this.currentCurrency,
      sorting: 4,
    });

    // Bank Revenue
    const bankRevenueItem = this.formattedData.summary.find(
      (item) => item.key === "Bank Revenue"
    );
    const bankRevenueData =
      this.getMonthDataForCurrentSelection(bankRevenueItem);
    const bankRevenueValue = this.getValueFromMonthData(bankRevenueData);

    metrics.push({
      title: "Bank Revenue",
      label: "Revenue",
      value: bankRevenueValue,
      change: this.stringPercentageToNumber(bankRevenueData?.percentage),
      currency: this.currentCurrency,
      sorting: 5,
    });

    // Bank Expenses
    const bankExpensesItem = this.formattedData.summary.find(
      (item) => item.key === "Bank Expenses"
    );
    const bankExpensesData =
      this.getMonthDataForCurrentSelection(bankExpensesItem);
    const bankExpensesValue = this.getValueFromMonthData(bankExpensesData);

    metrics.push({
      title: "Bank Expenses",
      label: "Expenses",
      value: bankExpensesValue,
      change: this.stringPercentageToNumber(bankExpensesData?.percentage),
      currency: this.currentCurrency,
      sorting: 6,
    });

    // Bank Profit
    const bankProfitItem = this.formattedData.summary.find(
      (item) => item.key === "Bank Profit"
    );
    const bankProfitData = this.getMonthDataForCurrentSelection(bankProfitItem);
    const bankProfitValue = this.getValueFromMonthData(bankProfitData);

    metrics.push({
      title: "Bank Profit",
      label: "Profit",
      value: bankProfitValue,
      change: this.stringPercentageToNumber(bankProfitData?.percentage),
      currency: this.currentCurrency,
      sorting: 7,
      growthPercentage: this.stringPercentageToNumber(
        bankProfitData?.growthPercentage || "0"
      ),
    });

    // Billed Cashflow

    const bankCashflowItem = this.formattedData.summary.find(
      (item) => item.key === "Bank Cashflow"
    );
    const bankCashflowData =
      this.getMonthDataForCurrentSelection(bankCashflowItem);
    const bankCashflowValue = this.getValueFromMonthData(bankCashflowData);
    // const bankCashflowChange = this.calculateChangeForMetric(
    //   bankCashflowItem,
    //   "Bank Cashflow"
    // );

    metrics.push({
      title: "Bank Cashflow",
      label: "Cashflow",
      value: bankCashflowValue,
      change: this.stringPercentageToNumber(bankCashflowData?.percentage),
      currency: this.currentCurrency,
      sorting: 8,
    });

    // Liquidity
    const liquidityItem = this.formattedData.summary.find(
      (item) => item.key === "Liquidity"
    );
    const liquidityData =
      this.getLiquidityMonthDataForCurrentSelection(liquidityItem);
    const liquidityValue = this.getValueFromMonthData(liquidityData);

    metrics.push({
      title: "Liquidity",
      label: "Liquidity",
      value: liquidityValue,
      change: this.stringPercentageToNumber(liquidityData?.percentage),
      currency: this.currentCurrency,
      sorting: 9,
    });

    return metrics;
  }

  private getLiquidityMonthDataForCurrentSelection(
    summaryItem: any
  ): MonthData | undefined {
    if (!summaryItem || !summaryItem.months) return undefined;
    const currentMonth =
      this.currentMonth == "total"
        ? this.getCurrentMonthValue()
        : this.currentMonth;
    return summaryItem.months.find(
      (month: MonthData) => month.titles === currentMonth
    );
  }

  public getCurrentMonthValue() {
    return new Date().toLocaleString("en-US", { month: "long" }).toLowerCase();
  }
  private calculateChangeForMetric(
    summaryItem: any,
    metricName: string
  ): number {
    if (!summaryItem || !summaryItem.months || summaryItem.months.length < 2) {
      return 0;
    }

    const currentData = this.getMonthDataForCurrentSelection(summaryItem);
    const currentValue = this.getValueFromMonthData(currentData);

    // For total view, compare with previous month
    if (this.currentMonth === "total") {
      // Find the last month with data
      const monthsWithData = summaryItem.months.filter(
        (month: MonthData) =>
          month.titles !== "total" && this.getValueFromMonthData(month) > 0
      );

      if (monthsWithData.length < 2) return 0;

      const previousMonth = monthsWithData[monthsWithData.length - 2];
      const previousValue = this.getValueFromMonthData(previousMonth);

      return this.calculateChange(currentValue, previousValue);
    } else {
      // For specific month, compare with total
      const totalData = summaryItem.months.find(
        (month: MonthData) => month.titles === "total"
      );
      const totalValue = this.getValueFromMonthData(totalData);

      return this.calculateChange(currentValue, totalValue);
    }
  }

  private getDefaultMetrics(): SummaryMetric[] {
    return [
      {
        title: "Billed Revenue",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
        isHighlighted: true,
      },
      {
        title: "Billed Expenses",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
      },
      {
        title: "Bank Revenue",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
      },
      {
        title: "Bank Expenses",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
      },
      {
        title: "Net Profit",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
      },
      {
        title: "Cashflow",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
      },
      {
        title: "Liquidity",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
      },
      {
        title: "Taxes Paid",
        value: 0,
        change: 0,
        currency: this.currentCurrency,
      },
    ];
  }

  public formatCurrency(value: number): string {
    const symbol = this.currentCurrency === Currency.USD ? "$" : "₹";
    const formattedValue = Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return `${symbol}${formattedValue}`;
  }

  public formatChange(change: number): string {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  }

  public isDataAvailable(): boolean {
    return this.formattedData !== null;
  }

  public refreshData(): void {
    this.loadDataFromStorage();
  }

  // ---------------- Billing view getters ----------------

  // Cards can reuse getSummaryMetrics() at page-level

  // Monthly Revenue series for chart (Apr..Mar, with dates for highlight)
  public getBillingMonthlyRevenueSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    revenue: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.billingView.billedRevenue.monthlyRevenueChart;
    // Map to dictionary for quick lookup
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const currentYear = new Date().getFullYear();
    const _res = monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      // Construct a date similar to component expectation (Apr..Dec currentYear-1?) keep simple: map by index
      // We'll assume fiscal year Apr(currentYear-1)..Mar(currentYear)
      const fiscalStartYear =
        new Date().getMonth() >= 3
          ? new Date().getFullYear()
          : new Date().getFullYear() - 1;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1; // Jan-Mar next year
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9; // Apr=3 .. Dec=11, Jan=0 .. Mar=2
      return {
        month: m,
        shortMonth: shortNames[idx],
        revenue: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
    return _res;
  }

  public getBillingMonthlyExpensesSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    expenses: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.billingView.billedExpenses.monthlyExpensesChart;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1; // Jan-Mar next year
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9; // Apr=3 .. Dec=11, Jan=0 .. Mar=2
      return {
        month: m,
        shortMonth: shortNames[idx],
        expenses: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getTopClientsByRevenue(
    month?: string,
    currency?: string
  ): { name: string; amount: number; percentage: number }[] {
    if (!this.formattedData) return [];
    const selMonth = month || this.currentMonth;
    const selCurrency = currency || this.currentCurrency;

    const list =
      this.formattedData.billingView.billedRevenue.clientsByRevenue || [];

    const entries = list.map((item) => {
      const md =
        item.months.find((m) => m.titles.toLowerCase() === selMonth) ||
        item.months.find((m) => m.titles.toLowerCase() === "total");
      const amt = md ? (selCurrency === Currency.USD ? md.USD : md.INR) : 0;
      return { name: item.name, amount: amt };
    });
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const withPct = entries
      .filter((c) => !/tbd/i.test(c.name))
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({
        name: e.name,
        amount: e.amount,
        percentage: (e.amount / total) * 100,
      }));
    return withPct;
  }

  public getAllClientsByRevenue(
    month?: string,
    currency?: string
  ): {
    name: string;
    amount: number;
    percentage: number;
  }[] {
    if (!this.formattedData) return [];
    const list = this.getTopClientsByRevenue(month, currency);
    return list;
  }

  public getRevenueTypeBreakdown(
    selectedCurrency: string,
    selectedMonth: string
  ): { name: string; amount: number; percentage: number }[] {
    if (!this.formattedData) return [];
    const list = this.formattedData.billingView.billedRevenue.revenueType || [];
    const currency = selectedCurrency || this.currentCurrency;
    const month = selectedMonth || this.currentMonth;
    const entries = list.map((item) => {
      const md =
        item.months.find((m) => m.titles.toLowerCase() === month) ||
        item.months.find((m) => m.titles.toLowerCase() === "total");
      const amt = md ? (currency === Currency.USD ? md.USD : md.INR) : 0;
      return { name: item.name, amount: amt };
    });
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const withPct = entries
      .filter((rt) => !/tbd/i.test(rt.name))
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({
        name: e.name,
        amount: e.amount,
        percentage: (e.amount / total) * 100,
      }));
    return withPct;
  }

  public getOutstandingBalances(
    selectedCurrency: string,
    selectedMonth: string
  ): { name: string; amount: number; percentage: number }[] {
    if (!this.formattedData) return [];
    const list =
      this.formattedData.billingView.billedRevenue.outStandingBalances || [];
    const currency = selectedCurrency || this.currentCurrency;
    const month = selectedMonth || this.currentMonth;
    const entries = list.map((item) => {
      const md =
        item.months.find((m) => m.titles.toLowerCase() === month) ||
        item.months.find((m) => m.titles.toLowerCase() === "total");
      const amt = md ? (currency === Currency.USD ? md.USD : md.INR) : 0;
      return { name: item.name, amount: amt };
    });
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const withPct = entries
      .filter((o) => !/tbd/i.test(o.name))
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({
        name: e.name,
        amount: e.amount,
        percentage: (e.amount / total) * 100,
      }));
    return withPct;
  }

  public getExpenseCategories(
    selectedCurrency?: string,
    selectedMonth?: string,
    limit = 10
  ): { name: string; amount: number; percentage: number }[] {
    if (!this.formattedData) return [];
    const list =
      this.formattedData.billingView.billedExpenses.expensesCategories || [];
    const currency = selectedCurrency || this.currentCurrency;
    const month = selectedMonth || this.currentMonth;

    const entries = list.map((item) => {
      const md =
        item.months.find((m) => m.titles.toLowerCase() === month) ||
        item.months.find((m) => m.titles.toLowerCase() === "total");
      const amt = md ? (currency === Currency.USD ? md.USD : md.INR) : 0;
      return { name: item.name, amount: amt };
    });
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const withPct = entries
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({
        name: e.name,
        amount: e.amount,
        percentage: (e.amount / total) * 100,
      }));
    return withPct.slice(0, limit);
  }

  public getBankMonthlyRevenueSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    revenue: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
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
    const shortNames = [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    //billingView.billedRevenue.monthlyRevenueChart
    const row = this.formattedData.bankView.bankRevenue.monthlyRevenue;
    // Map to dictionary for quick lookup
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const currentYear = new Date().getFullYear();
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      // Construct a date similar to component expectation (Apr..Dec currentYear-1?) keep simple: map by index
      // We'll assume fiscal year Apr(currentYear-1)..Mar(currentYear)
      const fiscalStartYear =
        new Date().getMonth() >= 3
          ? new Date().getFullYear()
          : new Date().getFullYear() - 1;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1; // Jan-Mar next year
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9; // Apr=3 .. Dec=11, Jan=0 .. Mar=2
      return {
        month: m,
        shortMonth: shortNames[idx],
        revenue: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getTopBankClientsByRevenue(
    month?: string,
    currency?: string
  ): { name: string; amount: number; percentage: number }[] {
    if (!this.formattedData) return [];
    const selMonth = month || this.currentMonth;
    const selCurrency = currency || this.currentCurrency;
    const list =
      this.formattedData.bankView.bankRevenue.topClientByRevenue || [];

    const entries = list.map((item) => {
      const md =
        item.months.find((m) => m.titles.toLowerCase() === selMonth) ||
        item.months.find((m) => m.titles.toLowerCase() === "total");
      const amt = md ? (selCurrency === Currency.USD ? md.USD : md.INR) : 0;
      return { name: item.name, amount: amt };
    });
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const withPct = entries
      .filter((c) => !/tbd/i.test(c.name))
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({
        name: e.name,
        amount: e.amount,
        percentage: (e.amount / total) * 100,
      }));
    return withPct;
  }

  public getBankRevenueTypeBreakdown(
    selectedCurrency: string,
    selectedMonth: string
  ): { name: string; amount: number; percentage: number }[] {
    if (!this.formattedData) return [];
    //billingView.billedRevenue.revenueType
    const list = this.formattedData.bankView.bankRevenue.revenueType || [];
    const currency = selectedCurrency || this.currentCurrency;
    const month = selectedMonth || this.currentMonth;
    const entries = list.map((item) => {
      const md =
        item.months.find((m) => m.titles.toLowerCase() === month) ||
        item.months.find((m) => m.titles.toLowerCase() === "total");
      const amt = md ? (currency === Currency.USD ? md.USD : md.INR) : 0;
      return { name: item.name, amount: amt };
    });
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const withPct = entries
      .filter((rt) => !/tbd/i.test(rt.name))
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({
        name: e.name,
        amount: e.amount,
        percentage: (e.amount / total) * 100,
      }));
    return withPct;
  }

  public getBankMonthlyExpensesSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    expenses: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row = this.formattedData.bankView.bankExpenses.monthlyExpensesChart;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1; // Jan-Mar next year
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9; // Apr=3 .. Dec=11, Jan=0 .. Mar=2
      return {
        month: m,
        shortMonth: shortNames[idx],
        expenses: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  // Bank Profit (Bank View_Bank Profit 1.1) series getters
  public getBankMonthlyProfitRevenueSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    revenue: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.bankView.cashflow.revenueExpensesChart.bankRevenue;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        revenue: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBankMonthlyDirectExpensesSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    directExpenses: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.bankView.cashflow.revenueExpensesChart
        .bankDirectExpenses;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        directExpenses: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBankMonthlyGrossProfitSeries(selectedCurrency): {
    month: string;
    shortMonth: string;
    profit: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.bankView.cashflow.revenueExpensesChart.bankGrossProfit;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        profit: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBankMonthlyCashflowSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    cashflow: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.bankView.cashflow.revenueExpensesChart.bankCashflow ||
      [];
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        cashflow: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBankClientProfitability(
    monthDate?: string,
    selectedCurrency?: string,
    limit?: number
  ): {
    name: string;
    realisedRevenue: number;
    realisedExpenses: number;
    grossProfit: number;
    grossProfitPercentage: number;
  }[] {
    console.log(monthDate, " ", selectedCurrency);
    if (!this.formattedData) return [];
    const monthKey = monthDate;
    const list = this.formattedData.bankView.cashflow.clientWiseProfitability;
    const result = list.map((c) => {
      const revenueMd =
        c.revenue.find((m) => m.titles.toLowerCase() === monthKey) ||
        c.revenue.find((m) => m.titles.toLowerCase() === "total");
      const expensesMd =
        c.projectExpenses.find((m) => m.titles.toLowerCase() === monthKey) ||
        c.projectExpenses.find((m) => m.titles.toLowerCase() === "total");
      const marginMd =
        c.margin.find((m) => m.titles.toLowerCase() === monthKey) ||
        c.margin.find((m) => m.titles.toLowerCase() === "total");
      const marginPctMd =
        c.marginPercentage.find((m) => m.titles.toLowerCase() === monthKey) ||
        c.marginPercentage.find((m) => m.titles.toLowerCase() === "total");

      const revenue = revenueMd
        ? selectedCurrency === Currency.USD
          ? revenueMd.USD
          : revenueMd.INR
        : 0;
      const expenses = expensesMd
        ? selectedCurrency === Currency.USD
          ? expensesMd.USD
          : expensesMd.INR
        : 0;
      const margin = marginMd
        ? selectedCurrency === Currency.USD
          ? marginMd.USD
          : marginMd.INR
        : revenue - expenses;
      const marginPct = marginPctMd?.percentage
        ? parseFloat(
            (marginPctMd?.percentage || "0").toString().replace("%", "")
          )
        : undefined;

      return {
        name: c.name,
        realisedRevenue: revenue,
        realisedExpenses: expenses,
        grossProfit: margin,
        grossProfitPercentage:
          marginPct ?? (revenue ? (margin / revenue) * 100 : 0),
      };
    });
    const sorted = result.sort((a, b) => b.grossProfit - a.grossProfit);
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }

  public getBankProfitSheet1ForDate(
    selectedCurrency: string,
    date: string
  ): {
    key: string;
    label: string;
    value: number;
    percentage?: number;
  }[] {
    if (!this.formattedData) return [];
    const monthKey = date;
    const allRows = this.formattedData.bankView.cashflow.allRows || {};
    const entries: {
      key: string;
      label: string;
      value: number;
      percentage?: number;
    }[] = [];
    const toLabel = (k: string) =>
      k
        .replace(/bank\s?/i, "") // Remove "Billed" (case-insensitive, optional space)
        .replace(/([A-Z])/g, " $1") // Add space before capital letters
        .replace(/^./, (s) => s.toUpperCase()) // Capitalize first letter
        .trim(); // Trim whitespace

    for (const [key, series] of Object.entries(allRows)) {
      if (!Array.isArray(series)) continue;
      const md =
        series.find((m) => m.titles?.toLowerCase() === monthKey) ||
        series.find((m) => m.titles?.toLowerCase() === "total");
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const percentage = md.INR ?? 0;
      let label = toLabel(key);
      if (label == "Profit") {
        label = "Net Profit";
      }
      entries.push({ key, label, value, percentage });
    }

    return entries;
  }
  // Billing Profit (profitSheet1) series getters
  public getBillingMonthlyProfitRevenueSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    revenue: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.billingView.billingViewProfit.revenueExpensesChart
        .billedRevenue;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        revenue: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBillingMonthlyDirectExpensesSeries(): {
    month: string;
    shortMonth: string;
    directExpenses: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
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
    const shortNames = [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.billingView.billingViewProfit.revenueExpensesChart
        .billedDirectExpenses;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? this.currentCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        directExpenses: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBillingMonthlyGrossProfitSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    profit: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.billingView.billingViewProfit.revenueExpensesChart
        .billedGrossProfit;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        profit: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBillingMonthlyCashflowSeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    cashflow: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
      "total",
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
    const shortNames = [
      "Total",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    const row =
      this.formattedData.billingView.billingViewProfit.revenueExpensesChart
        .billedCashflow;
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        cashflow: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getBillingClientProfitability(
    selectedCurrency: string,
    monthDate?: string,
    limit?: number
  ): {
    name: string;
    realisedRevenue: number;
    realisedExpenses: number;
    grossProfit: number;
    grossProfitPercentage: number;
  }[] {
    if (!this.formattedData) return [];
    const monthKey = monthDate;
    const list =
      this.formattedData.billingView.billingViewProfit.clientWiseProfitability;
    const result = list.map((c) => {
      const revenueMd = c.revenue.find(
        (m) => m.titles.toLowerCase() === monthKey
      );
      const expensesMd =
        c.projectExpenses.find((m) => m.titles.toLowerCase() === monthKey) ||
        c.projectExpenses.find((m) => m.titles.toLowerCase() === "total");
      const marginMd =
        c.margin.find((m) => m.titles.toLowerCase() === monthKey) ||
        c.margin.find((m) => m.titles.toLowerCase() === "total");
      const marginPctMd =
        c.marginPercentage.find((m) => m.titles.toLowerCase() === monthKey) ||
        c.marginPercentage.find((m) => m.titles.toLowerCase() === "total");

      const revenue = revenueMd
        ? selectedCurrency === Currency.USD
          ? revenueMd.USD
          : revenueMd.INR
        : 0;
      const expenses = expensesMd
        ? selectedCurrency === Currency.USD
          ? expensesMd.USD
          : expensesMd.INR
        : 0;
      const margin = marginMd
        ? selectedCurrency === Currency.USD
          ? marginMd.USD
          : marginMd.INR
        : revenue - expenses;
      const marginPct = marginPctMd?.percentage
        ? parseFloat(
            (marginPctMd?.percentage || "0").toString().replace("%", "")
          )
        : undefined;

      return {
        name: c.name,
        realisedRevenue: revenue,
        realisedExpenses: expenses,
        grossProfit: margin,
        grossProfitPercentage:
          marginPct ?? (revenue ? (margin / revenue) * 100 : 0),
      };
    });

    const sorted = result
      .filter((r) => !/tbd/i.test(r.name))
      .sort((a, b) => b.grossProfit - a.grossProfit);
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }

  public getBillingProfitSheet1ForDate(
    selectedCurrency: string,
    date: string
  ): {
    key: string;
    label: string;
    value: number;
    percentage?: number;
  }[] {
    if (!this.formattedData) return [];
    const monthKey = date;
    const allRows =
      this.formattedData.billingView.billingViewProfit.allRows || {};
    const entries: {
      key: string;
      label: string;
      value: number;
      percentage?: number;
    }[] = [];
    const toLabel = (k: string) =>
      k
        .replace(/billed\s?/i, "") // Remove "Billed" (case-insensitive, optional space)
        .replace(/([A-Z])/g, " $1") // Add space before capital letters
        .replace(/^./, (s) => s.toUpperCase()) // Capitalize first letter
        .trim(); // Trim whitespace

    for (const [key, series] of Object.entries(allRows)) {
      if (!Array.isArray(series)) continue;
      const md =
        series.find((m) => m.titles?.toLowerCase() === monthKey) ||
        series.find((m) => m.titles?.toLowerCase() === "total");
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const percentage = md.INR ?? 0;
      let label = toLabel(key);
      if (label == "Profit") {
        label = "Net Profit";
      }
      entries.push({ key, label, value, percentage });
    }

    return entries;
  }

  public getBankExpenseCategories(
    selectedCurrency?: string,
    selectedMonth?: string,
    limit = 10
  ): { name: string; amount: number; percentage: number }[] {
    if (!this.formattedData) return [];
    const list =
      this.formattedData.bankView.bankExpenses.expensesCategories || [];
    const currency = selectedCurrency || this.currentCurrency;
    const month = selectedMonth || this.currentMonth;

    const entries = list.map((item) => {
      const md =
        item.months.find((m) => m.titles.toLowerCase() === month) ||
        item.months.find((m) => m.titles.toLowerCase() === "total");
      const amt = md ? (currency === Currency.USD ? md.USD : md.INR) : 0;
      return { name: item.name, amount: amt };
    });
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const withPct = entries
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({
        name: e.name,
        amount: e.amount,
        percentage: (e.amount / total) * 100,
      }));
    return withPct.slice(0, limit);
  }

  public getBankMonthlyLiquiditySeries(selectedCurrency: string): {
    month: string;
    shortMonth: string;
    liquidity: number;
    date: Date;
  }[] {
    if (!this.formattedData) return [];
    const monthsOrder = [
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
    const shortNames = [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    // Pick the Totals row if exists, else first entry
    const totals =
      this.formattedData.bankView.liquidity.find(
        (l) => l.name?.toLowerCase() === "totals"
      ) || this.formattedData.bankView.liquidity[0];
    const row = totals ? totals.months : [];
    const byTitle = new Map(row.map((md) => [md.titles.toLowerCase(), md]));
    const fiscalStartYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    return monthsOrder.map((m, idx) => {
      const md = byTitle.get(m);
      const value = md
        ? selectedCurrency === Currency.USD
          ? md.USD
          : md.INR
        : 0;
      const year = idx <= 8 ? fiscalStartYear : fiscalStartYear + 1;
      const calendarMonthIndex = idx <= 8 ? idx + 3 : idx - 9;
      return {
        month: m,
        shortMonth: shortNames[idx],
        liquidity: value,
        date: new Date(year, calendarMonthIndex, 1),
      };
    });
  }

  public getLiquidityTableData(
    selectedCurrency?: string,
    selectedMonth?: string
  ) {
    // Step 1: Filter out irrelevant items (Months, Currency, Totals)
    const rawData = this.formattedData.bankView.liquidity;
    const filteredData = rawData.filter(
      (d) => !["Months", "Currency", "Totals"].includes(d.name)
    );

    // Step 2: Extract values for the selected month and currency
    const sourcesWithValues = filteredData.map((record) => {
      const monthData =
        record.months.find(
          (m) => m.titles.toLowerCase() === selectedMonth?.toLowerCase()
        ) || record.months[0];

      const value = monthData[selectedCurrency] || 0;

      return {
        id: record.name,
        name: record.name,
        actualAmount: value,
        amount: value.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }),
      };
    });

    // Step 3: Compute total and percentage share
    const total = sourcesWithValues.reduce((sum, s) => sum + s.actualAmount, 0);

    const withPercentages = sourcesWithValues.map((s) => ({
      ...s,
      percentage: total > 0 ? +((s.actualAmount / total) * 100).toFixed(2) : 0,
    }));

    // Step 4: Sort descending by amount for better visual clarity
    const sorted = withPercentages.sort(
      (a, b) => b.actualAmount - a.actualAmount
    );
    return sorted.filter((c) => !/tbd/i.test(c.name));
  }
}

// Export a singleton instance
export const dataService = new DataService();
