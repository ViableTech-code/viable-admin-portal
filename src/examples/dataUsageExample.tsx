// Example of how to use the centralized data system
import React, { useState } from "react";
import {
  useDashboardData,
  useMetricCards,
  useChartData,
  useFinancialMetrics,
  DataService,
  DataHelpers,
  ComponentDataAdapter,
  Currency,
  RawSheetData,
} from "@/lib";

// Example component showing how to use the data system
export function DataUsageExample() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Load data using the hook
  const { data, loading, error, updateData } = useDashboardData();

  // Get processed metric cards
  const metricCards = useMetricCards(data, selectedCurrency, selectedMonth);

  // Get chart data
  const chartData = useChartData(data, selectedCurrency, [selectedMonth]);

  // Get financial metrics
  const financialMetrics = useFinancialMetrics(
    data,
    selectedCurrency,
    selectedMonth
  );

  // Example of loading data from API
  const handleLoadData = async () => {
    const dataService = DataService.getInstance();
    const refreshedData = await dataService.refreshData();
  };

  // Example of manual data update
  const handleManualDataUpdate = (rawSheetData: RawSheetData[]) => {
    updateData(rawSheetData);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data System Usage Example</h1>

      {/* Currency Selector */}
      <div className="mb-4">
        <label className="mr-2">Currency:</label>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
        >
          <option value="USD">USD</option>
          <option value="INR">INR</option>
        </select>
      </div>

      {/* Metric Cards Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((card, index) => {
          const adaptedCard = ComponentDataAdapter.adaptMetricCardData(card);
          return (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{adaptedCard.title}</h3>
              <p className="text-2xl font-bold">{adaptedCard.value}</p>
              <p
                className={`text-sm ${
                  card.isPositiveChange ? "text-green-600" : "text-red-600"
                }`}
              >
                {card.changePercentage}
              </p>
            </div>
          );
        })}
      </div>

      {/* Financial Metrics Example */}
      {financialMetrics && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Financial Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Revenue</h3>
              <p>Billed: {financialMetrics.summary.formattedValue}</p>
              <p>Bank: {financialMetrics.summary.formattedValue}</p>
              <p>Total: {financialMetrics.summary.formattedValue}</p>
            </div>
            <div>
              <h3 className="font-semibold">Expenses</h3>
              <p>Billed: {financialMetrics.summary.formattedValue}</p>
              <p>Bank: {financialMetrics.summary.formattedValue}</p>
              <p>Total: {financialMetrics.summary.formattedValue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Data Example */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Monthly Trends</h2>
        <div className="grid grid-cols-4 gap-4">
          {chartData.slice(-4).map((point, index) => (
            <div key={index} className="p-4 border rounded">
              <h4 className="font-semibold">{point.month}</h4>
              <p>Revenue: {point.revenue}</p>
              <p>Expenses: {point.expenses}</p>
              <p>Profit: {point.profit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Analysis Examples */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Data Analysis</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Top Performing Metrics</h3>
            {DataHelpers.getTopMetrics(metricCards).map((metric, index) => (
              <p key={index} className="text-sm">
                {metric.title}: {metric.changePercentage}
              </p>
            ))}
          </div>
          <div>
            <h3 className="font-semibold">Growth Analysis</h3>
            {chartData.length >= 2 && (
              <>
                <p>
                  Month-over-Month Growth:{" "}
                  {DataHelpers.getMonthOverMonthGrowth(
                    chartData,
                    "revenue"
                  ).toFixed(1)}
                  %
                </p>
                <p>
                  Year-over-Year Growth:{" "}
                  {DataHelpers.getYearOverYearGrowth(
                    chartData,
                    "revenue"
                  ).toFixed(1)}
                  %
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-x-4">
        <button
          onClick={handleLoadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
        <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Log Data
        </button>
      </div>
    </div>
  );
}

// Example of how to integrate with existing components
export function UpdatedSummaryComponent() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Use the centralized data system
  const { data } = useDashboardData();
  const metricCards = useMetricCards(data, selectedCurrency, selectedMonth);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Your existing DashboardHeader component */}

      <div className="max-w-7xl mx-auto p-6">
        {/* Your existing ViewTabs component */}

        {/* Updated Metrics Grid using centralized data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {metricCards.map((card, index) => {
            const adaptedCard = ComponentDataAdapter.adaptMetricCardData(card);
            return (
              <div key={index} className="space-y-6">
                <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">
                    {adaptedCard.title}
                  </h3>
                  <p className="text-3xl font-bold mb-2">{adaptedCard.value}</p>
                  <p
                    className={`text-sm font-medium ${
                      card.isPositiveChange ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.changePercentage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Example of how to create custom data queries
export function CustomDataQueryExample() {
  const { data, queryData } = useDashboardData();

  // Example custom queries
  const usdData = queryData({ currency: "USD" });
  const lastThreeMonths = queryData({
    months: [
      new Date(2024, 10), // November
      new Date(2024, 11), // December
      new Date(2025, 0), // January
    ],
  });

  const topMetrics = queryData({
    sortBy: "value",
    sortOrder: "desc",
    limit: 5,
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Custom Data Queries</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">USD Data Only</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(usdData?.summary, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Last 3 Months</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(lastThreeMonths?.monthlyTrends, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
