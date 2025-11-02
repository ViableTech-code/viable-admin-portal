import React from "react";
import { useLocation } from "react-router-dom";
import { MetricCard } from "./MetricCard";

const CommanBankHeader = ({ summaryMetrics, dataService, navigate }) => {
  const location = useLocation();
  const renderCard = (key, title, route) => {
    const m = summaryMetrics.find((x) => x.title === key);
    const label = m ? m.label : title;
    const value = m ? dataService.formatCurrency(m.value) : "$$$";
    const change = m ? m.change : 0;

    // highlight if route matches
    const isActive = location.pathname === route;

    return (
      <MetricCard
        key={key}
        title={label}
        value={value}
        change={change}
        isHighlighted={isActive}
        onClick={() => navigate(route)}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {renderCard("Bank Revenue", "Revenue", "/bank-revenue")}
      {renderCard("Bank Expenses", "Expenses", "/bank-expenses")}
      {renderCard("Bank Profit", "Profit", "/bank-profit")}
      {renderCard("Liquidity", "Liquidity", "/liquidity")}
    </div>
  );
};

export default CommanBankHeader;
