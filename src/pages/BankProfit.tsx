import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ViewTabs } from "@/components/dashboard/ViewTabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CashflowChart } from "@/components/dashboard/CashflowChart";
import { FinancialSnapshot } from "@/components/dashboard/FinancialSnapshot";
import { useGlobalState } from "@/context/GlobalStateContext";
import { monthStringToDate } from "@/lib/utils";
import { dataService, SummaryMetric } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";
import { ClientProfitabilityBank } from "@/components/dashboard/ClientProfitabilityBank";
import CommanBankHeader from "@/components/dashboard/CommonBankHeader";

export default function BankProfit() {
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
        <CommanBankHeader
          summaryMetrics={summaryMetrics}
          dataService={dataService}
          navigate={navigate}
        />
        {/* Cashflow Content */}
        <div className="space-y-6">
          <CashflowChart
            selectedMonth={selectedMonth}
            selectedCurrency={selectedCurrency}
          />
          <FinancialSnapshot
            selectedMonth={selectedMonth}
            selectedCurrency={selectedCurrency}
          />
          <ClientProfitabilityBank
            selectedMonth={selectedMonth}
            selectedCurrency={selectedCurrency}
          />
        </div>
      </div>
    </div>
  );
}
