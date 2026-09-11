import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { mintReceiptFromPrep, prepareMint } from "@/lib/holofoil/mint-service";

export const Route = createFileRoute("/embed/mint")({ component: EmbedMint });

function EmbedMint() {
  const [qty, setQty] = useState(1);
  const [wallet, setWallet] = useState(false);
  const req = {
    version: "1.0.0" as const,
    projectId: "hood-terps",
    collectionId: "hood-terps:collection",
    quantity: qty,
    recipient: wallet ? "connected-account" : undefined,
    chainId: "46630",
  };
  const prep = prepareMint(req);
  const receipt = mintReceiptFromPrep(req, prep);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">Holofoil mint service</p>
      <h1 className="mt-2 font-display text-3xl">Mint panel</h1>
      <p className="mt-2 text-sm text-muted">
        HOOD TERPS test mint path. Holofoil prepares the mint; AGENTROPOLIS AQUEDUCT handles testnet provisioning.
      </p>
      <p className="mt-4 text-sm">
        Phase: {prep.state} · {prep.chainLabel}
      </p>
      <p className="text-sm text-muted">{prep.simulation.note}</p>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" className="size-11 rounded-full border border-border" onClick={() => setQty((n) => Math.max(1, n - 1))}>
          -
        </button>
        <span className="font-display text-2xl">{qty}</span>
        <button type="button" className="size-11 rounded-full border border-border" onClick={() => setQty((n) => Math.min(20, n + 1))}>
          +
        </button>
      </div>
      <button
        type="button"
        className="mt-4 min-h-11 w-full rounded-full border border-lime text-lime"
        onClick={() => setWallet(true)}
      >
        {wallet ? "Account attached (simulation)" : "Connect account to mint"}
      </button>
      {prep.provisioning ? (
        <a
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full border border-cyan px-4 text-center text-sm font-semibold text-cyan"
          href={prep.provisioning.url}
          target="_blank"
          rel="noreferrer"
        >
          Get Robinhood testnet ETH via AQUEDUCT
        </a>
      ) : null}
      {prep.provisioning ? (
        <p className="mt-2 text-xs text-muted">
          {prep.provisioning.note} Return here after your test wallet is funded.
        </p>
      ) : null}
      <pre className="mt-4 overflow-auto rounded-xl border border-border p-3 font-mono text-[11px] text-muted">
        {JSON.stringify(receipt, null, 2)}
      </pre>
    </main>
  );
}
