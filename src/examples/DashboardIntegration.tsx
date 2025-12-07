// Example of how to integrate data into Dashboard.tsx
// This shows how simple it is to add data to any existing component

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ViewTabs } from "@/components/dashboard/ViewTabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InvoicingBreakdown } from "@/components/dashboard/InvoicingBreakdown";
import { TopClients } from "@/components/dashboard/TopClients";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { OutstandingRevenueTable } from "@/components/dashboard/OutstandingRevenueTable";
import { useDashboardData, type Currency } from "@/lib";

export default function DashboardWithData() {
  const [activeView, setActiveView] = useState("billing");
  const [selectedMonth, setSelectedMonth] = useState("total");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const navigate = useNavigate();

  // Get dashboard data using the hook
  const {
    data: dashboardData,
    loading,
    error,
  } = useDashboardData(selectedCurrency, "March");

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === "bank") {
      navigate("/bank-revenue");
    } else if (view === "summary") {
      navigate("/summary");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto p-6">
        <ViewTabs activeView={activeView} onViewChange={handleViewChange} />

        {/* Top Metrics Row - Now with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title={dashboardData?.billedRevenue?.title || "Billed Revenue"}
            label={dashboardData?.billedRevenue?.label || "Revenue"}
            value={dashboardData?.billedRevenue?.value || "$$$"}
            change={dashboardData?.billedRevenue?.change || 12.5}
            isHighlighted={true}
          />
          <MetricCard
            title={dashboardData?.billedExpenses?.title || "Billed Expenses"}
            label={dashboardData?.billedExpenses?.label || "Expenses"}
            value={dashboardData?.billedExpenses?.value || "$$$"}
            change={dashboardData?.billedExpenses?.change || -3.2}
            onClick={() => navigate("/billed-expenses")}
          />
          <MetricCard
            title={dashboardData?.profit?.title || "Profit"}
            label={dashboardData?.profit?.label || "Profit"}
            value={dashboardData?.profit?.value || "$$$"}
            change={dashboardData?.profit?.change || 8.7}
            onClick={() => navigate("/billed-profit")}
          />
        </div>

        {/* Main Content Grid - Existing components work as-is */}
        <div className="space-y-6">
          <MonthlyRevenueChart
            selectedMonth={new Date()}
            selectedCurrency={selectedCurrency}
          />
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
