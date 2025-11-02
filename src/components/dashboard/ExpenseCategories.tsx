import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { dataService } from "@/lib/dataService";
import { Currency } from "@/lib/sheetData";
import { parseAmount } from "@/lib/utils";

interface ExpenseCategoryRow {
  id: string;
  category: string;
  amount: string;
  percentage: string;
  numAmount: number;
}

export function ExpenseCategories({
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

  const raw = useMemo(() => {
    if (type == "bank") {
      return dataService.getBankExpenseCategories(
        selectedCurrency,
        selectedMonth,
        12
      );
    }
    return dataService.getExpenseCategories(
      selectedCurrency,
      selectedMonth,
      12
    );
  }, [selectedCurrency, selectedMonth, type]);
  const filtered = useMemo(
    () => raw.filter((r) => !/tbd/i.test(r.name)),
    [raw]
  );
  const expenseCategories: ExpenseCategoryRow[] = filtered.map((r, idx) => ({
    id: `${r.name}-${idx}`,
    category: r.name,
    amount: dataService.formatCurrency(r.amount),
    percentage: `${r.percentage.toFixed(1)}%`,
    numAmount: parseAmount(r.amount),
  }));

  // Calculate positions for separated donut chart segments
  const getSegmentPath = (
    startAngle: number,
    endAngle: number,
    radius: number
  ) => {
    const centerX = 120;
    const centerY = 120;

    // Add gaps between segments
    const gapAngle = 8; // degrees of gap between segments
    const adjustedStartAngle = startAngle + gapAngle / 2;
    const adjustedEndAngle = endAngle - gapAngle / 2;

    const startX =
      centerX + radius * Math.cos((adjustedStartAngle * Math.PI) / 180);
    const startY =
      centerY + radius * Math.sin((adjustedStartAngle * Math.PI) / 180);
    const endX =
      centerX + radius * Math.cos((adjustedEndAngle * Math.PI) / 180);
    const endY =
      centerY + radius * Math.sin((adjustedEndAngle * Math.PI) / 180);

    const largeArc = adjustedEndAngle - adjustedStartAngle > 180 ? 1 : 0;

    return {
      path: `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
      startAngle: adjustedStartAngle,
      endAngle: adjustedEndAngle,
    };
  };
  const totalAmount = expenseCategories.reduce(
    (sum, c) => sum + c.numAmount,
    0
  );
  let cumulativeAngle = 0;
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Expense Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Expense Categories Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-base font-semibold text-foreground border-b border-border/50 pb-2 px-2">
              <span className="col-span-6 text-left">Category</span>
              <span className="col-span-3 text-center">Amount</span>
              <span className="col-span-3 text-center">Expenses %</span>
            </div>
            {expenseCategories.map((category, index) => (
              <div
                key={category.id}
                className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/30 rounded px-2 transition-colors"
              >
                <span className="col-span-6 text-foreground font-medium text-left">
                  {category.category}
                </span>
                <span className="col-span-3 text-foreground font-medium text-center">
                  {category.amount}
                </span>
                <span className="col-span-3 text-foreground font-medium text-center">
                  {category.percentage}
                </span>
              </div>
            ))}
          </div>

          {/* Right side - Donut Chart */}
          <div className="flex flex-col items-center justify-center relative">
            <div className="relative w-72 h-72">
              {/* <svg className="w-full h-full" viewBox="0 0 288 288">
                {expenseCategories.map((category, index) => {
                  const gapAngle = 4;
                  const segmentAngle =
                    (category.numAmount / totalAmount) *
                    (360 - expenseCategories.length * gapAngle);
                  const startAngle = cumulativeAngle - 90;
                  const endAngle = startAngle + segmentAngle;
                  cumulativeAngle += segmentAngle + gapAngle;
                  const chartColorIndex = (index % 5) + 1;
                  // Convert to radians
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;

                  // Radii
                  const innerRadius = 75;
                  const outerRadius = 90;

                  // Coordinates
                  const x1 = 144 + outerRadius * Math.cos(startRad);
                  const y1 = 144 + outerRadius * Math.sin(startRad);
                  const x2 = 144 + outerRadius * Math.cos(endRad);
                  const y2 = 144 + outerRadius * Math.sin(endRad);
                  const x3 = 144 + innerRadius * Math.cos(endRad);
                  const y3 = 144 + innerRadius * Math.sin(endRad);
                  const x4 = 144 + innerRadius * Math.cos(startRad);
                  const y4 = 144 + innerRadius * Math.sin(startRad);

                  const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                  const pathData = [
                    `M ${x1} ${y1}`,
                    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `L ${x3} ${y3}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                    "Z",
                  ].join(" ");

                  return (
                    <path
                      key={category.id}
                      d={pathData}
                      fill={`hsl(var(--chart-${index + 1}))`}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          visible: true,
                          content: `${category.category}: ${category.amount}
                          \nPercentage: ${category.percentage}`,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() =>
                        setTooltip((prev) => ({ ...prev, visible: false }))
                      }
                    />
                  );
                })}
              </svg> */}
              <svg className="w-full h-full" viewBox="0 0 288 288">
                {expenseCategories.map((category, index) => {
                  const gapAngle = 2;
                  const segmentAngle =
                    (category.numAmount / totalAmount) * 360 - gapAngle;
                  const startAngle = cumulativeAngle - 90 + gapAngle / 2;
                  const endAngle = startAngle + segmentAngle;
                  cumulativeAngle += segmentAngle + gapAngle;

                  // Convert to radians
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;

                  // Radii
                  const innerRadius = 75;
                  const outerRadius = 90;

                  // Coordinates
                  const x1 = 144 + outerRadius * Math.cos(startRad);
                  const y1 = 144 + outerRadius * Math.sin(startRad);
                  const x2 = 144 + outerRadius * Math.cos(endRad);
                  const y2 = 144 + outerRadius * Math.sin(endRad);
                  const x3 = 144 + innerRadius * Math.cos(endRad);
                  const y3 = 144 + innerRadius * Math.sin(endRad);
                  const x4 = 144 + innerRadius * Math.cos(startRad);
                  const y4 = 144 + innerRadius * Math.sin(startRad);

                  const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                  const pathData = [
                    `M ${x1} ${y1}`,
                    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `L ${x3} ${y3}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                    "Z",
                  ].join(" ");

                  return (
                    <path
                      key={category.id}
                      d={pathData}
                      fill={`hsl(var(--chart-${index + 1}))`}
                      stroke="hsl(var(--background))"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          visible: true,
                          content: `${category.category}: ${category.amount}
                          \nPercentage: ${category.percentage}`,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() =>
                        setTooltip((prev) => ({ ...prev, visible: false }))
                      }
                    />
                  );
                })}
              </svg>
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
