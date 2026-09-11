import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { KISS_MOTTO, PLAN_TIERS, SERVICE_BUFFET } from "@/lib/services/catalog";
import type { HolofoilServiceId } from "@/contracts/service-enrollment.v1";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function ServicesPage() {
  const { user, isPending } = useCurrentUserState();
  const [selected, setSelected] = useState<HolofoilServiceId[]>(["DROP_CREATION"]);
  const [plan, setPlan] = useState<(typeof PLAN_TIERS)[number]["id"]>("INDIVIDUAL");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedLabels = useMemo(
    () =>
      SERVICE_BUFFET.flatMap((step) => step.services)
        .filter((service) => selected.includes(service.id))
        .map((service) => service.label),
    [selected],
  );

  if (isPending) return null;
  if (!user) return <RedirectToSignIn to="/login" />;

  const founderName = user.displayName ?? user.primaryEmail ?? "Founder";

  function toggleService(id: HolofoilServiceId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">Holofoil Services</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">Pick what you need. NEURO handles the maze.</h1>
        <p className="mt-4 text-base text-muted">{KISS_MOTTO}</p>
      </header>

      <section className="mt-8 grid gap-4 rounded-2xl border border-cyan/30 bg-bg-elevated p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">Your concierge</p>
          <h2 className="mt-1 font-display text-2xl">NEURO · Holofoil Concierge</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            NEURO learns what you are building, shows one useful decision at a time, routes specialist agents behind the scenes,
            and brings back approvals, receipts and plain-language status.
          </p>
        </div>
        <div className="rounded-full border border-lime/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-lime">
          Assigned to {founderName}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="buffet-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Service buffet</p>
            <h2 id="buffet-heading" className="mt-1 font-display text-3xl">Walk the line</h2>
          </div>
          <p className="max-w-lg text-sm text-muted">Only the choices for this step stay visible. Advanced controls remain tucked away until you ask for them.</p>
        </div>

        <div className="mt-6 grid gap-4">
          {SERVICE_BUFFET.map((step) => (
            <article key={step.id} className="rounded-2xl border border-border bg-bg-elevated p-5">
              <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Step {step.index}</p>
                  <h3 className="mt-1 font-display text-2xl">{step.title}</h3>
                </div>
                <div>
                  <p className="text-lg font-medium">{step.question}</p>
                  <p className="mt-1 text-sm text-muted">{step.helper}</p>
                  <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {step.services.map((service) => {
                      const active = selected.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleService(service.id)}
                          className={`min-h-28 rounded-xl border p-4 text-left transition ${
                            active ? "border-lime bg-lime/10" : "border-border hover:border-cyan/50"
                          }`}
                        >
                          <span className="text-sm font-medium text-fg">{service.label}</span>
                          {service.optional ? (
                            <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Optional</span>
                          ) : null}
                          <span className="mt-2 block text-xs leading-relaxed text-muted">{service.description}</span>
                          <span className={`mt-3 block font-mono text-[10px] uppercase tracking-[0.14em] ${active ? "text-lime" : "text-muted"}`}>
                            {active ? "Selected" : "Add service"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <details className="mt-4 text-sm" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
                    <summary className="cursor-pointer text-cyan">Show what is behind this step</summary>
                    <p className="mt-2 text-xs text-muted">{step.advanced.join(" · ")}</p>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="plan-heading">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Workspace</p>
        <h2 id="plan-heading" className="mt-1 font-display text-3xl">Who is building with you?</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PLAN_TIERS.map((tier) => (
            <button
              key={tier.id}
              type="button"
              aria-pressed={plan === tier.id}
              onClick={() => setPlan(tier.id)}
              className={`rounded-2xl border p-5 text-left ${plan === tier.id ? "border-cyan bg-cyan/10" : "border-border bg-bg-elevated"}`}
            >
              <span className="font-display text-xl">{tier.label}</span>
              <span className="mt-2 block text-xs text-muted">{tier.seats}</span>
              <span className="mt-3 block text-sm text-muted">{tier.description}</span>
              <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-cyan">{tier.pricing}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-bg-elevated p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">Founder profile</p>
          <h2 className="mt-1 font-display text-2xl">{founderName}</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-muted">Role</dt><dd>Founder / workspace owner</dd></div>
            <div><dt className="text-muted">Email</dt><dd>{user.primaryEmail ?? "Not provided"}</dd></div>
            <div><dt className="text-muted">Plan</dt><dd>{PLAN_TIERS.find((tier) => tier.id === plan)?.label}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">Team plans add separate profiles and role-based permissions. A teammate never inherits founder authority just by joining the workspace.</p>
        </article>

        <article className="rounded-2xl border border-border bg-bg-elevated p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Your work film</p>
          <h2 className="mt-1 font-display text-2xl">See what the agents did for you</h2>
          <p className="mt-3 text-sm text-muted">
            Each project can receive a short composite video built from captured screenshots of agent work, verified milestones and receipt references.
            It is a proof-of-work recap, not staged activity.
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-cyan/30 p-4 text-sm text-muted">
            Video status · starts after project work produces captured evidence
          </div>
        </article>
      </section>

      <section className="mt-10 rounded-2xl border border-lime/30 bg-lime/5 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">Current selection</p>
        <h2 className="mt-1 font-display text-2xl">NEURO has your tray.</h2>
        <p className="mt-3 text-sm text-muted">{selectedLabels.length ? selectedLabels.join(" · ") : "No services selected yet."}</p>
        <p className="mt-3 text-xs text-muted">
          Service selection is not mint authority, wallet authority, publishing authority, financial approval, or an IP-rights grant.
        </p>
      </section>
    </main>
  );
}
