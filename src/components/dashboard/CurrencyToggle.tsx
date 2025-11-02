import { Button } from "@/components/ui/button";

interface CurrencyToggleProps {
  selectedCurrency: "INR" | "USD";
  onCurrencyChange: (currency: "INR" | "USD") => void;
}

export function CurrencyToggle({ selectedCurrency, onCurrencyChange }: CurrencyToggleProps) {
  return (
    <div className="flex rounded-md border border-border bg-background overflow-hidden">
      <Button
        variant={selectedCurrency === "INR" ? "default" : "ghost"}
        size="sm"
        onClick={() => onCurrencyChange("INR")}
        className={`rounded-none border-0 ${
          selectedCurrency === "INR" 
            ? "bg-primary text-primary-foreground" 
            : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        INR
      </Button>
      <Button
        variant={selectedCurrency === "USD" ? "default" : "ghost"}
        size="sm"
        onClick={() => onCurrencyChange("USD")}
        className={`rounded-none border-0 ${
          selectedCurrency === "USD" 
            ? "bg-primary text-primary-foreground" 
            : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        USD
      </Button>
    </div>
  );
}