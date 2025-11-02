import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import Expenses from "./pages/Expenses";
import Profit from "./pages/Profit";
import BankRevenue from "./pages/BankRevenue";
import BankExpenses from "./pages/BankExpenses";
import BankProfit from "./pages/BankProfit";
import Liquidity from "./pages/Liquidity";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import routes from "./routes";
import { GlobalStateProvider } from "./context/GlobalStateContext";

const queryClient = new QueryClient();
const AppRoutes = () => {
  return useRoutes(routes);
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalStateProvider>
            <AppRoutes />
          </GlobalStateProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
