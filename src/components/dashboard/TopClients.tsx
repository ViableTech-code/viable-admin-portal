import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { dataService } from "@/lib/dataService";
import { Currency } from "@/lib/sheetData";
import { parseAmount } from "@/lib/utils";

interface ClientRow {
  name: string;
  amount: string;
  percentage: string;
  numAmount: number;
}

interface TopClientsProps {
  selectedCurrency: Currency;
  selectedMonth: string;
  type?: string;
}

export function TopClients({
  selectedCurrency,
  selectedMonth,
  type,
}: TopClientsProps): JSX.Element {
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

  const topClients = useMemo(() => {
    if (type === "bank") {
      return dataService.getTopBankClientsByRevenue(
        selectedMonth,
        selectedCurrency
      );
    }
    return dataService.getTopClientsByRevenue(selectedMonth, selectedCurrency);
  }, [selectedCurrency, selectedMonth, type]);

  const topClientRows: ClientRow[] = topClients.slice(0, 5).map((c) => ({
    name: c.name,
    amount: dataService.formatCurrency(c.amount),
    percentage: `${c.percentage.toFixed(1)}%`,
    numAmount: parseAmount(c.amount),
  }));

  const allClientRows: ClientRow[] = topClients.map((c) => ({
    name: c.name,
    amount: dataService.formatCurrency(c.amount),
    percentage: `${c.percentage.toFixed(1)}%`,
    numAmount: parseAmount(c.amount),
  }));
  const totalAmount = topClientRows.reduce((sum, c) => sum + c.numAmount, 0);
  let cumulativeAngle = 0;
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Top Clients by Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Client Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-base font-semibold text-foreground border-b border-border/50 pb-2 px-2">
              <span className="col-span-6 text-left">Client</span>
              <span className="col-span-3 text-center">Amount</span>
              <span className="col-span-3 text-center">Revenue %</span>
            </div>
            {topClientRows.map((client, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/30 rounded px-2 transition-colors"
              >
                <span className="col-span-6 text-foreground font-medium text-left">
                  {client.name}
                </span>
                <span className="col-span-3 text-foreground font-medium text-center">
                  {client.amount}
                </span>
                <span className="col-span-3 text-foreground font-medium text-center">
                  {client.percentage}
                </span>
              </div>
            ))}

            <div className="border-t border-border pt-3 mt-4">
              <div className="flex justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-success text-success-foreground hover:bg-success/90 px-6"
                    >
                      View More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>All Clients by Revenue</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-auto">
                      <div className="grid grid-cols-12 gap-2 text-base font-semibold text-foreground border-b border-border/50 pb-2 mb-4">
                        <span className="col-span-4 text-left">Client</span>
                        <span className="col-span-4 text-center">Amount</span>
                        <span className="col-span-4 text-center">
                          Revenue %
                        </span>
                      </div>
                      {allClientRows.map((client, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/30 rounded px-2 transition-colors"
                        >
                          <span className="col-span-4 text-foreground font-medium text-left">
                            {client.name}
                          </span>
                          <span className="col-span-4 text-foreground font-medium text-center">
                            {client.amount}
                          </span>
                          <span className="col-span-4 text-foreground font-medium text-center">
                            {client.percentage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Right side - Clean Pie Chart with Hover Tooltips */}
          <div className="flex flex-col items-center justify-center relative">
            <div className="relative w-72 h-72">
              {/* <svg className="w-full h-full" viewBox="0 0 288 288">
                <circle
                  cx="144"
                  cy="144"
                  r="85"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  opacity="0.2"
                />


                {topClientRows.map((client, index) => {
                  const gapAngle = 4;
                  const segmentAngle =
                    (client.numAmount / totalAmount) *
                    (360 - topClientRows.length * gapAngle);
                  const startAngle = cumulativeAngle - 90;
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
                      key={`${client.name}-${index}`}
                      d={pathData}
                      fill={`hsl(var(--chart-${index + 1}))`}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          visible: true,
                          content: `${client.name}: ${client.amount}\nRevenue Percentage: ${client.percentage}`,
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
                <circle
                  cx="144"
                  cy="144"
                  r="85"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  opacity="0.2"
                />

                {topClientRows.map((client, index) => {
                  const gapAngle = 2;
                  const segmentAngle =
                    (client.numAmount / totalAmount) * 360 - gapAngle;
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
                      key={`${client.name}-${index}`}
                      d={pathData}
                      fill={`hsl(var(--chart-${index + 1}))`}
                      stroke="hsl(var(--background))"
                      strokeWidth="1"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          visible: true,
                          content: `${client.name}: ${client.amount}\nRevenue Percentage: ${client.percentage}`,
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
