import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ViewTabs } from "@/components/dashboard/ViewTabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { dataService, SummaryMetric, MonthOption } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";
import { useGlobalState } from "@/context/GlobalStateContext";

export default function Summary() {
  const { selectedMonth, selectedCurrency } = useGlobalState();
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetric[]>([]);
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
  const [selectedMonthFilter, setSelectedMonthFilter] =
    useState<string>("total");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigate = useNavigate();

  // Load data and set up currency/month filtering
  useEffect(() => {
    // Set currency in data service
    dataService.setCurrency(
      selectedCurrency === "USD" ? Currency.USD : Currency.INR
    );

    // Set month filter in data service
    dataService.setMonth(selectedMonth);

    // Get available months
    const months = dataService.getAvailableMonths();
    setAvailableMonths(months);

    // Get summary metrics
    const metrics = dataService.getSummaryMetrics();
    const sortedMetrics =
      metrics && metrics.length
        ? metrics.sort((a, b) => a.sorting - b.sorting)
        : [];
    setSummaryMetrics(sortedMetrics);

    setIsDataLoaded(dataService.isDataAvailable());
  }, [selectedCurrency, selectedMonth]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto p-6">
        <ViewTabs
          activeView="summary"
          onViewChange={(view) => {
            if (view === "billing") {
              navigate("/billed-revenue");
            } else if (view === "bank") {
              navigate("/bank-revenue");
            }
          }}
        />

        {/* Data Status */}
        {!isDataLoaded && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p>
              No data available. Please ensure the Google Sheet data has been
              loaded and processed.
            </p>
          </div>
        )}

        {/* Billing Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Billing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryMetrics.slice(0, 4).map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.label}
                value={dataService.formatCurrency(metric.value)}
                change={metric.change}
                // isHighlighted={metric.isHighlighted}
                onClick={() => {
                  if (metric.title === "Billed Revenue")
                    navigate("/billed-revenue");
                  if (metric.title === "Billed Expenses")
                    navigate("/billed-expenses");
                  if (metric.title === "Billed Profit")
                    navigate("/billed-profit");
                }}
              />
            ))}
          </div>
        </div>

        {/* Bank Section */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">Bank</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryMetrics.slice(4, 8).map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.label}
                value={dataService.formatCurrency(metric.value)}
                change={metric.change}
                onClick={() => {
                  if (metric.title === "Bank Revenue")
                    navigate("/billed-revenue");
                  if (metric.title === "Bank Expenses")
                    navigate("/bank-expenses");
                }}
              />
            ))}
          </div>
        </div>

        {/* Liquidity Section */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Liquidity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryMetrics.slice(8, 9).map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={dataService.formatCurrency(metric.value)}
                change={metric.change}
                onClick={() => {
                  if (metric.title === "Liquidity") navigate("/liquidity");
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
