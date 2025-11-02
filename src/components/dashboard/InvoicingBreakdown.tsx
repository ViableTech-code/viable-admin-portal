import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { dataService } from "@/lib/dataService";
import { Currency } from "@/lib/sheetData";
import { parseAmount } from "@/lib/utils";

interface InvoiceItem {
  service: string;
  amount: string;
  percentage: string;
}

export function InvoicingBreakdown({
  selectedCurrency,
  selectedMonth,
  type,
}: {
  selectedCurrency: Currency;
  selectedMonth: string;
  type?: string;
}) {
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

  const revenueType = useMemo(() => {
    if (type === "bank") {
      return dataService.getBankRevenueTypeBreakdown(
        selectedCurrency,
        selectedMonth
      );
    }

    return dataService.getRevenueTypeBreakdown(selectedCurrency, selectedMonth);
  }, [selectedCurrency, selectedMonth, type]);

  const invoiceItems: InvoiceItem[] = revenueType.map((rt) => ({
    service: rt.name,
    amount: dataService.formatCurrency(rt.amount),
    percentage: `${rt.percentage.toFixed(1)}%`,
  }));
  const maxAmount = Math.max(...invoiceItems.map((i) => parseAmount(i.amount)));
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Revenue Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Invoice Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-base font-semibold text-foreground border-b border-border/50 pb-2 px-2">
              <span className="col-span-6 text-left">Revenue Type</span>
              <span className="col-span-3 text-center">Amount</span>
              <span className="col-span-3 text-center">Revenue %</span>
            </div>
            {invoiceItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/30 rounded px-2 transition-colors"
              >
                <span className="col-span-6 text-foreground font-medium text-left">
                  {item.service}
                </span>
                <span className="col-span-3 text-foreground font-medium text-center">
                  {item.amount}
                </span>
                <span className="col-span-3 text-foreground font-medium text-center">
                  {item.percentage}
                </span>
              </div>
            ))}
          </div>

          {/* Right side - Clean Bar Chart with Hover Tooltips */}
          <div className="flex flex-col items-center justify-center relative">
            <div className="flex items-end justify-center space-x-6 h-48 w-full relative">
              {invoiceItems.map((item, index) => {
                const amount = parseAmount(item.amount);
                const height = (amount / maxAmount) * 100; // % height relative to container

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer justify-end h-full"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `${item.service}: ${item.amount}\nPercentage: ${item.percentage}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                      });
                    }}
                    onMouseLeave={() =>
                      setTooltip((prev) => ({ ...prev, visible: false }))
                    }
                  >
                    <div
                      className="w-16 rounded-t transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${height}%`,
                        background: `linear-gradient(to top, hsl(var(--chart-${
                          index + 1
                        })), hsl(var(--chart-${index + 1}) / 0.8))`,
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tooltip */}
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
      </CardContent>
    </Card>
  );
}
