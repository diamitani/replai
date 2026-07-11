"use client";

import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "Sign-in failed. Try again."
      : searchParams.get("error")
  );

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  const ensureProfile = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;

    await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        display_name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          user.email.split("@")[0],
      },
      { onConflict: "id" }
    );
  };

  const goToDashboard = async () => {
    await ensureProfile();
    window.location.assign("/chats");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    setError(null);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo(),
            data: {
              full_name: email.split("@")[0],
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        // Confirm email OFF → session comes back on signup
        if (data.session) {
          await goToDashboard();
          return;
        }

        // Fallback: sign in with the same credentials right away
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          setError(
            signInError.message.includes("Invalid login")
              ? "That email may already be registered — switch to Sign in."
              : signInError.message
          );
          setMode("signin");
          return;
        }

        if (signInData.session) {
          await goToDashboard();
          return;
        }

        setError(
          "No session after signup. In Supabase → Auth → Providers → Email, turn Confirm email OFF."
        );
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!data.session) {
        setError("Sign-in succeeded but no session was created. Try again.");
        return;
      }

      await goToDashboard();
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setLoading("google");
    setError(null);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (oauthError) {
      setLoading(null);
      setError(oauthError.message);
    }
  };

  return (
    <Card className="w-full max-w-md border-brand-100 shadow-brand">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "Sign in to start messaging with AI guardrails."
            : "Join Replai — think before you send."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-brand-50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              mode === "signin"
                ? "bg-white text-brand-800 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              mode === "signup"
                ? "bg-white text-brand-800 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign up
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full border-brand-200 bg-white hover:bg-brand-50"
          onClick={() => void handleGoogle()}
          disabled={loading !== null}
        >
          {loading === "google" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-5" />
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-brand-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">or email</span>
          </div>
        </div>

        <form onSubmit={(e) => void handleEmailAuth(e)} className="space-y-3">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="border-brand-200 focus-visible:border-brand-400"
          />
          <Input
            type="password"
            placeholder={mode === "signup" ? "Create a password (min 6)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="border-brand-200 focus-visible:border-brand-400"
          />
          <Button
            type="submit"
            className="h-11 w-full bg-brand-600 hover:bg-brand-700"
            disabled={loading !== null}
          >
            {loading === "email" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {mode === "signup" ? "Creating account..." : "Signing in..."}
              </>
            ) : mode === "signup" ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-brand-subtle px-4 py-12">
      <div className="mb-8">
        <Logo size="lg" href="/" />
      </div>
      <Suspense
        fallback={
          <Card className="w-full max-w-md border-brand-100 p-8 text-center text-sm text-muted-foreground">
            Loading...
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
