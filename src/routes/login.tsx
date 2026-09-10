import { createFileRoute } from "@tanstack/react-router";
import { SignInButtons, SignedIn } from "@/lib/auth/gates";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.22em] text-cyan uppercase">
        Agentropolis
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Membership grants Holofoil tool access. It does not grant minting, wallet
        signing, publishing, or provider spend.
      </p>
      <div className="mt-8">
        <SignedIn>
          <p className="text-sm text-cyan">You are signed in.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-cyan">
            Back to Campus
          </Link>
        </SignedIn>
        <SignInButtons />
      </div>
    </main>
  );
}
