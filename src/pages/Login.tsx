import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PoweredByViable } from "@/components/dashboard/PoweredByViable";
import { authenticateUser } from "../lib/firebaseService";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import viableLogo from "@/assets/viable-logo.png";
import { getAdminEmails } from "@/lib/firebaseHelper";

const Login = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await authenticateUser(email, password);

      if (result.success && result.user) {
        // Store user info in sessionStorage
        sessionStorage.setItem("userId", result.user.id);
        sessionStorage.setItem("email", result.user.email || "");
        sessionStorage.setItem("userName", result.user.name || "");

        const adminEmails = await getAdminEmails();
        if (adminEmails.includes(result.user.email)) {
          nav("/client-selection");
        } else {
          nav("/home");
        }
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5 pointer-events-none" />

      <div className="w-full max-w-md relative">
        <Card className="bg-gradient-card border-border/50 shadow-card backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 flex items-center justify-center">
              <img
                src={viableLogo}
                alt="Viable"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to access your financial dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-background border-border/50 focus:border-primary transition-colors"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-background border-border/50 focus:border-primary transition-colors"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium transition-all duration-300 shadow-glow"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-8 text-center">
          <PoweredByViable />
        </div>
      </div>
    </div>
  );
};

export default Login;
