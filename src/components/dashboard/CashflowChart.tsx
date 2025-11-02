import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { dataService } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";
import { isSelectedMonth } from "@/lib/utils";

interface CashflowChartProps {
  selectedMonth: string;
  selectedCurrency: string;
}

interface MonthData {
  month: string;
  shortMonth: string;
  revenue: number;
  expenses: number;
  profit: number;
  cashflow: number;
  date: Date;
}

export function CashflowChart({
  selectedMonth,
  selectedCurrency,
}: CashflowChartProps) {
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

  const generateMonthlyData = (): MonthData[] => {
    const revSeries = dataService
      .getBankMonthlyProfitRevenueSeries(selectedCurrency)
      .filter((item) => item.month !== "total");
    const expSeries = dataService
      .getBankMonthlyDirectExpensesSeries(selectedCurrency)
      .filter((item) => item.month !== "total");
    const profitSeries = dataService
      .getBankMonthlyGrossProfitSeries(selectedCurrency)
      .filter((item) => item.month !== "total");
    const cashflowSeries = dataService
      .getBankMonthlyCashflowSeries(selectedCurrency)
      .filter((item) => item.month !== "total");

    const length = Math.max(
      revSeries.length,
      expSeries.length,
      profitSeries.length,
      cashflowSeries.length,
      12
    );
    const rows: MonthData[] = [];
    for (let i = 0; i < length; i++) {
      const rev = revSeries[i];
      const exp = expSeries[i];
      const prof = profitSeries[i];
      const revenue = rev?.revenue ?? 0;
      const expenses = exp?.directExpenses ?? 0;
      const profit = prof?.profit ?? revenue - expenses;
      const cashflowVal = cashflowSeries[i]?.cashflow ?? profit;
      const shortMonth =
        rev?.shortMonth ?? exp?.shortMonth ?? prof?.shortMonth ?? "";
      const month = rev?.month ?? exp?.month ?? prof?.month ?? "";
      const date = rev?.date ?? exp?.date ?? prof?.date ?? new Date();
      // For bank cashflow chart, treat gross profit as profit line, and compute cashflow same as profit for now (or extend when separate data available)
      const cashflow = cashflowVal;
      rows.push({
        month,
        shortMonth,
        revenue,
        expenses,
        profit,
        cashflow,
        date,
      });
    }
    return rows;
  };

  const monthlyData = useMemo(generateMonthlyData, [
    selectedMonth,
    dataService.getCurrentCurrency(),
  ]);
  // const maxValue =
  //   Math.max(...monthlyData.map((d) => Math.max(d.revenue, d.expenses))) * 1.1;
  const minProfit = Math.min(...monthlyData.map((d) => d.profit));
  const maxProfit = Math.max(...monthlyData.map((d) => d.profit));
  const minCashflow = Math.min(...monthlyData.map((d) => d.cashflow), 0);
  const maxCashflow = Math.max(...monthlyData.map((d) => d.cashflow), 0);
  const minLineValue = Math.min(minProfit, minCashflow);
  const maxLineValue = Math.max(maxProfit, maxCashflow);
  const lineRange = maxLineValue - minLineValue || 1;
  const adjustedMinLine = minLineValue - lineRange * 0.1;
  const adjustedMaxLine = maxLineValue + lineRange * 0.1;

  //------//
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));
  const minValue = Math.min(
    ...monthlyData.map((d) => Math.min(d.profit, d.cashflow))
  );
  const maxValue = Math.max(
    maxRevenue,
    ...monthlyData.map((d) => Math.max(d.profit, d.cashflow))
  );

  // Add padding to the range
  const padding = (maxValue - minValue) * 0.15;
  const chartMin = minValue - padding;
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;

  const chartHeight = 280;
  const zeroY = chartHeight - ((0 - chartMin) / chartRange) * chartHeight;

  const formatAxisCurrency = (value: number) => {
    const symbol =
      dataService.getCurrentCurrency() === Currency.USD ? "$" : "₹";
    if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}K`;
    return `${symbol}${value.toFixed(0)}`;
  };
  const formatTooltipCurrency = (value: number) =>
    dataService.formatCurrency(value);
  const formatSignedTooltipCurrency = (value: number) => {
    const absFormatted = dataService.formatCurrency(Math.abs(value));
    return value < 0 ? `-${absFormatted}` : absFormatted;
  };

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 200; // Max height of 200px
  };

  const getLineY = (value: number) => {
    const normalizedValue =
      (value - adjustedMinLine) / (adjustedMaxLine - adjustedMinLine);
    return 240 - normalizedValue * 200;
  };

  // Generate smooth curve paths
  const generateSmoothPath = (dataType: "profit" | "cashflow") => {
    const points = monthlyData.map((data, index) => ({
      x: 60 + index * 80 + 30,
      y: getLineY(dataType === "profit" ? data.profit : data.cashflow),
    }));

    if (points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // Calculate control points for smooth curve
      const tension = 0.3;
      let cp1x, cp1y, cp2x, cp2y;

      if (i === 1) {
        // First curve
        cp1x = prev.x + (curr.x - prev.x) * tension;
        cp1y = prev.y;
        cp2x =
          curr.x -
          (next ? (next.x - prev.x) * tension : (curr.x - prev.x) * tension);
        cp2y = curr.y - (next ? (next.y - prev.y) * tension : 0);
      } else if (i === points.length - 1) {
        // Last curve
        const prevPrev = points[i - 2];
        cp1x = prev.x + (curr.x - prevPrev.x) * tension;
        cp1y = prev.y + (curr.y - prevPrev.y) * tension;
        cp2x = curr.x - (curr.x - prev.x) * tension;
        cp2y = curr.y;
      } else {
        // Middle curves
        cp1x = prev.x + (curr.x - points[i - 2].x) * tension;
        cp1y = prev.y + (curr.y - points[i - 2].y) * tension;
        cp2x = curr.x - (next.x - prev.x) * tension;
        cp2y = curr.y - (next.y - prev.y) * tension;
      }

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    const currencySymbol = selectedCurrency === Currency.USD ? "$" : "₹";
    if (absValue >= 1000000)
      return `${sign}${currencySymbol}${(absValue / 1000000).toFixed(1)}M`;
    if (absValue >= 1000)
      return `${sign}${currencySymbol}${(absValue / 1000).toFixed(0)}K`;
    return `${sign}${currencySymbol}${absValue.toFixed(0)}`;
  };
  const getY = (value: number) => {
    return chartHeight - ((value - chartMin) / chartRange) * chartHeight;
  };

  const isSelectedMonth = (monthData: MonthData) => {
    return monthData.month === selectedMonth;
  };

  const profitPath = monthlyData
    .map((data, index) => {
      const x = 60 + index * 80 + 33;
      const y = getY(data.profit) + 40;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const cashflowPath = monthlyData
    .map((data, index) => {
      const x = 60 + index * 80 + 48;
      const y = getY(data.cashflow) + 40;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");
  return (
    // <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
    //   <CardHeader className="pb-2">
    //     <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
    //       Revenue, Expense, Profit & Cashflow
    //     </CardTitle>
    //   </CardHeader>
    //   <CardContent>
    //     <div className="relative">
    //       <svg width="100%" height="300" viewBox="0 0 1020 300">
    //         {/* Background grid lines */}
    //         {[0, 1, 2, 3, 4, 5].map((line) => (
    //           <g key={line}>
    //             <line
    //               x1="40"
    //               y1={60 + line * 40}
    //               x2="980"
    //               y2={60 + line * 40}
    //               stroke="hsl(var(--border))"
    //               strokeWidth="1"
    //               opacity="0.3"
    //             />
    //             <text
    //               x="30"
    //               y={60 + line * 40 + 5}
    //               fontSize="12"
    //               fill="hsl(var(--muted-foreground))"
    //               textAnchor="end"
    //             >
    //               {formatAxisCurrency(maxValue - (line * maxValue) / 5)}
    //             </text>
    //           </g>
    //         ))}

    //         {/* Zero baseline for lines if within range */}
    //         {adjustedMinLine < 0 && adjustedMaxLine > 0 && (
    //           <line
    //             x1="40"
    //             y1={getLineY(0)}
    //             x2="980"
    //             y2={getLineY(0)}
    //             stroke="hsl(var(--muted-foreground))"
    //             strokeWidth="1"
    //             opacity="0.5"
    //           />
    //         )}

    //         {/* Month labels and bars */}
    //         {monthlyData.map((data, index) => {
    //           const x = 60 + index * 80;
    //           const revenueHeight = getBarHeight(data.revenue);
    //           const expenseHeight = getBarHeight(data.expenses);
    //           const isSelected = isSelectedMonth(data.month, selectedMonth);

    //           return (
    //             <g key={data.month}>
    //               {/* Month label */}
    //               <text
    //                 x={x + 30}
    //                 y="290"
    //                 fontSize="12"
    //                 fill="hsl(var(--muted-foreground))"
    //                 textAnchor="middle"
    //               >
    //                 {data.shortMonth}
    //               </text>

    //               {/* Revenue bar */}
    //               <rect
    //                 x={x}
    //                 y={260 - revenueHeight}
    //                 width="24"
    //                 height={revenueHeight}
    //                 fill="hsl(var(--chart-1))"
    //                 className={`cursor-pointer transition-all duration-200 ${
    //                   isSelected
    //                     ? "animate-cosmic-glow opacity-90"
    //                     : "hover:opacity-80"
    //                 }`}
    //                 onMouseEnter={(e) => {
    //                   const rect = e.currentTarget.getBoundingClientRect();
    //                   setTooltip({
    //                     visible: true,
    //                     content: `${
    //                       data.shortMonth
    //                     } Revenue: ${formatTooltipCurrency(data.revenue)}`,
    //                     x: rect.left + rect.width / 2,
    //                     y: rect.top - 10,
    //                   });
    //                 }}
    //                 onMouseLeave={() =>
    //                   setTooltip((prev) => ({ ...prev, visible: false }))
    //                 }
    //               />

    //               {/* Expense bar */}
    //               <rect
    //                 x={x + 30}
    //                 y={260 - expenseHeight}
    //                 width="24"
    //                 height={expenseHeight}
    //                 fill="hsl(var(--chart-2))"
    //                 className={`cursor-pointer transition-all duration-200 ${
    //                   isSelected
    //                     ? "animate-cosmic-glow opacity-90"
    //                     : "hover:opacity-80"
    //                 }`}
    //                 onMouseEnter={(e) => {
    //                   const rect = e.currentTarget.getBoundingClientRect();
    //                   setTooltip({
    //                     visible: true,
    //                     content: `${
    //                       data.shortMonth
    //                     } Expenses: ${formatTooltipCurrency(data.expenses)}`,
    //                     x: rect.left + rect.width / 2,
    //                     y: rect.top - 10,
    //                   });
    //                 }}
    //                 onMouseLeave={() =>
    //                   setTooltip((prev) => ({ ...prev, visible: false }))
    //                 }
    //               />
    //             </g>
    //           );
    //         })}

    //         {/* Profit line */}
    //         <path
    //           d={generateSmoothPath("profit")}
    //           fill="none"
    //           stroke="hsl(var(--chart-3))"
    //           strokeWidth="3"
    //           className="drop-shadow-md"
    //         />

    //         {/* Cashflow line */}
    //         <path
    //           d={generateSmoothPath("cashflow")}
    //           fill="none"
    //           stroke="hsl(var(--chart-4))"
    //           strokeWidth="3"
    //           className="drop-shadow-md"
    //           strokeDasharray="5,5"
    //         />

    //         {/* Profit line points */}
    //         {monthlyData.map((data, index) => {
    //           const x = 60 + index * 80 + 30;
    //           const y = getLineY(data.profit);
    //           const isSelected = isSelectedMonth(data.month, selectedMonth);

    //           return (
    //             <circle
    //               key={`profit-${index}`}
    //               cx={x}
    //               cy={y}
    //               r={isSelected ? "6" : "4"}
    //               fill="hsl(var(--chart-3))"
    //               stroke="hsl(var(--background))"
    //               strokeWidth="2"
    //               className={`cursor-pointer transition-all duration-200 ${
    //                 isSelected ? "animate-cosmic-glow" : "hover:r-6"
    //               }`}
    //               onMouseEnter={(e) => {
    //                 const rect = e.currentTarget.getBoundingClientRect();
    //                 setTooltip({
    //                   visible: true,
    //                   content: `${
    //                     data.shortMonth
    //                   } Profit: ${formatSignedTooltipCurrency(data.profit)}`,
    //                   x: rect.left,
    //                   y: rect.top - 10,
    //                 });
    //               }}
    //               onMouseLeave={() =>
    //                 setTooltip((prev) => ({ ...prev, visible: false }))
    //               }
    //             />
    //           );
    //         })}

    //         {/* Cashflow line points */}
    //         {monthlyData.map((data, index) => {
    //           const x = 60 + index * 80 + 30;
    //           const y = getLineY(data.cashflow);
    //           const isSelected = isSelectedMonth(data.month, selectedMonth);

    //           return (
    //             <circle
    //               key={`cashflow-${index}`}
    //               cx={x}
    //               cy={y}
    //               r={isSelected ? "6" : "4"}
    //               fill="hsl(var(--chart-4))"
    //               stroke="hsl(var(--background))"
    //               strokeWidth="2"
    //               className={`cursor-pointer transition-all duration-200 ${
    //                 isSelected ? "animate-cosmic-glow" : "hover:r-6"
    //               }`}
    //               onMouseEnter={(e) => {
    //                 const rect = e.currentTarget.getBoundingClientRect();
    //                 setTooltip({
    //                   visible: true,
    //                   content: `${
    //                     data.shortMonth
    //                   } Cashflow: ${formatSignedTooltipCurrency(
    //                     data.cashflow
    //                   )}`,
    //                   x: rect.left,
    //                   y: rect.top - 10,
    //                 });
    //               }}
    //               onMouseLeave={() =>
    //                 setTooltip((prev) => ({ ...prev, visible: false }))
    //               }
    //             />
    //           );
    //         })}
    //       </svg>

    //       {/* Legend */}
    //       <div className="flex justify-center gap-6 mt-4">
    //         <div className="flex items-center gap-2">
    //           <div
    //             className="w-4 h-4 rounded"
    //             style={{ backgroundColor: "hsl(var(--chart-1))" }}
    //           ></div>
    //           <span className="text-sm text-muted-foreground">Revenue</span>
    //         </div>
    //         <div className="flex items-center gap-2">
    //           <div
    //             className="w-4 h-4 rounded"
    //             style={{ backgroundColor: "hsl(var(--chart-2))" }}
    //           ></div>
    //           <span className="text-sm text-muted-foreground">Expenses</span>
    //         </div>
    //         <div className="flex items-center gap-2">
    //           <div
    //             className="w-4 h-4 rounded"
    //             style={{ backgroundColor: "hsl(var(--chart-3))" }}
    //           ></div>
    //           <span className="text-sm text-muted-foreground">Profit</span>
    //         </div>
    //         <div className="flex items-center gap-2">
    //           <div
    //             className="w-4 h-4 rounded border-2 border-dashed"
    //             style={{ borderColor: "hsl(var(--chart-4))" }}
    //           ></div>
    //           <span className="text-sm text-muted-foreground">Cashflow</span>
    //         </div>
    //       </div>

    //       {/* Tooltip */}
    //       {tooltip.visible && (
    //         <div
    //           className="fixed z-50 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none"
    //           style={{
    //             left: `${tooltip.x}px`,
    //             top: `${tooltip.y}px`,
    //             transform: "translate(-50%, -100%)",
    //           }}
    //         >
    //           {tooltip.content}
    //         </div>
    //       )}
    //     </div>
    //   </CardContent>
    // </Card>
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Revenue, Expense, Profit & Cashflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg width="100%" height="380" viewBox="0 0 1020 380">
            {/* Y-axis grid lines and labels */}
            {Array.from({ length: 7 }).map((_, i) => {
              const value = chartMax - (i * chartRange) / 6;
              const y = 40 + (i * chartHeight) / 6;
              const isZeroLine = Math.abs(value) < chartRange * 0.05;

              return (
                <g key={i}>
                  <line
                    x1="40"
                    y1={y}
                    x2="980"
                    y2={y}
                    stroke={
                      isZeroLine
                        ? "hsl(var(--muted-foreground))"
                        : "hsl(var(--border))"
                    }
                    strokeWidth={isZeroLine ? "2" : "1"}
                    opacity={isZeroLine ? "0.8" : "0.3"}
                  />
                  <text
                    x="30"
                    y={y + 5}
                    fontSize={isZeroLine ? "12" : "11"}
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="end"
                    fontWeight={isZeroLine ? "600" : "400"}
                  >
                    {formatCurrency(value)}
                  </text>
                </g>
              );
            })}

            {/* Profit line */}
            <path
              d={profitPath}
              fill="none"
              stroke="hsl(var(--chart-3))"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Cashflow line */}
            <path
              d={cashflowPath}
              fill="none"
              stroke="hsl(var(--chart-4))"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Bars and points for each month */}
            {monthlyData.map((data, index) => {
              const x = 60 + index * 80;
              const isSelected = isSelectedMonth(data);

              const revenueY = getY(data.revenue) + 40;
              const expenseY = getY(data.expenses) + 40;
              const profitY = getY(data.profit) + 40;
              const cashflowY = getY(data.cashflow) + 40;

              const revenueBarHeight = Math.abs(zeroY - (revenueY - 40));
              const expenseBarHeight = Math.abs(zeroY - (expenseY - 40));

              return (
                <g key={data.month}>
                  {/* Month label */}
                  <text
                    x={x + 30}
                    y="365"
                    fontSize="12"
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="middle"
                    fontWeight={isSelected ? "600" : "400"}
                  >
                    {data.shortMonth}
                  </text>

                  {/* Revenue bar */}
                  <rect
                    x={x}
                    y={Math.min(revenueY, zeroY + 40)}
                    width="18"
                    height={revenueBarHeight}
                    fill="hsl(var(--chart-1))"
                    opacity={isSelected ? 0.9 : 0.7}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? "animate-pulse" : "hover:opacity-90"
                    }`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `Revenue: ${formatCurrency(data.revenue)}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                      });
                    }}
                    onMouseLeave={() =>
                      setTooltip((prev) => ({ ...prev, visible: false }))
                    }
                  />

                  {/* Expense bar */}
                  <rect
                    x={x + 24}
                    y={Math.min(expenseY, zeroY + 40)}
                    width="18"
                    height={expenseBarHeight}
                    fill="hsl(var(--chart-2))"
                    opacity={isSelected ? 0.9 : 0.7}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? "animate-pulse" : "hover:opacity-90"
                    }`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `Expenses: ${formatCurrency(data.expenses)}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                      });
                    }}
                    onMouseLeave={() =>
                      setTooltip((prev) => ({ ...prev, visible: false }))
                    }
                  />

                  {/* Profit point */}
                  <circle
                    cx={x + 33}
                    cy={profitY}
                    r={isSelected ? "7" : "5"}
                    fill={
                      data.profit >= 0
                        ? "hsl(var(--chart-3))"
                        : "hsl(var(--destructive))"
                    }
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? "animate-pulse" : ""
                    }`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `Profit: ${formatCurrency(data.profit)}`,
                        x: rect.left,
                        y: rect.top - 10,
                      });
                    }}
                    onMouseLeave={() =>
                      setTooltip((prev) => ({ ...prev, visible: false }))
                    }
                  />

                  {/* Cashflow point */}
                  <circle
                    cx={x + 48}
                    cy={cashflowY}
                    r={isSelected ? "7" : "5"}
                    fill={
                      data.cashflow >= 0
                        ? "hsl(var(--chart-4))"
                        : "hsl(var(--destructive))"
                    }
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? "animate-pulse" : ""
                    }`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `Cashflow: ${formatCurrency(data.cashflow)}`,
                        x: rect.left,
                        y: rect.top - 10,
                      });
                    }}
                    onMouseLeave={() =>
                      setTooltip((prev) => ({ ...prev, visible: false }))
                    }
                  />
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "hsl(var(--chart-1))" }}
              ></div>
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "hsl(var(--chart-2))" }}
              ></div>
              <span className="text-sm text-muted-foreground">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "hsl(var(--chart-3))" }}
              ></div>
              <span className="text-sm text-muted-foreground">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "hsl(var(--chart-4))" }}
              ></div>
              <span className="text-sm text-muted-foreground">Cashflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "hsl(var(--destructive))" }}
              ></div>
              <span className="text-sm text-muted-foreground">Loss</span>
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
        </div>
      </CardContent>
    </Card>
  );
}
