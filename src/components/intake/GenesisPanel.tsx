import { HOOD_TERPS_GENESIS_033 } from "@/contracts/hood-terps-genesis-033.v1";
import { generateGenesis033, genesisCoverage } from "@/lib/hood-terps/genesis-033";
import { HT_EYE_STATE_COUNT, HT_ORDERED_EYE_PAIRS } from "@/lib/hood-terps/catalog";

export function GenesisPanel() {
  const items = generateGenesis033();
  const coverage = genesisCoverage(items);
  return (
    <section className="mt-6 rounded-2xl border border-lime/30 bg-bg-elevated p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">GENESIS TEST 033</p>
      <p className="mt-2 text-sm">
        Test collection {coverage.ready} / {coverage.total} QC pass · production mint OFF · publish OFF · mainnet OFF
      </p>
      <p className="mt-2 text-xs text-muted">
        IP owner {HOOD_TERPS_GENESIS_033.ipOwner}. {HT_EYE_STATE_COUNT} eye states per side. {HT_ORDERED_EYE_PAIRS}{" "}
        theoretical ordered pairs — design space, not rarity.
      </p>
      <p className="mt-2 text-xs text-muted">
        Coverage · presentations {coverage.presentations ? "yes" : "no"} · colorways {coverage.colorways ? "yes" : "no"} ·
        eyes {coverage.eyeStyles ? "yes" : "no"} · mixed {coverage.mixedEyes ? "yes" : "no"}
      </p>
      <p className="mt-3 text-xs text-muted">
        No reconstructed pixels, token IDs, or testnet receipts were invented. Constrained trait vectors and DNA only.
      </p>
    </section>
  );
}
