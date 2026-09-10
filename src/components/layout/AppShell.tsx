import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { SignedOut, UserButton } from "@/lib/auth/gates";
import { unlockAudio } from "@/lib/holofoil/audio";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import { NAV_ITEMS } from "@/lib/holofoil/nav";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      className="min-h-dvh bg-bg text-fg"
      onPointerDown={unlockAudio}
      onKeyDown={unlockAudio}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-cyan focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3 no-underline">
            <img
              src="/holofoil-h.jpg"
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-md object-contain"
            />
            <span className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.28em] text-cyan uppercase">
                AGENTROPOLIS
              </p>
              <p className="font-display text-xl leading-none tracking-tight text-fg">
                HOLOFOIL
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Deterministic Material System
              </p>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-3 py-2 text-sm no-underline transition-colors ${
                    active
                      ? "bg-bg-subtle text-cyan"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <SignedOut>
              <Link
                to="/login"
                className="ml-2 rounded-full bg-cyan px-3 py-2 text-sm font-medium text-bg no-underline"
              >
                Sign in
              </Link>
            </SignedOut>
            <UserButton />
          </nav>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
        {open ? (
          <nav
            id="mobile-nav"
            className="border-t border-border px-4 py-3 lg:hidden"
            aria-label="Mobile"
          >
            <ul className="grid gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm no-underline text-fg hover:bg-bg-subtle"
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-[10px] uppercase text-muted">
                      {item.hint}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <SignedOut>
                  <Link
                    to="/login"
                    className="flex min-h-11 items-center rounded-md px-3 text-sm text-cyan no-underline"
                  >
                    Sign in
                  </Link>
                </SignedOut>
              </li>
            </ul>
          </nav>
        ) : null}
        <div className="border-t border-border bg-bg-elevated/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:px-6">
            <span className="inline-flex items-center gap-2 text-lime">
              <span className="size-1.5 rounded-full bg-lime" aria-hidden />
              Operational
            </span>
            <span>Materials · deterministic</span>
            <span>{reduced ? "Reduced motion · static foil" : "Pointer / tilt live"}</span>
            <span className="ml-auto text-cyan">No mint · no wallet</span>
          </div>
        </div>
      </header>
      <div id="main">{children}</div>
    </div>
  );
}
