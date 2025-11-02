import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ViewTabs } from "@/components/dashboard/ViewTabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MonthlyExpensesChart } from "@/components/dashboard/MonthlyExpensesChart";
import { ExpenseCategories } from "@/components/dashboard/ExpenseCategories";
import { useGlobalState } from "@/context/GlobalStateContext";
import { monthStringToDate } from "@/lib/utils";
import { dataService, SummaryMetric } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";

export default function Expenses() {
  const { selectedMonth, selectedCurrency } = useGlobalState();
  const [activeView, setActiveView] = useState("billing");
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
          {(() => {
            const m = summaryMetrics.find((x) => x.title === "Billed Revenue");
            if (!m) {
              return (
                <MetricCard
                  title="Revenue"
                  value="$$$"
                  change={0}
                  onClick={() => navigate("/billed-revenue")}
                />
              );
            }
            return (
              <MetricCard
                title={m.label}
                value={dataService.formatCurrency(m.value)}
                change={m.change}
                onClick={() => navigate("/billed-revenue")}
              />
            );
          })()}

          {(() => {
            const m = summaryMetrics.find((x) => x.title === "Billed Expenses");
            if (!m) {
              return (
                <MetricCard
                  title="Expenses"
                  value="$$$"
                  change={0}
                  isHighlighted={true}
                />
              );
            }
            return (
              <MetricCard
                title={m.label}
                value={dataService.formatCurrency(m.value)}
                change={m.change}
                isHighlighted={true}
              />
            );
          })()}

          {(() => {
            const m = summaryMetrics.find((x) => x.title === "Billed Profit");
            if (!m) {
              return (
                <MetricCard
                  title="Profit"
                  value="$$$"
                  change={0}
                  onClick={() => navigate("/billed-profit")}
                />
              );
            }
            return (
              <MetricCard
                title={m.label}
                value={dataService.formatCurrency(m.value)}
                change={m.change}
                onClick={() => navigate("/billed-profit")}
              />
            );
          })()}
        </div>

        {/* Expenses Content */}
        <div className="space-y-6">
          {/* Monthly Expenses Chart */}
          <MonthlyExpensesChart
            selectedMonth={selectedMonth}
            selectedCurrency={selectedCurrency}
          />

          {/* Expense Categories with Donut Chart */}
          <ExpenseCategories
            selectedCurrency={selectedCurrency}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>
    </div>
  );
}
