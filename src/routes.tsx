import { RouteObject } from "react-router-dom";

import Home from "./pages/Home";
import Summary from "./pages/Summary";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Profit from "./pages/Profit";
import BankRevenue from "./pages/BankRevenue";
import BankExpenses from "./pages/BankExpenses";
import BankProfit from "./pages/BankProfit";
import Liquidity from "./pages/Liquidity";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ClientSelection from "./pages/ClientSelection";

const routes: RouteObject[] = [
  { path: "/", element: <Login /> },
  { path: "/home", element: <Home /> },
  { path: "/summary", element: <Summary /> },
  { path: "/billed-revenue", element: <Dashboard /> },
  { path: "/billed-expenses", element: <Expenses /> },
  { path: "/billed-profit", element: <Profit /> },
  { path: "/bank-revenue", element: <BankRevenue /> },
  { path: "/bank-expenses", element: <BankExpenses /> },
  { path: "/bank-profit", element: <BankProfit /> },
  { path: "/liquidity", element: <Liquidity /> },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
  { path: "/client-selection", element: <ClientSelection /> },
];

export default routes;
