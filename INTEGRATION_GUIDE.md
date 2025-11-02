# Integration Guide - Centralized Data System

## Overview
This guide shows how to integrate the centralized data system with your existing Summary page and other components. The system is designed to work with your Google Sheets data structure that already contains both USD and INR data in separate columns.

## Key Features
- ✅ **No Currency Conversion Needed**: Uses existing USD/INR data from Google Sheets
- ✅ **Percentage Data**: Extracts percentage changes from existing data
- ✅ **8 Metric Cards**: Exactly matches your Summary page requirements
- ✅ **Easy Integration**: Drop-in replacement for existing components

## Files Created

### 1. Core Data System
- `src/lib/dataTypes.ts` - TypeScript interfaces
- `src/lib/dataParser.ts` - Main data parser
- `src/lib/dataUtils.ts` - Utility functions
- `src/lib/dataIntegration.ts` - React hooks and integration helpers
- `src/lib/sheetDataLoader.ts` - **NEW**: Simplified sheet data loader
- `src/lib/index.ts` - Main exports

### 2. Integration Examples
- `src/pages/SummaryIntegrated.tsx` - **NEW**: Updated Summary page with data integration
- `src/examples/dataUsageExample.tsx` - Usage examples
- `src/pages/SummaryUpdated.tsx` - Alternative implementation

## Quick Integration Steps

### Step 1: Replace Your Summary Component
Replace your existing `src/pages/Summary.tsx` with the new integrated version:

```bash
# Backup your existing Summary.tsx
mv src/pages/Summary.tsx src/pages/Summary.tsx.backup

# Use the new integrated version
mv src/pages/SummaryIntegrated.tsx src/pages/Summary.tsx
```

### Step 2: Update Your Data Loading
The new system automatically loads data from localStorage (where your Google Sheets API stores data):

```typescript
// Your existing Google Sheets API code should store data like this:
localStorage.setItem("sheetData", JSON.stringify(sheetData));
```

### Step 3: Test the Integration
1. Make sure your Google Sheets API is storing data in localStorage
2. The system will automatically detect and use this data
3. If no data is found, it falls back to sample data for demonstration

## How It Works

### Data Flow
1. **Google Sheets API** → Stores data in localStorage
2. **SheetDataLoader** → Parses the sheet data structure
3. **Summary Component** → Displays the 8 metric cards
4. **Currency Toggle** → Switches between USD/INR data

### The 8 Metric Cards
The system extracts exactly these 8 metrics from your Google Sheets:

1. **Billed Revenue** - From row 0 of your sheet
2. **Billed Expenses** - From row 1 of your sheet  
3. **Bank Revenue** - From row 2 of your sheet
4. **Bank Expenses** - From row 3 of your sheet
5. **Net Profit** - Calculated (Revenue - Expenses)
6. **Cashflow** - From row 4 of your sheet
7. **Liquidity** - From row 5 of your sheet
8. **Taxes Paid** - From row 6 of your sheet

### Percentage Calculations
The system automatically calculates month-over-month percentage changes:
- **Green** for positive changes (+X.X%)
- **Red** for negative changes (-X.X%)

## Code Examples

### Basic Usage
```typescript
import { SheetDataLoader } from '@/lib';

// Load data from localStorage
const rawData = JSON.parse(localStorage.getItem("sheetData") || "[]");
const metrics = SheetDataLoader.getDataForCurrency(rawData, "USD");

// Use in your component
metrics.forEach(metric => {
  console.log(`${metric.title}: ${metric.formattedValue} (${metric.changePercentage})`);
});
```

### Currency Switching
```typescript
const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "INR">("USD");

// Data automatically updates when currency changes
const metrics = SheetDataLoader.getDataForCurrency(rawData, selectedCurrency);
```

### Integration with Existing Components
```typescript
// Your existing MetricCard component works as-is
<MetricCard
  title={metric.title}
  value={metric.formattedValue}
  change={metric.change}
  isHighlighted={metric.title === "Billed Revenue"}
  onClick={() => navigate('/billed-revenue')}
/>
```

## Data Structure Expected

Your Google Sheets data should be in this format (which matches your sample.json):

```json
{
  "sheetName": "Summary View",
  "values": [
    ["", "Summary View (Values)", "Totals", "", "April", "May", ...],
    ["", "Summary View (Values)", "Totals", "", "April 2025", "May 2025", ...],
    ["Currency", "INR", "USD", "INR", "USD", "INR", "USD", ...],
    ["Billed Revenue", "26,085,640", "296,428", "4,938,714", "56,122", ...],
    ["Billed Expenses", "14,996,095", "170,410", "3,152,360", "35,822", ...],
    ["Bank Revenue", "2,500,000", "28,409", "1,500,000", "17,045", ...],
    ["Bank Expenses", "1,200,000", "13,636", "800,000", "9,091", ...],
    ["Cashflow", "8,000,000", "90,909", "6,000,000", "68,182", ...],
    ["Liquidity", "15,000,000", "170,455", "12,000,000", "136,364", ...],
    ["Taxes Paid", "500,000", "5,682", "400,000", "4,545", ...]
  ]
}
```

## Troubleshooting

### Data Not Loading
- Check if `localStorage.getItem("sheetData")` returns data
- Verify your Google Sheets API is storing data correctly
- Check browser console for errors

### Currency Not Switching
- Ensure your sheet has both USD and INR columns
- Check that currency detection is working in the sheet

### Percentage Calculations Wrong
- Verify your sheet has multiple months of data
- Check that the month indexing is correct

## Next Steps

1. **Test with Real Data**: Connect your Google Sheets API
2. **Customize Metrics**: Modify `SheetDataLoader` to extract additional metrics
3. **Add More Views**: Use the same system for Billing and Bank views
4. **Enhance Charts**: Integrate with existing chart components

## Benefits

- ✅ **No Data Conversion**: Uses existing USD/INR data directly
- ✅ **Automatic Percentages**: Calculates changes from sheet data
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Easy Integration**: Works with existing components
- ✅ **Maintainable**: Centralized data logic
- ✅ **Extensible**: Easy to add new metrics or views

The system is ready to use and will automatically work with your existing Google Sheets data structure!

