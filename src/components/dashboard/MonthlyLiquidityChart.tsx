import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataService } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";

interface MonthlyLiquidityChartProps {
  selectedMonth: Date;
  selectedCurrency?: string;
}

interface MonthData {
  month: string;
  shortMonth: string;
  liquidity: number;
  date: Date;
}

export function MonthlyLiquidityChart({
  selectedMonth,
  selectedCurrency,
}: MonthlyLiquidityChartProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    month: string;
    liquidity: string;
  } | null>(null);

  const generateMonthlyData = (selectedCurrency): MonthData[] => {
    const series = dataService.getBankMonthlyLiquiditySeries(selectedCurrency);
    return series.map((s) => ({
      month: s.month,
      shortMonth: s.shortMonth,
      liquidity: s.liquidity,
      date: s.date,
    }));
  };

  const formatAxisCurrency = (amount: number): string => {
    const symbol =
      dataService.getCurrentCurrency() === Currency.USD ? "$" : "₹";
    if (amount >= 1000000) return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(0)}K`;
    return `${symbol}${amount.toFixed(0)}`;
  };

  const data = useMemo(
    () => generateMonthlyData(selectedCurrency),
    [selectedCurrency]
  );
  const maxLiquidity = Math.max(...data.map((d) => d.liquidity));
  const minLiquidity = Math.min(...data.map((d) => d.liquidity));
  const range = maxLiquidity - minLiquidity;
  const padding = range * 0.1;

  const getY = (liquidity: number) => {
    const adjustedMax = maxLiquidity + padding;
    const adjustedMin = minLiquidity - padding;
    const adjustedRange = adjustedMax - adjustedMin;
    return 40 + ((adjustedMax - liquidity) / adjustedRange) * 160;
  };

  // Generate smooth curve path
  const generateSmoothPath = () => {
    const points = data.map((item, index) => ({
      x: 60 + (index * (480 - 120)) / (data.length - 1),
      y: getY(item.liquidity),
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

  const isSelectedMonth = (monthData: MonthData) => {
    return (
      monthData.date.getMonth() === selectedMonth.getMonth() &&
      monthData.date.getFullYear() === selectedMonth.getFullYear()
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div></div>
        <CardTitle className="text-lg font-medium text-muted-foreground">
          Monthly Liquidity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            width="100%"
            height="300"
            viewBox="0 0 600 300"
            className="overflow-visible"
          >
            {/* Grid lines */}
            <defs>
              <pattern
                id="grid"
                width="50"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 40"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const value =
                minLiquidity + (maxLiquidity - minLiquidity) * (1 - ratio);
              const y = 40 + ratio * 160;
              return (
                <text
                  key={index}
                  x="30"
                  y={y + 5}
                  fontSize="12"
                  fill="hsl(var(--muted-foreground))"
                  textAnchor="middle"
                >
                  {formatAxisCurrency(value)}
                </text>
              );
            })}

            {/* Smooth line path */}
            <path
              d={generateSmoothPath()}
              fill="none"
              stroke="hsl(var(--chart-1))"
              strokeWidth="3"
              className="drop-shadow-md"
            />

            {/* Data points */}
            {data.map((item, index) => {
              const x = 60 + (index * (480 - 120)) / (data.length - 1);
              const y = getY(item.liquidity);
              const selected = isSelectedMonth(item);

              return (
                <g key={item.month}>
                  {/* Glow effect for selected month */}
                  {selected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="hsl(var(--chart-1))"
                      opacity="0.3"
                      className="animate-pulse"
                    />
                  )}

                  {/* Data point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={selected ? "6" : "4"}
                    fill="hsl(var(--chart-1))"
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:r-6"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        x: rect.left + rect.width / 10,
                        y: rect.top - 200,
                        month: item.month,
                        liquidity: dataService.formatCurrency(item.liquidity),
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />

                  {/* Month labels */}
                  <text
                    x={x}
                    y="270"
                    fontSize="12"
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="middle"
                    className={selected ? "font-semibold fill-chart-1" : ""}
                  >
                    {item.shortMonth}
                  </text>
                </g>
              );
            })}

            {/* X-axis line */}
            <line
              x1="60"
              y1="240"
              x2="540"
              y2="240"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />

            {/* Y-axis line */}
            <line
              x1="60"
              y1="40"
              x2="60"
              y2="240"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-10 bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: "translate(-150%, -100%)",
              }}
            >
              <div className="font-medium text-foreground">{tooltip.month}</div>
              <div className="text-chart-1 font-semibold">
                {tooltip.liquidity}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
