import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { dataService } from "@/lib/dataService";

interface OutstandingClientRow {
  name: string;
  outstandingAmount: string;
  percentage: number;
}

interface OutstandingRevenueTableProps {
  selectedCurrency: "INR" | "USD";
  selectedMonth: string;
}

export function OutstandingRevenueTable({
  selectedCurrency,
  selectedMonth,
}: OutstandingRevenueTableProps): JSX.Element {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({
    name: "",
    amount: "",
  });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const outstanding = useMemo(
    () => dataService.getOutstandingBalances(selectedCurrency, selectedMonth),
    [selectedCurrency, selectedMonth]
  );

  const top = useMemo(() => outstanding.slice(0, 5), [outstanding]);
  const outstandingClients: OutstandingClientRow[] = top.map((c) => ({
    name: c.name,
    outstandingAmount: dataService.formatCurrency(c.amount),
    percentage: parseFloat(c.percentage.toFixed(1)),
  }));
  const allClients: OutstandingClientRow[] = outstanding.map((c) => ({
    name: c.name,
    outstandingAmount: dataService.formatCurrency(c.amount),
    percentage: parseFloat(c.percentage.toFixed(1)),
  }));
  const handleBarHover = (
    event: React.MouseEvent,
    client: OutstandingClientRow
  ) => {
    setTooltipContent({
      name: client.name,
      amount: client.outstandingAmount,
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
            Outstanding Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Client Table */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2 text-base font-semibold text-foreground border-b border-border/50 pb-2 px-2">
                <span className="col-span-6 text-left">Client</span>
                <span className="col-span-3 text-center">Outstanding</span>
                <span className="col-span-3 text-center">Outstanding %</span>
              </div>
              {outstandingClients.map((client, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/30 rounded px-2 transition-colors"
                >
                  <span className="col-span-6 text-foreground font-medium text-left">
                    {client.name}
                  </span>
                  <span className="col-span-3 text-foreground font-medium text-center">
                    {client.outstandingAmount}
                  </span>
                  <span className="col-span-3 text-foreground font-medium text-center">
                    {client.percentage}%
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
                        <DialogTitle>All Outstanding Revenue</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-auto">
                        <div className="grid grid-cols-12 gap-2 text-base font-semibold text-foreground border-b border-border/50 pb-2 mb-4">
                          <span className="col-span-4 text-left">Client</span>
                          <span className="col-span-4 text-center">
                            Outstanding
                          </span>
                          <span className="col-span-4 text-center">
                            Outstanding %
                          </span>
                        </div>
                        {allClients.map((client, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/30 rounded px-2 transition-colors"
                          >
                            <span className="col-span-4 text-foreground font-medium text-left">
                              {client.name}
                            </span>
                            <span className="col-span-4 text-foreground font-medium text-center">
                              {client.outstandingAmount}
                            </span>
                            <span className="col-span-4 text-foreground font-medium text-center">
                              {client.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Right side - Aligned Horizontal Bars */}
            <div className="flex flex-col justify-start relative">
              {/* Spacer to align with table header */}
              <div className="h-[2.5rem] border-b border-transparent pb-2"></div>

              {/* Aligned horizontal bars */}
              <div className="space-y-4">
                {outstandingClients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center py-2 h-[2.5rem]"
                  >
                    <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out cursor-pointer hover:brightness-110"
                        style={{
                          width: `${client.percentage}%`,
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                        onMouseEnter={(e) => handleBarHover(e, client)}
                        onMouseMove={(e) => handleBarHover(e, client)}
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
            {tooltipContent.name}: {tooltipContent.amount}
          </div>
        </div>
      )}
    </>
  );
}
