import { useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PoweredByViable } from "@/components/dashboard/PoweredByViable";
import { getAdminEmails } from "@/lib/firebaseHelper";

const Login = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGoogleSignIn() {
    setError(null);
    try {
      // Request the Sheets + Drive readonly scopes to get an OAuth access token on login
      googleProvider.addScope(
        "https://www.googleapis.com/auth/spreadsheets.readonly"
      );
      googleProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
      const result = await signInWithPopup(auth, googleProvider);
      // result contains user, credential, and credential.accessToken
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) throw new Error("No OAuth credential found");
      const accessToken = credential.accessToken;
      sessionStorage.setItem("accessToken", accessToken || "");
      sessionStorage.setItem("email", result.user.email || "");
      // You can read credential.accessToken to call Sheets API immediately on the client.
      const adminEmails = await getAdminEmails();
      if (adminEmails.includes(result.user.email)) {
        nav("/client-selection");
      } else {
        nav("/home");
      }
    } catch (err: any) {
      console.log("🚀 ~ onGoogleSignIn ~ err:", err);
      setError(err.message);
    }
  }

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Main auth card */}
        <Card className="bg-gradient-card border-border/50 shadow-card backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {/* Logo/Brand area */}
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-sm"></div>
              </div>
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
            {/* Google Sign In Button */}
            <Button
              onClick={onGoogleSignIn}
              disabled={loading}
              className="w-full h-12 bg-card hover:bg-card/80 border border-border/50 text-foreground font-medium transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg group"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </div>
            </Button>

            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div> */}

            {/* Alternative auth options */}
            {/* <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => console.log("Email login clicked")}
              >
                Sign in with Email
              </Button>
            </div> */}

            {/* Terms and Privacy */}
            <div className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <button className="underline hover:text-primary transition-colors">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="underline hover:text-primary transition-colors">
                Privacy Policy
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <PoweredByViable />
        </div>
      </div>
    </div>
  );
};

export default Login;
