import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataService } from "@/lib/dataService";
import { Currency } from "@/lib/sheet-conversion";

interface LiquiditySource {
  id: string;
  name: string;
  amount: string;
  actualAmount: number;
  percentage: number;
}

export function LiquidityOverview({ selectedCurrency, selectedMonth }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({
    name: "",
    amount: "",
  });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const liquiditySources: LiquiditySource[] = useMemo(
    () => dataService.getLiquidityTableData(selectedCurrency, selectedMonth),
    [selectedCurrency, selectedMonth]
  );

  const graphSources: LiquiditySource[] = useMemo(
    () => liquiditySources.slice(0, 5),
    [liquiditySources]
  );

  const handleBarHover = (event: React.MouseEvent, source: LiquiditySource) => {
    setTooltipContent({
      name: source.name,
      amount: source.amount,
    });
    setTooltipPosition({
      x: event.clientX + 10,
      y: event.clientY - 10,
    });
    setTooltipVisible(true);
  };

  const handleBarLeave = () => {
    setTooltipVisible(false);
  };

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <>
      <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
            Liquidity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Liquidity Sources Table */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2 text-base font-semibold text-foreground border-b border-border/50 pb-2 px-2">
                <span className="col-span-6 text-left">Source</span>
                <span className="col-span-3 text-center">Amount</span>
                <span className="col-span-3 text-center">Liquidity %</span>
              </div>
              {liquiditySources.map((source) => (
                <div
                  key={source.id}
                  className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/30 rounded px-2 transition-colors"
                >
                  <span className="col-span-6 text-foreground font-medium text-left">
                    {source.name}
                  </span>
                  <span className="col-span-3 text-foreground font-medium text-center">
                   {selectedCurrency==="INR"?"₹":"$"} {source.amount}
                  </span>
                  <span className="col-span-3 text-foreground font-medium text-center">
                    {source.percentage}%
                  </span>
                </div>
              ))}
            </div>

            {/* Right side - Aligned Horizontal Bars */}
            <div className="flex flex-col justify-start relative">
              {/* Spacer to align with table header */}
              <div className="h-[2.5rem] border-b border-transparent pb-2"></div>

              {/* Aligned horizontal bars */}
              <div className="space-y-4">
                {graphSources.map((source, index) => (
                  <div
                    key={source.id}
                    className="flex items-center py-2 h-[2.5rem]"
                  >
                    <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out cursor-pointer hover:brightness-110"
                        style={{
                          width: `${source.percentage}%`,
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                        onMouseEnter={(e) => handleBarHover(e, source)}
                        onMouseMove={(e) => handleBarHover(e, source)}
                        onMouseLeave={handleBarLeave}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {tooltipVisible && (
        <div
          className="fixed z-50 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div>
            {tooltipContent.name}: {selectedCurrency==="INR"?"₹":"$"} {tooltipContent.amount}
          </div>
        </div>
      )}
    </>
  );
}
