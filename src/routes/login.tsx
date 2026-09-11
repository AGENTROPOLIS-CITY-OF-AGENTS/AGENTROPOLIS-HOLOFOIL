import { createFileRoute } from "@tanstack/react-router";
import { SignInButtons, SignedIn } from "@/lib/auth/gates";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.22em] text-cyan uppercase">
        Holofoil Services
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">Sign in and meet NEURO</h1>
      <p className="mt-2 text-sm text-muted">
        Your Holofoil workspace includes NEURO as your agent concierge. NEURO keeps the service path simple,
        routes specialist agents behind the scenes, and brings back the decisions and receipts that need your attention.
      </p>
      <p className="mt-3 text-xs text-muted">
        Signing in does not grant minting, wallet signing, publishing, financial approval, or IP rights.
      </p>
      <div className="mt-8">
        <SignedIn>
          <p className="text-sm text-cyan">You are signed in. NEURO is ready.</p>
          <Link to="/services" className="mt-4 inline-block text-sm text-cyan">
            Open my services
          </Link>
        </SignedIn>
        <SignInButtons callbackURL="/services" />
      </div>
    </main>
  );
}
