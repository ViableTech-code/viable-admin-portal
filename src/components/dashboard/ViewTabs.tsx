import { Button } from "@/components/ui/button";

interface ViewTabsProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function ViewTabs({ activeView, onViewChange }: ViewTabsProps) {
  const tabs = [
    { id: "summary", label: "Summary View" },
    { id: "billing", label: "Billing View" },
    { id: "bank", label: "Bank View" },
  ];

  return (
    <div className="flex justify-center gap-2 p-6">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeView === tab.id ? "default" : "outline"}
          onClick={() => onViewChange(tab.id)}
          className={`px-6 ${
            activeView === tab.id
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "border-border bg-transparent text-foreground hover:bg-muted"
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}