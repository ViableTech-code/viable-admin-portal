import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { dataService } from "@/lib/dataService";

interface BillingFinancialSnapshotProps {
  selectedMonth: string;
  selectedCurrency: string;
}

export function BillingFinancialSnapshot({
  selectedCurrency,
  selectedMonth,
}: BillingFinancialSnapshotProps) {
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
  // Pull current month data from service (billing)
  const profitSheetRows = useMemo(() => {
    return dataService.getBillingProfitSheet1ForDate(
      selectedCurrency,
      selectedMonth
    );
  }, [selectedCurrency, selectedMonth]);

  const formatCurrency = (value: number) => dataService.formatCurrency(value);

  const tableData = profitSheetRows.map((r) => {
    const isPct = r.key.includes("%");
    const display = isPct ? `${r.value.toFixed(0)}%` : formatCurrency(r.value);
    return {
      key: r.key,
      label: r.label,
      value: display,
      isPositive: r.value >= 0,
      rawValue: r.value,
      isPct,
      percentage: r.percentage ?? 0,
    };
  });

  const filteredTableData = tableData.filter(
    (d) => d.key !== "Billed Expenses" && d.isPct !== true
  );

  const chartData = useMemo(() => {
    const colors = ["#d9e864", "#b9d94b", "#19e319"];
    const graphData = tableData.filter((item) =>
      ["Billed Gross Profit", "Billed Profit", "Billed Cashflow"].includes(
        item.key
      )
    );
    return graphData.map((d, i) => ({
      label: d.label,
      value: d.rawValue,
      color: colors[i % colors.length],
      percentage: tableData.find((item) => item.key == d.key + " %").percentage,
    }));
  }, [tableData]);

  const maxValue = Math.max(...chartData.map((d) => Math.abs(d.value)), 1);

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Financial Snapshot
        </CardTitle>
      </CardHeader>
      {/* <CardContent>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="space-y-6">
              {filteredTableData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center pr-20"
                >
                  <span className="text-foreground font-medium text-lg">
                    {item.label}
                  </span>
                  <span
                    className={`font-semibold text-lg ${
                      item.isPositive ? "text-success" : "text-foreground"
                    }`}
                  >
                    {item.isPct ? (
                      item.value
                    ) : (
                      <>
                        {item.isPositive ? "" : "-"} {item.value}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-full w-full flex items-center justify-center">
            <div className="flex items-center justify-center gap-4 h-32">
              {chartData.map((item, index) => {
                const barHeight = Math.max(
                  20,
                  (Math.abs(item.value) / maxValue) * 80
                ); // Minimum 20px height, max 80px
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-end h-full"
                  >
                    <div
                      className="w-8 rounded-t transition-all duration-300 cursor-pointer hover:opacity-80"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: item.color,
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();

                        setTooltip({
                          visible: true,
                          content: `${item.label}: ${item.value}\nPercentage : ${item.percentage}%`,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() =>
                        setTooltip((prev) => ({ ...prev, visible: false }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {tooltip.visible && (
          <div
            className="fixed z-50 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none whitespace-pre-line"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltip.content}
          </div>
        )}
      </CardContent> */}

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Financial Table */}
          <div className="space-y-4">
            <div className="space-y-3">
              {filteredTableData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0"
                >
                  <span
                    className={`text-sm font-medium ${
                      item.label.includes("Profit")
                        ? "text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      item.label.includes("Profit") || item.label.includes("Cashflow")
                        ? "text-[#10b77f]"
                        : "text-foreground"
                    }`}
                  >
                    {item.isPct ? (
                      item.value
                    ) : (
                      <>
                        {item.isPositive ? "" : "-"} {item.value}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Chart */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-end gap-6 h-32">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer group"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const isPct = tableData.find(
                      (t) => t.label === item.label
                    )?.isPct;
                    setTooltip({
                      visible: true,
                      content: `${item.label}: ${selectedCurrency==="INR"?"₹":"$"} ${item.value}\nPercentage : ${item.percentage}%`,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 10,
                    });
                  }}
                  onMouseLeave={() =>
                    setTooltip((prev) => ({ ...prev, visible: false }))
                  }
                >
                  <div
                    className="w-12 rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${(Math.abs(item.value) / maxValue) * 100}px`,
                      backgroundColor: item.color,
                      minHeight: "20px",
                    }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-2 text-center">
                    {item.label.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="fixed z-50 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none  whitespace-pre-line"
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
