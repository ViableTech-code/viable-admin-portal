import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { dataService } from "@/lib/dataService";

interface ClientProfitabilityProps {
  selectedMonth: string;
  selectedCurrency: string;
}

export function ClientProfitabilityBank({
  selectedMonth,
  selectedCurrency,
}: ClientProfitabilityProps) {
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

  const allClientDataRaw = useMemo(
    () =>
      dataService.getBankClientProfitability(selectedMonth, selectedCurrency),
    [selectedMonth, selectedCurrency]
  );
  const allClientData = useMemo(
    () =>
      allClientDataRaw.filter(
        (c) =>
          c.realisedRevenue !== 0 ||
          c.realisedExpenses !== 0 ||
          c.grossProfit !== 0
      ),
    [allClientDataRaw]
  );

  const topClients = useMemo(
    () =>
      dataService
        .getBankClientProfitability(selectedMonth, selectedCurrency, 5)
        .filter(
          (c) =>
            c.realisedRevenue !== 0 ||
            c.realisedExpenses !== 0 ||
            c.grossProfit !== 0
        ),
    [selectedMonth, selectedCurrency]
  );

  const formatCurrency = (value: number) => dataService.formatCurrency(value);

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground text-right mr-4">
          Client Wise Profitability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Client Name
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Expenses
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Gross Profit
                </th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((client, index) => (
                <tr
                  key={index}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {client.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-right">
                    {formatCurrency(client.realisedRevenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-right">
                    {formatCurrency(client.realisedExpenses)}
                  </td>
                  <td
                    className="py-3 px-4 text-sm font-medium text-primary text-right cursor-pointer"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        content: `Gross Profit: ${client.grossProfitPercentage.toFixed(
                          1
                        )}% of Revenue`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                      });
                    }}
                    onMouseLeave={() =>
                      setTooltip((prev) => ({ ...prev, visible: false }))
                    }
                  >
                    {formatCurrency(client.grossProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>All Clients Profitability</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Client Name
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Revenue
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Expenses
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Gross Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allClientData.map((client, index) => (
                        <tr
                          key={index}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-foreground">
                            {client.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground text-right">
                            {formatCurrency(client.realisedRevenue)}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground text-right">
                            {formatCurrency(client.realisedExpenses)}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-primary text-right">
                            {formatCurrency(client.grossProfit)} (
                            {client.grossProfitPercentage.toFixed(1)}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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
