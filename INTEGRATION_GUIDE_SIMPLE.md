# Simple Data Integration Guide

## Overview
This guide shows how to integrate the simple, robust data system with your existing components. The system extracts data directly from your `sample.json` Google Sheets structure without any conversions or calculations.

## Key Features
- ✅ **Direct Data Extraction**: Uses existing USD/INR data from Google Sheets
- ✅ **No Conversions**: No currency conversion or calculations needed
- ✅ **Simple Integration**: One-line hook integration
- ✅ **Works with Existing Components**: Drop-in replacement for hardcoded data
- ✅ **Supports All Modules**: Summary, Dashboard, Profit, Liquidity, Bank views, etc.

## Files Created

### Core System
- `src/lib/sheetData.ts` - Main data structure and manager
- `src/lib/useSheetData.ts` - React hooks for easy integration
- `src/lib/index.ts` - Updated exports

### Integration Examples
- `src/pages/Summary.tsx` - **UPDATED**: Now uses real data
- `src/examples/DashboardIntegration.tsx` - Example for Dashboard integration

## How to Integrate

### Step 1: Import the Hook
```typescript
import { useSummaryData, useDashboardData, useProfitData, etc. } from "@/lib";
```

### Step 2: Use the Hook in Your Component
```typescript
const { data, loading, error } = useSummaryData(selectedCurrency, 'March');
```

### Step 3: Replace Hardcoded Values
```typescript
// Before
<MetricCard title="Billed Revenue" value="$$$" change={12.5} />

// After
<MetricCard 
  title={data?.billedRevenue?.title || "Billed Revenue"}
  value={data?.billedRevenue?.value || "$$$"}
  change={data?.billedRevenue?.change || 12.5}
/>
```

## Available Hooks

### For Each Module
```typescript
// Summary page (8 cards)
const { data } = useSummaryData(currency, month);

// Dashboard page (3 cards)
const { data } = useDashboardData(currency, month);

// Profit page (3 cards)
const { data } = useProfitData(currency, month);

// Liquidity page (4 cards)
const { data } = useLiquidityData(currency, month);

// Bank Revenue page (4 cards)
const { data } = useBankRevenueData(currency, month);

// Bank Profit page (4 cards)
const { data } = useBankProfitData(currency, month);

// Bank Expenses page (4 cards)
const { data } = useBankExpensesData(currency, month);

// Expenses page (3 cards)
const { data } = useExpensesData(currency, month);
```

### Generic Hook
```typescript
const { data, loading, error } = useSheetData({ 
  module: 'summary', 
  currency: 'USD', 
  month: 'March' 
});
```

## Integration Examples

### Summary.tsx (Already Updated)
```typescript
import { useSummaryData } from "@/lib";

export default function Summary() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const { data: summaryData, loading, error } = useSummaryData(selectedCurrency, 'March');

  return (
    <div>
      <MetricCard
        title={summaryData?.billedRevenue?.title || "Billed Revenue"}
        value={summaryData?.billedRevenue?.value || "$$$"}
        change={summaryData?.billedRevenue?.change || 12.5}
      />
    </div>
  );
}
```

### Dashboard.tsx Integration
```typescript
import { useDashboardData } from "@/lib";

export default function Dashboard() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const { data: dashboardData, loading, error } = useDashboardData(selectedCurrency, 'March');

  return (
    <div>
      <MetricCard
        title={dashboardData?.billedRevenue?.title || "Billed Revenue"}
        value={dashboardData?.billedRevenue?.value || "$$$"}
        change={dashboardData?.billedRevenue?.change || 12.5}
      />
      <MetricCard
        title={dashboardData?.billedExpenses?.title || "Billed Expenses"}
        value={dashboardData?.billedExpenses?.value || "$$$"}
        change={dashboardData?.billedExpenses?.change || -3.2}
      />
      <MetricCard
        title={dashboardData?.profit?.title || "Profit"}
        value={dashboardData?.profit?.value || "$$$"}
        change={dashboardData?.profit?.change || 8.7}
      />
    </div>
  );
}
```

