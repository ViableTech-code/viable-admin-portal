import { Currency } from "@/lib/sheetData";
import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type CurrencyType = "INR" | "USD";

interface GlobalStateContextValue {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
}

const GlobalStateContext = createContext<GlobalStateContextValue | undefined>(
  undefined
);

interface GlobalStateProviderProps {
  children: ReactNode;
}

export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("total");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");

  const value = useMemo(
    () => ({
      selectedMonth,
      setSelectedMonth,
      selectedCurrency,
      setSelectedCurrency,
    }),
    [selectedMonth, selectedCurrency]
  );

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState(): GlobalStateContextValue {
  const ctx = useContext(GlobalStateContext);
  if (!ctx) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return ctx;
}
