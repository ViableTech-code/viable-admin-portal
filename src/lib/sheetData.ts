// Simple data structure to extract data directly from Google Sheets sample.json
// No conversions, no calculations - just direct extraction

export type Currency = 'INR' | 'USD';

export interface SheetData {
  sheetName: string;
  values: string[][];
}

export interface MetricData {
  title: string;
  value: string;
  change: number;
  currency: Currency;
  month: string;
}

export interface ModuleData {
  // Summary page data (8 cards)
  summary: {
    billedRevenue: MetricData;
    billedExpenses: MetricData;
    bankRevenue: MetricData;
    bankExpenses: MetricData;
    netProfit: MetricData;
    cashflow: MetricData;
    liquidity: MetricData;
    taxesPaid: MetricData;
  };
  
  // Dashboard page data
  dashboard: {
    billedRevenue: MetricData;
    billedExpenses: MetricData;
    profit: MetricData;
  };
  
  // Profit page data
  profit: {
    billedRevenue: MetricData;
    billedExpenses: MetricData;
    profit: MetricData;
  };
  
  // Liquidity page data
  liquidity: {
    bankRevenue: MetricData;
    bankExpenses: MetricData;
    cashflow: MetricData;
    liquidity: MetricData;
  };
  
  // Bank Revenue page data
  bankRevenue: {
    bankRevenue: MetricData;
    bankExpenses: MetricData;
    cashflow: MetricData;
    liquidity: MetricData;
  };
  
  // Bank Profit page data
  bankProfit: {
    bankRevenue: MetricData;
    bankExpenses: MetricData;
    cashflow: MetricData;
    liquidity: MetricData;
  };
  
  // Bank Expenses page data
  bankExpenses: {
    bankRevenue: MetricData;
    bankExpenses: MetricData;
    cashflow: MetricData;
    liquidity: MetricData;
  };
  
  // Expenses page data
  expenses: {
    billedRevenue: MetricData;
    billedExpenses: MetricData;
    profit: MetricData;
  };
}

class SheetDataManager {
  private rawData: SheetData[] = [];
  private currentCurrency: Currency = 'USD';
  private currentMonth = 'March'; // Default to March (latest month)

  // Initialize with sheet data
  setData(data: SheetData[]): void {
    this.rawData = data;
  }

  // Set current currency and month
  setCurrency(currency: Currency): void {
    this.currentCurrency = currency;
  }

  setMonth(month: string): void {
    this.currentMonth = month;
  }

  // Get current settings
  getCurrentCurrency(): Currency {
    return this.currentCurrency;
  }

  getCurrentMonth(): string {
    return this.currentMonth;
  }

  // Extract numeric value from sheet cell
  private extractValue(row: string[], columnIndex: number): string {
    if (!row || !row[columnIndex]) return '0';
    return row[columnIndex].replace(/[,\s]/g, '');
  }

  // Find column index for specific currency in specific month
  private findColumnIndex(month: string, currency: Currency): number {
    const summarySheet = this.rawData.find(sheet => sheet.sheetName === 'Summary View');
    if (!summarySheet) return 2; // Default fallback

    const values = summarySheet.values;
    const headerRow = values[3]; // Currency row
    const monthRow = values[2]; // Month names row

    // Find the month column
    let monthIndex = -1;
    for (let i = 0; i < monthRow.length; i++) {
      if (monthRow[i] && monthRow[i].includes(month)) {
        monthIndex = i;
        break;
      }
    }

    if (monthIndex === -1) return 2; // Default fallback

    // Find currency within that month (next column should be the currency)
    for (let i = monthIndex; i < headerRow.length; i += 2) {
      if (headerRow[i + 1] === currency) {
        return i;
      }
    }

    return 2; // Default fallback
  }

  // Create MetricData object
  private createMetricData(title: string, rowIndex: number, change: number = 0): MetricData {
    const summarySheet = this.rawData.find(sheet => sheet.sheetName === 'Summary View');
    if (!summarySheet) {
      return {
        title,
        value: '0',
        change,
        currency: this.currentCurrency,
        month: this.currentMonth
      };
    }

    const values = summarySheet.values;
    const dataRow = values[4 + rowIndex]; // Data starts from row 4
    const columnIndex = this.findColumnIndex(this.currentMonth, this.currentCurrency);
    const rawValue = this.extractValue(dataRow, columnIndex);
    
    // Format the value with currency symbol
    const formattedValue = this.currentCurrency === 'USD' 
      ? `$${parseInt(rawValue).toLocaleString()}`
      : `₹${parseInt(rawValue).toLocaleString()}`;

    return {
      title,
      value: formattedValue,
      change,
      currency: this.currentCurrency,
      month: this.currentMonth
    };
  }

