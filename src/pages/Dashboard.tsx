import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ViewTabs } from "@/components/dashboard/ViewTabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InvoicingBreakdown } from "@/components/dashboard/InvoicingBreakdown";
import { TopClients } from "@/components/dashboard/TopClients";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { OutstandingRevenueTable } from "@/components/dashboard/OutstandingRevenueTable";
import { getGoogleSheetData } from "@/helper/sheetAPIs";
import { dataService, SummaryMetric } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";
import { useGlobalState } from "@/context/GlobalStateContext";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("billing");
  const { selectedMonth, selectedCurrency } = useGlobalState();
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetric[]>([]);
  const navigate = useNavigate();

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === "bank") {
      navigate("/bank-revenue");
    } else if (view === "summary") {
      navigate("/summary");
    }
  };
  useEffect(() => {
    (async () => {
      const data = await getGoogleSheetData();
      // formatting to localStorage is handled elsewhere before navigation
    })();
  }, []);

  // keep data service in sync with UI state
  useEffect(() => {
    dataService.setCurrency(
      selectedCurrency === "USD" ? Currency.USD : Currency.INR
    );
    dataService.setMonth(selectedMonth);
    setSummaryMetrics(dataService.getSummaryMetrics());
  }, [selectedCurrency, selectedMonth]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto p-6">
        <ViewTabs activeView={activeView} onViewChange={handleViewChange} />

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {summaryMetrics.length > 0 && (
            <MetricCard
              title={summaryMetrics[0].label}
              value={dataService.formatCurrency(summaryMetrics[0].value)}
              change={summaryMetrics[0].change}
              isHighlighted={true}
            />
          )}
          {summaryMetrics.length > 1 && (
            <MetricCard
              title={summaryMetrics[1].label}
              value={dataService.formatCurrency(summaryMetrics[1].value)}
              change={summaryMetrics[1].change}
              onClick={() => navigate("/billed-expenses")}
            />
          )}
          {summaryMetrics.length > 2 && (
            <MetricCard
              title={summaryMetrics[2].label}
              value={dataService.formatCurrency(summaryMetrics[2].value)}
              change={summaryMetrics[2].change}
              onClick={() => navigate("/billed-profit")}
            />
          )}
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Monthly Revenue Chart */}
          {/* For highlight we don't rely on Date anymore; chart shows series */}
          <MonthlyRevenueChart
            selectedMonth={new Date()}
            selectedCurrency={selectedCurrency}
          />

          {/* Top Clients by Revenue with Pie Chart */}
          {/* Passing selectedCurrency and selectedMonth to refresh on change */}
          <TopClients
            selectedCurrency={selectedCurrency}
            selectedMonth={selectedMonth}
          />

          {/* Invoicing Breakdown with Bar Chart */}
          <InvoicingBreakdown
            selectedCurrency={selectedCurrency}
            selectedMonth={selectedMonth}
          />

          {/* Outstanding Revenue Table */}
          <OutstandingRevenueTable
            selectedCurrency={selectedCurrency}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>
    </div>
  );
}
