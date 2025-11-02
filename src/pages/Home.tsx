import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon, Loader } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { getGoogleSheetData } from "@/helper/sheetAPIs";
import { transformGoogleSheet } from "@/lib/sheet-conversion";
import { getAuth, signOut } from "firebase/auth";

export default function Home() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;
    checkSheetAccess();
  }, []);

  const checkSheetAccess = async () => {
    setCheckingAccess(true);
    try {
      const snap = await getDocs(collection(db, "sheets"));
      const currentUserEmail = auth.currentUser?.email?.toLowerCase();
      const docs = snap.docs
        .filter((d) =>
          (d.data().sharedWith || [])
            .map((email: string) => email.toLowerCase())
            .includes(currentUserEmail)
        )
        .map((d) => ({ id: d.id, meta: d.data() }));
      if (!docs || !docs.length) {
        setHasAccess(false);
      } else {
        sessionStorage.setItem("sheetId", docs[0].id);
        setHasAccess(true);
        await getSheetData();
      }
    } catch (err) {
      console.error("Failed to check sheet access:", err);
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const getSheetData = async () => {
    const selectedClient = sessionStorage.getItem("selectedClient");
    const spreadsheetId = selectedClient
      ? JSON.parse(selectedClient).id
      : sessionStorage.getItem("sheetId");
    const data = await getGoogleSheetData(spreadsheetId);
    await transformGoogleSheet(data);
  };
  const handleViewNavigation = (view: string) => {
    if (view === "summary") {
      navigate("/summary");
    } else if (view === "bank") {
      navigate("/bank-revenue");
    } else {
      navigate("/billed-revenue", { state: { activeView: view } });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Theme toggle */}
      {checkingAccess && (
        <div className="absolute w-[100vw] h-[100vh] bg-white text-black flex items-center justify-center opacity-50 z-50">
          <Loader className="animate-spin" />
        </div>
      )}
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

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 -mt-16">
        {/* Main title */}
        <h1 className="text-7xl font-bold bg-gradient-to-r from-chart-1 to-chart-3 bg-clip-text text-transparent mb-6 tracking-tight">
          Visible
        </h1>

        {/* Powered by */}
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-lg text-muted-foreground">Powered by</span>
          <span className="text-xl font-semibold bg-gradient-to-r from-chart-2 to-chart-4 bg-clip-text text-transparent tracking-wide">
            Viable
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xl text-muted-foreground mb-12 text-center max-w-md">
          Your Numbers, Your Narrative
        </p>

        {/* Google Sheets access status */}
        {checkingAccess && (
          <p className="text-muted-foreground text-lg mb-6">
            Checking Google Sheets access...
          </p>
        )}
        {!checkingAccess && hasAccess === false && (
          <p className="text-red-500 text-lg mb-6">
            You don’t have access to the default sheet.
          </p>
        )}
        {!checkingAccess && hasAccess === true && (
          <p className="text-green-500 text-lg mb-6">
            Google Sheets access verified ✅
          </p>
        )}

        {/* View buttons */}
        <div className="flex gap-0 rounded-lg border border-border overflow-hidden">
          <Button
            onClick={() => handleViewNavigation("summary")}
            variant="outline"
            className="rounded-none border-y-0 border-l-0 bg-background hover:bg-muted text-foreground px-8 py-3 text-lg"
          >
            Summary View
          </Button>
          <Button
            onClick={() => handleViewNavigation("billing")}
            variant="outline"
            className="rounded-none border-y-0 border-l-0 bg-background hover:bg-muted text-foreground px-8 py-3 text-lg"
          >
            Billing View
          </Button>
          <Button
            onClick={() => handleViewNavigation("bank")}
            variant="outline"
            className="rounded-none border-y-0 border-l-0 bg-background hover:bg-muted text-foreground px-8 py-3 text-lg"
          >
            Bank View
          </Button>
        </div>
      </div>
    </div>
  );
}
