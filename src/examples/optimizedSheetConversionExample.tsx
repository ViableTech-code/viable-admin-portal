import React, { useState, useEffect } from "react";
import { transformGoogleSheet } from "../lib/sheet-conversion";
import { SheetData, getGoogleSheetData } from "../helper/sheetAPIs";
import { FormattedModel } from "../lib/sheet-conversion";

export const OptimizedSheetConversionExample: React.FC = () => {
  const [formattedData, setFormattedData] = useState<FormattedModel | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAndTransformData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch raw sheet data
      const rawSheets = await getGoogleSheetData();

      // Transform using the optimized function
      const transformed = await transformGoogleSheet(rawSheets);

      setFormattedData(transformed);
      console.log("✅ Data transformation completed successfully!");
      console.log("Transformed data:", transformed);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("❌ Error during data transformation:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderDataSummary = () => {
    if (!formattedData) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Summary</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h4 className="font-medium">Summary Items</h4>
            <p className="text-sm text-gray-600">
              {formattedData.summary.length} items
            </p>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-medium">Billing Revenue</h4>
            <p className="text-sm text-gray-600">
              {formattedData.billingView.billedRevenue.clientsByRevenue.length}{" "}
              clients
            </p>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-medium">Billing Expenses</h4>
            <p className="text-sm text-gray-600">
              {
                formattedData.billingView.billedExpenses.expensesCategories
                  .length
              }{" "}
              categories
            </p>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-medium">Bank Revenue</h4>
            <p className="text-sm text-gray-600">
              {formattedData.bankView.bankRevenue.topClientByRevenue.length}{" "}
              clients
            </p>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-medium">Bank Expenses</h4>
            <p className="text-sm text-gray-600">
              {formattedData.bankView.bankExpenses.expensesCategories.length}{" "}
              categories
            </p>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-medium">Liquidity</h4>
            <p className="text-sm text-gray-600">
              {formattedData.bankView.liquidity.length} items
            </p>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h4 className="font-medium">Profit Data</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-sm">Billing Profit Revenue Chart:</p>
              <p className="text-xs text-gray-600">
                {formattedData.billingView.billingViewProfit
                  .revenueExpensesChart.billedRevenue?.length || 0}{" "}
                months
              </p>
            </div>
            <div>
              <p className="text-sm">Billing Profit Clients:</p>
              <p className="text-xs text-gray-600">
                {
                  formattedData.billingView.billingViewProfit
                    .clientWiseProfitability.length
                }{" "}
                clients
              </p>
            </div>
            <div>
              <p className="text-sm">Bank Cashflow Revenue Chart:</p>
              <p className="text-xs text-gray-600">
                {formattedData.bankView.cashflow.revenueExpensesChart
                  .bankRevenue?.length || 0}{" "}
                months
              </p>
            </div>
            <div>
              <p className="text-sm">Bank Cashflow Clients:</p>
              <p className="text-xs text-gray-600">
                {formattedData.bankView.cashflow.clientWiseProfitability.length}{" "}
                clients
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Optimized Sheet Conversion Example
      </h2>

      <div className="mb-6">
        <button
          onClick={loadAndTransformData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load & Transform Data"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-medium">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {formattedData && renderDataSummary()}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-medium mb-2">Key Improvements:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Modularized into smaller, reusable functions</li>
          <li>✅ Better error handling and validation</li>
          <li>✅ Complete data parsing for all fields</li>
          <li>✅ Cleaner, more maintainable code structure</li>
          <li>✅ Proper TypeScript typing throughout</li>
        </ul>
      </div>
    </div>
  );
};

export default OptimizedSheetConversionExample;