### Profit.tsx Integration
```typescript
import { useProfitData } from "@/lib";

export default function Profit() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const { data: profitData, loading, error } = useProfitData(selectedCurrency, 'March');

  return (
    <div>
      <MetricCard
        title={profitData?.billedRevenue?.title || "Billed Revenue"}
        value={profitData?.billedRevenue?.value || "$$$"}
        change={profitData?.billedRevenue?.change || 12.5}
      />
      <MetricCard
        title={profitData?.billedExpenses?.title || "Billed Expenses"}
        value={profitData?.billedExpenses?.value || "$$$"}
        change={profitData?.billedExpenses?.change || -3.2}
      />
      <MetricCard
        title={profitData?.profit?.title || "Profit"}
        value={profitData?.profit?.value || "$$$"}
        change={profitData?.profit?.change || 8.7}
        isHighlighted={true}
      />
    </div>
  );
}
```

### Liquidity.tsx Integration
```typescript
import { useLiquidityData } from "@/lib";

export default function Liquidity() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const { data: liquidityData, loading, error } = useLiquidityData(selectedCurrency, 'March');

  return (
    <div>
      <MetricCard
        title={liquidityData?.bankRevenue?.title || "Bank Revenue"}
        value={liquidityData?.bankRevenue?.value || "$$$"}
        change={liquidityData?.bankRevenue?.change || 9.2}
      />
      <MetricCard
        title={liquidityData?.bankExpenses?.title || "Bank Expenses"}
        value={liquidityData?.bankExpenses?.value || "$$$"}
        change={liquidityData?.bankExpenses?.change || -4.1}
      />
      <MetricCard
        title={liquidityData?.cashflow?.title || "Cashflow"}
        value={liquidityData?.cashflow?.value || "$$$"}
        change={liquidityData?.cashflow?.change || 11.8}
      />
      <MetricCard
        title={liquidityData?.liquidity?.title || "Liquidity"}
        value={liquidityData?.liquidity?.value || "$$$"}
        change={liquidityData?.liquidity?.change || 6.3}
        isHighlighted={true}
      />
    </div>
  );
}
```

## Data Structure

### What Each Hook Returns
```typescript
interface HookResult {
  data: {
    // Module-specific metrics
    metricName: {
      title: string;      // e.g., "Billed Revenue"
      value: string;      // e.g., "$296,428" or "₹26,085,640"
      change: number;     // e.g., 12.5
      currency: 'USD' | 'INR';
      month: string;      // e.g., "March"
    };
  };
  loading: boolean;
  error: string | null;
}
```

### Available Metrics by Module
- **Summary**: billedRevenue, billedExpenses, bankRevenue, bankExpenses, netProfit, cashflow, liquidity, taxesPaid
- **Dashboard**: billedRevenue, billedExpenses, profit
- **Profit**: billedRevenue, billedExpenses, profit
- **Liquidity**: bankRevenue, bankExpenses, cashflow, liquidity
- **Bank Revenue**: bankRevenue, bankExpenses, cashflow, liquidity
- **Bank Profit**: bankRevenue, bankExpenses, cashflow, liquidity
- **Bank Expenses**: bankRevenue, bankExpenses, cashflow, liquidity
- **Expenses**: billedRevenue, billedExpenses, profit

## How It Works

1. **Data Source**: Uses your existing Google Sheets API (`getGoogleSheetData()`)
2. **Currency Support**: Automatically extracts USD/INR data from separate columns
3. **Month Support**: Extracts data for specific months (defaults to March)
4. **No Conversions**: Direct extraction without any calculations
5. **Fallback Values**: Graceful fallback to hardcoded values if data unavailable

## Loading and Error States

```typescript
const { data, loading, error } = useSummaryData(currency, month);

if (loading) {
  return <div>Loading...</div>;
}

if (error) {
  return <div>Error: {error}</div>;
}

// Use data
return <MetricCard title={data?.billedRevenue?.title} value={data?.billedRevenue?.value} />;
```

## Benefits

- ✅ **Simple**: One-line integration
- ✅ **Robust**: Handles loading and error states
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **No Conversions**: Uses existing USD/INR data directly
- ✅ **Flexible**: Works with any currency/month combination
- ✅ **Maintainable**: Centralized data logic
- ✅ **Backward Compatible**: Existing components work as-is

## Quick Start

1. **Import the hook** for your module
2. **Replace hardcoded values** with data from the hook
3. **Add loading/error handling** (optional)
4. **Test with your Google Sheets data**

The system is ready to use and will automatically work with your existing Google Sheets data structure!

