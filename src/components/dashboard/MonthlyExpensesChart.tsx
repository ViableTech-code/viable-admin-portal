import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { dataService } from "@/lib/dataService";

interface MonthlyExpensesChartProps {
  selectedMonth: string;
  selectedCurrency: string;
  type?: string;
}

interface MonthData {
  month: string;
  shortMonth: string;
  expenses: number;
  date: Date;
}

export function MonthlyExpensesChart({
  selectedMonth,
  selectedCurrency,
  type,
}: MonthlyExpensesChartProps) {
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

  const monthlyData: MonthData[] = useMemo(() => {
    if (type == "bank") {
      return dataService
        .getBankMonthlyExpensesSeries(selectedCurrency)
        .filter((item) => item.month !== "total");
    }
    return dataService
      .getBillingMonthlyExpensesSeries(selectedCurrency)
      .filter((item) => item.month !== "total");
  }, [type, selectedCurrency]);
  const maxExpenses = Math.max(0, ...monthlyData.map((d) => d.expenses));

  const isSelectedMonth = (month: string) => {
    return selectedMonth == month;
  };

  const formatExpenses = (expenses: number) => {
    return dataService.formatCurrency(expenses);
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Monthly Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Monthly Bar Chart */}
          <div className="w-full max-w-4xl">
            <div className="flex items-end justify-between h-32 px-4">
              {monthlyData.map((data, index) => {
                const isSelected = isSelectedMonth(data.month);
                const barHeight = (data.expenses / maxExpenses) * 100;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `${data.month}: ${formatExpenses(
                          data.expenses
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
