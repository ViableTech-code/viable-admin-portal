import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ViewTabs } from "@/components/dashboard/ViewTabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { TopClients } from "@/components/dashboard/TopClients";
import { InvoicingBreakdown } from "@/components/dashboard/InvoicingBreakdown";
import { useGlobalState } from "@/context/GlobalStateContext";
import { monthStringToDate } from "@/lib/utils";
import { dataService, SummaryMetric } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";
import CommanBankHeader from "@/components/dashboard/CommonBankHeader";

export default function BankRevenue() {
  const { selectedMonth, selectedCurrency } = useGlobalState();
  const [activeView, setActiveView] = useState("bank");
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetric[]>([]);
  const navigate = useNavigate();

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === "billing") {
      navigate("/billed-revenue");
    } else if (view === "summary") {
      navigate("/summary");
    }
  };

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
        <CommanBankHeader summaryMetrics={summaryMetrics} dataService={dataService} navigate={navigate} />

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Monthly Revenue Chart */}
          <MonthlyRevenueChart
            selectedMonth={monthStringToDate(selectedMonth)}
            type="bank"
            selectedCurrency={selectedCurrency}
          />

          {/* Top Clients by Revenue with Pie Chart */}
          <TopClients
            selectedCurrency={selectedCurrency}
            selectedMonth={selectedMonth}
            type="bank"
          />

          {/* Revenue Type Breakdown with Bar Chart */}
          <InvoicingBreakdown
            selectedCurrency={selectedCurrency}
            selectedMonth={selectedMonth}
            type="bank"
          />
        </div>
      </div>
    </div>
  );
}
