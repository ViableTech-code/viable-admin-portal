import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { dataService } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";

interface MonthlyRevenueChartProps {
  selectedMonth: Date;
  type?: string;
  selectedCurrency: string;
}

interface MonthData {
  month: string;
  shortMonth: string;
  revenue: number;
  date: Date;
}

export function MonthlyRevenueChart({
  selectedMonth,
  type,
  selectedCurrency,
}: MonthlyRevenueChartProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  // Pull from data service (already filtered by currency)
  const monthlyData: MonthData[] = useMemo(() => {
    if (type == "bank") {
      return dataService
        .getBankMonthlyRevenueSeries(selectedCurrency)
        .map((d) => ({
          month: d.month.charAt(0).toUpperCase() + d.month.slice(1),
          shortMonth: d.shortMonth,
          revenue: d.revenue,
          date: d.date,
        }))
        .filter((item) => item.shortMonth !== "Total");
    }
    return dataService
      .getBillingMonthlyRevenueSeries(selectedCurrency)
      .map((d) => ({
        month: d.month.charAt(0).toUpperCase() + d.month.slice(1),
        shortMonth: d.shortMonth,
        revenue: d.revenue,
        date: d.date,
      }))
      .filter((item) => item.shortMonth !== "Total");
  }, [type, selectedCurrency]);
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  const isSelectedMonth = (date: Date) => {
    return (
      selectedMonth.getMonth() === date.getMonth() &&
      selectedMonth.getFullYear() === date.getFullYear()
    );
  };

  const formatRevenue = (revenue: number) => {
    let rev: string = `${revenue}`;
    if (revenue >= 1000000) {
      rev = `${(revenue / 1000000).toFixed(1)}M`;
    } else if (revenue >= 1000) {
      rev = `${(revenue / 1000).toFixed(0)}K`;
    }
    return selectedCurrency == Currency.INR ? `₹${rev}` : `$${rev}`;
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Monthly Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Monthly Bar Chart */}
          <div className="w-full max-w-4xl">
            <div className="flex items-end justify-between h-32 px-4">
              {monthlyData.map((data, index) => {
                const isSelected = isSelectedMonth(data.date);
                const barHeight = (data.revenue / maxRevenue) * 100;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `${data.month}: ${formatRevenue(
                          data.revenue
                        )}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                      });
                    }}
                    onMouseLeave={() =>
                      setTooltip((prev) => ({ ...prev, visible: false }))
                    }
                  >
                    <div
                      className={`w-6 rounded-t transition-all duration-300 ${
                        isSelected ? "animate-cosmic-glow" : "hover:opacity-80"
                      }`}
                      style={{
                        height: `${Math.max(barHeight, 8)}px`,
                        background: isSelected
                          ? `linear-gradient(to top, hsl(var(--chart-1)), hsl(var(--chart-1) / 0.8))`
                          : `hsl(var(--chart-${(index % 5) + 1}) / 0.6)`,
                        boxShadow: isSelected
                          ? `0 0 25px hsl(var(--chart-1) / 0.4), 0 0 50px hsl(var(--chart-1) / 0.15)`
                          : "none",
                      }}
                    ></div>
                    <span
                      className={`text-xs mt-2 transition-colors ${
                        isSelected
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {data.shortMonth.toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="fixed z-50 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltip.content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
