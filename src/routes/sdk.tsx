import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { playTone } from "@/lib/holofoil/audio";
import {
  collectibleToArcanaPlacement,
  materialToCollectible,
  originToMaterial,
  SAMPLE_ORIGIN_ASSET,
} from "@/lib/holofoil/contracts";
import { exportMaterialJson } from "@/lib/holofoil/materials";

export const Route = createFileRoute("/sdk")({ component: SdkPage });

function SdkPage() {
  const pipeline = useMemo(() => {
    const material = originToMaterial(SAMPLE_ORIGIN_ASSET);
    const collectible = materialToCollectible(SAMPLE_ORIGIN_ASSET, material);
    const placement = collectibleToArcanaPlacement(collectible, "museum");
    return { material, collectible, placement };
  }, []);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(label);
    playTone("confirm");
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
          SDK / Integration
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Typed adapter contracts.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Origin Engine approved asset → Holofoil material configuration →
          rendered collectible → optional ARCANA-54 spatial placement. Holofoil
          does not mint, sign, deploy, or bill generation. AGENTROPOLIS-54T
          owns security.
        </p>
      </header>

      <ol className="grid gap-4">
        <ContractCard
          step="01"
          title="Origin Engine approved asset"
          body="Asset identity, QC, source hash and artwork URI. Holofoil never copies Origin Engine source."
          value={SAMPLE_ORIGIN_ASSET}
          copied={copied === "origin"}
          onCopy={() => void copy("origin", SAMPLE_ORIGIN_ASSET)}
        />
        <ContractCard
          step="02"
          title="Holofoil material configuration"
          body="Canonical JSON another Agentropolis application can consume."
          value={JSON.parse(exportMaterialJson(pipeline.material))}
          copied={copied === "material"}
          onCopy={() => void copy("material", pipeline.material)}
        />
        <ContractCard
          step="03"
          title="Rendered collectible"
          body="Foil hash plus locked dimensions. Presentation only."
          value={pipeline.collectible}
          copied={copied === "collectible"}
          onCopy={() => void copy("collectible", pipeline.collectible)}
        />
        <ContractCard
          step="04"
          title="Optional ARCANA-54 placement"
          body="A transform into arcade, relic, museum or open rooms. ARCANA-54 consumes this; it is not implemented here."
          value={pipeline.placement}
          copied={copied === "arcana"}
          onCopy={() => void copy("arcana", pipeline.placement)}
        />
      </ol>
    </main>
  );
}

function ContractCard({
  step,
  title,
  body,
  value,
  copied,
  onCopy,
}: {
  step: string;
  title: string;
  body: string;
  value: unknown;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="rounded-[22px] border border-border bg-bg-elevated p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan">
            {step}
          </p>
          <h2 className="mt-1 font-display text-xl">{title}</h2>
          <p className="mt-2 text-sm text-muted">{body}</p>
        </div>
        <button
          type="button"
          className="min-h-11 shrink-0 rounded-full border border-border px-3 text-xs"
          onClick={onCopy}
        >
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>
      <pre className="mt-4 overflow-auto rounded-[14px] bg-bg p-4 font-mono text-[11px] leading-relaxed text-muted">
        {JSON.stringify(value, null, 2)}
      </pre>
    </article>
  );
}
