import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SignInButtons, SignedIn } from "@/lib/auth/gates";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const oauthFailed = search.includes("error=");

  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.22em] text-cyan uppercase">
        Holofoil Services
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">Sign in and meet NEURO</h1>
      <p className="mt-2 text-sm text-muted">
        Your Holofoil workspace includes NEURO as your agent concierge. Signing in does not grant
        minting, wallet signing, publishing, financial approval, or IP rights.
      </p>
      {oauthFailed ? (
        <p className="mt-4 rounded-xl border border-crimson/40 bg-crimson/10 p-3 text-sm text-crimson">
          That sign-in didn’t complete. Try another method, or use email.
        </p>
      ) : null}
      <div className="mt-8">
        <SignedIn>
          <p className="text-sm text-cyan">You are signed in. NEURO is ready.</p>
          <Link to="/services" className="mt-4 inline-block min-h-11 text-sm text-cyan">
            Open my services
          </Link>
        </SignedIn>
        <SignInButtons callbackURL="/services" />
        <EmailAuth />
      </div>
    </main>
  );
}

function EmailAuth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0] || "Founder",
          callbackURL: "/services",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/services",
        });
        if (err) throw new Error(err.message);
      }
      window.location.href = "/services";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-8 grid gap-3 border-t border-border pt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Or use email</p>
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="you@studio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-h-12 rounded-xl border border-border bg-bg px-4 text-sm"
      />
      <input
        type="password"
        required
        minLength={8}
        autoComplete={mode === "up" ? "new-password" : "current-password"}
        placeholder="Password (8+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="min-h-12 rounded-xl border border-border bg-bg px-4 text-sm"
      />
      {error ? <p className="text-sm text-crimson">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 rounded-full bg-lime px-4 text-sm font-medium text-bg disabled:opacity-50"
      >
        {busy ? "Working…" : mode === "up" ? "Create account" : "Sign in with email"}
      </button>
      <button
        type="button"
        className="min-h-11 text-sm text-cyan"
        onClick={() => setMode(mode === "up" ? "in" : "up")}
      >
        {mode === "up" ? "Have an account? Sign in" : "New here? Create an account"}
      </button>
    </form>
  );
}
