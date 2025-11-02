import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { format } from "date-fns";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (date: string) => void;
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
}: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate list of months from April 2025 to March 2026
  const generateMonthOptions = () => {
    const options = [
      {
        value: "total",
        label: "Total",
      },
      {
        value: "april",
        label: "April",
      },
      {
        value: "may",
        label: "May",
      },
      {
        value: "june",
        label: "June",
      },
      {
        value: "july",
        label: "July",
      },
      {
        value: "august",
        label: "August",
      },
      {
        value: "september",
        label: "September",
      },
      {
        value: "october",
        label: "October",
      },
      {
        value: "november",
        label: "November",
      },
      {
        value: "december",
        label: "December",
      },
      {
        value: "january",
        label: "January",
      },
      {
        value: "february",
        label: "February",
      },
      {
        value: "march",
        label: "March",
      },
    ];
    return options;
    // // Add "Total as of today" option
    // options.push({
    //   value: "total",
    //   label: "Total as of today",
    //   date: new Date(),
    // });

    // // Add months from April 2025 to March 2026
    // const startDate = new Date(2025, 3, 1); // April 2025 (month is 0-indexed)
    // const endDate = new Date(2026, 2, 1);   // March 2026

    // const current = new Date(startDate);
    // while (current <= endDate) {
    //   options.push({
    //     value: format(current, "yyyy-MM"),
    //     label: format(current, "MMMM yyyy"),
    //     date: new Date(current),
    //   });
    //   current.setMonth(current.getMonth() + 1);
    // }

    // return options;
  };

  const monthOptions = generateMonthOptions();
  const isTotal = selectedMonth === "total";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[160px] justify-between border-border hover:bg-muted"
        >
          {isTotal
            ? "Total as of today"
            : monthOptions.find((option) => option.value === selectedMonth)
                ?.label}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[200px] bg-card border-border"
      >
        {monthOptions.map((option) => {
          const isSelected =
            option.value === "total" ? isTotal : selectedMonth === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                onMonthChange(option.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-between hover:bg-muted cursor-pointer"
            >
              <span>{option.label}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
