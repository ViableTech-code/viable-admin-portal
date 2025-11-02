import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon, ChevronDown, Building2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { getAdminEmails, getSheetList } from "@/lib/firebaseHelper";
// Mock client data - replace with actual data source
const clients = [
  { id: "1", name: "Acme Corporation", industry: "Technology" },
  { id: "2", name: "TechStart Inc", industry: "Software" },
  { id: "3", name: "Global Ventures", industry: "Finance" },
  { id: "4", name: "Design Studios", industry: "Creative" },
  { id: "5", name: "Innovation Labs", industry: "Research" },
  { id: "6", name: "Market Leaders", industry: "Consulting" },
];

export default function ClientSelection() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selectedClient, setSelectedClient] = useState<
    (typeof clients)[0] | null
  >(null);
  const [clientList, setClientList] = useState<typeof clients>([]);
  const [open, setOpen] = useState(false);

  const handleClientSelect = (client: (typeof clients)[0]) => {
    setSelectedClient(client);
    setOpen(false);
  };

  const handleContinue = () => {
    if (selectedClient) {
      // Store selected client in sessionStorage or context
      sessionStorage.setItem("selectedClient", JSON.stringify(selectedClient));
      navigate("/home");
    }
  };

  const getClientList = async () => {
    const email = sessionStorage.getItem("email");
    if (!email) navigate("/login");

    const adminEmails = await getAdminEmails();
    if (!adminEmails.includes(email)) {
      navigate("/login");
    }
    localStorage.clear();

    const clientMap: typeof clients = await getSheetList();
    setClientList(clientMap);
  };
  useEffect(() => {
    getClientList();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Theme toggle */}
      <div className="absolute top-20 right-6 z-50">
        <Button
          variant="default"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground/20 shadow-2xl"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 -mt-16">
        {/* Main title with gradient */}
        <h1 className="text-7xl font-bold bg-gradient-to-r from-chart-1 to-chart-3 bg-clip-text text-transparent mb-6 tracking-tight">
          Visible
        </h1>

        {/* Powered by Viable */}
        <div className="flex items-center space-x-2 mb-12">
          <span className="text-lg text-muted-foreground">Powered by</span>
          <span className="text-xl font-semibold bg-gradient-to-r from-chart-2 to-chart-4 bg-clip-text text-transparent tracking-wide">
            Viable
          </span>
        </div>

        {/* Instruction text */}
        <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
          Select a client to continue
        </p>

        {/* Client selection panel */}
        <div className="w-full max-w-md space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-14 justify-between text-lg border-2 hover:bg-muted"
              >
                {selectedClient ? (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-chart-1" />
                    <div className="text-left">
                      <div className="font-medium">{selectedClient.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedClient.industry}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Choose a client...
                  </span>
                )}
                <ChevronDown className="h-5 w-5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[400px] p-0 bg-card border-2"
              align="center"
            >
              <div className="max-h-[400px] overflow-y-auto">
                {clientList.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors",
                      selectedClient?.id === client.id && "bg-muted"
                    )}
                  >
                    <Building2 className="h-5 w-5 text-chart-1 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.industry}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Continue button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedClient}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
