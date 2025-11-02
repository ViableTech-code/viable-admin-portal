import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { MonthSelector } from "./MonthSelector";
import { PoweredByViable } from "./PoweredByViable";
import { CurrencyToggle } from "./CurrencyToggle";
import { useGlobalState } from "@/context/GlobalStateContext";
import { getAuth, signOut } from "firebase/auth";

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const {
    selectedMonth,
    setSelectedMonth,
    selectedCurrency,
    setSelectedCurrency,
  } = useGlobalState();

  return (
    <header className="bg-gradient-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-border hover:bg-muted text-foreground"
              onClick={() => navigate("/home")}
            >
              Back to Home
            </Button>
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <CurrencyToggle
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
          </div>

          <div className="flex items-center space-x-4 relative">
            <PoweredByViable />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="border-border hover:bg-muted"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const auth = getAuth();
                await signOut(auth);
                navigate("/login");
              }}
              className="border-border hover:bg-muted"
            >
              Logout
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  );
}
