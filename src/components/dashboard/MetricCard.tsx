import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  label: string;
  value: string;
  subtitle?: string;
  change?: number; // month-on-month change percentage
  isHighlighted?: boolean;
  className?: string;
  growthPercentage?: number;
  onClick?: () => void;
}

export function MetricCard({
  title,
  label,
  value,
  subtitle,
  change,
  growthPercentage,
  isHighlighted = false,
  className = "",
  onClick,
}: MetricCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`
    h-32 transition-all duration-300 hover:scale-105 hover:shadow-primary/20
    bg-card border border-border
    hover:bg-gradient-card hover:border-primary/30 hover:animate-cosmic-glow
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `}
    >
      <CardContent className="h-full flex flex-col justify-between p-4 relative">
        {/* Month-on-month change indicator */}
        {change !== undefined && (
          <div
            className={`absolute top-2 right-2 flex items-center space-x-1 text-xs ${
              change >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}

        <h3
          className={`text-xs font-medium text-left ${
            isHighlighted ? "text-muted-foreground" : "text-muted-foreground"
          }`}
        >
          {title}
        </h3>
        <div className="flex flex-col">
          <p
            className={`text-3xl font-bold text-left ${
              isHighlighted ? "text-primary" : "text-foreground"
            }`}
          >
            {value}
          </p>
          {title == "Bank Profit" || title == "Billed Profit" ? (
            <span className={`text-xl text-left text-primary`}>
              ({growthPercentage}%)
            </span>
          ) : (
            <></>
          )}
          {subtitle && (
            <p
              className={`text-lg font-medium text-left mt-1 ${
                isHighlighted ? "text-primary/80" : "text-foreground/80"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