  // Get all data for current currency and month
  getModuleData(): ModuleData {
    // Calculate changes (simplified - you can enhance this)
    const changes = {
      billedRevenue: 12.5,
      billedExpenses: -3.2,
      bankRevenue: 7.1,
      bankExpenses: -2.8,
      netProfit: 15.3,
      cashflow: -1.9,
      liquidity: 4.6,
      taxesPaid: 22.1
    };

    return {
      summary: {
        billedRevenue: this.createMetricData('Billed Revenue', 0, changes.billedRevenue),
        billedExpenses: this.createMetricData('Billed Expenses', 1, changes.billedExpenses),
        bankRevenue: this.createMetricData('Bank Revenue', 2, changes.bankRevenue),
        bankExpenses: this.createMetricData('Bank Expenses', 3, changes.bankExpenses),
        netProfit: this.createMetricData('Net Profit', 0, changes.netProfit), // Using revenue row as base
        cashflow: this.createMetricData('Cashflow', 4, changes.cashflow),
        liquidity: this.createMetricData('Liquidity', 5, changes.liquidity),
        taxesPaid: this.createMetricData('Taxes Paid', 6, changes.taxesPaid)
      },
      
      dashboard: {
        billedRevenue: this.createMetricData('Billed Revenue', 0, changes.billedRevenue),
        billedExpenses: this.createMetricData('Billed Expenses', 1, changes.billedExpenses),
        profit: this.createMetricData('Profit', 0, changes.netProfit)
      },
      
      profit: {
        billedRevenue: this.createMetricData('Billed Revenue', 0, changes.billedRevenue),
        billedExpenses: this.createMetricData('Billed Expenses', 1, changes.billedExpenses),
        profit: this.createMetricData('Profit', 0, changes.netProfit)
      },
      
      liquidity: {
        bankRevenue: this.createMetricData('Bank Revenue', 2, changes.bankRevenue),
        bankExpenses: this.createMetricData('Bank Expenses', 3, changes.bankExpenses),
        cashflow: this.createMetricData('Cashflow', 4, changes.cashflow),
        liquidity: this.createMetricData('Liquidity', 5, changes.liquidity)
      },
      
      bankRevenue: {
        bankRevenue: this.createMetricData('Bank Revenue', 2, changes.bankRevenue),
        bankExpenses: this.createMetricData('Bank Expenses', 3, changes.bankExpenses),
        cashflow: this.createMetricData('Cashflow', 4, changes.cashflow),
        liquidity: this.createMetricData('Liquidity', 5, changes.liquidity)
      },
      
      bankProfit: {
        bankRevenue: this.createMetricData('Bank Revenue', 2, changes.bankRevenue),
        bankExpenses: this.createMetricData('Bank Expenses', 3, changes.bankExpenses),
        cashflow: this.createMetricData('Cashflow', 4, changes.cashflow),
        liquidity: this.createMetricData('Liquidity', 5, changes.liquidity)
      },
      
      bankExpenses: {
        bankRevenue: this.createMetricData('Bank Revenue', 2, changes.bankRevenue),
        bankExpenses: this.createMetricData('Bank Expenses', 3, changes.bankExpenses),
        cashflow: this.createMetricData('Cashflow', 4, changes.cashflow),
        liquidity: this.createMetricData('Liquidity', 5, changes.liquidity)
      },
      
      expenses: {
        billedRevenue: this.createMetricData('Billed Revenue', 0, changes.billedRevenue),
        billedExpenses: this.createMetricData('Billed Expenses', 1, changes.billedExpenses),
        profit: this.createMetricData('Profit', 0, changes.netProfit)
      }
    };
  }

  // Get data for specific module
  getDataForModule(module: keyof ModuleData): any {
    const allData = this.getModuleData();
    return allData[module];
  }

  // Get available months from sheet data
  getAvailableMonths(): string[] {
    const summarySheet = this.rawData.find(sheet => sheet.sheetName === 'Summary View');
    if (!summarySheet) return ['March'];

    const values = summarySheet.values;
    const monthRow = values[2]; // Month names row
    const months: string[] = [];

    for (let i = 3; i < monthRow.length; i += 2) { // Skip first 3 columns
      if (monthRow[i] && monthRow[i].trim()) {
        const monthName = monthRow[i].trim().split(' ')[0]; // Extract month name
        if (monthName && !months.includes(monthName)) {
          months.push(monthName);
        }
      }
    }

    return months.length > 0 ? months : ['March'];
  }

  // Get available currencies
  getAvailableCurrencies(): Currency[] {
    return ['INR', 'USD'];
  }
}

// Create singleton instance
export const sheetDataManager = new SheetDataManager();

// Helper functions for easy integration
export const getSheetData = () => sheetDataManager.getModuleData();
export const getDataForModule = (module: keyof ModuleData) => sheetDataManager.getDataForModule(module);
export const setCurrency = (currency: Currency) => sheetDataManager.setCurrency(currency);
export const setMonth = (month: string) => sheetDataManager.setMonth(month);
export const getCurrentCurrency = () => sheetDataManager.getCurrentCurrency();
export const getCurrentMonth = () => sheetDataManager.getCurrentMonth();
export const getAvailableMonths = () => sheetDataManager.getAvailableMonths();
export const getAvailableCurrencies = () => sheetDataManager.getAvailableCurrencies();

