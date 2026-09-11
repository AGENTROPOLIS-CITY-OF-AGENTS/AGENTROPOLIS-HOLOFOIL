import type { LayerAsset } from "./types.ts";

function svgData(body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" shape-rendering="geometricPrecision">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** SAMPLE starter catalog. Not user canon. Do not treat as invented project traits. */
export function sampleCatalog(): LayerAsset[] {
  return [
    {
      id: "bg-void",
      group: "Backdrop",
      value: "Void",
      z: 0,
      visible: true,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<rect width="512" height="512" fill="#070709"/><circle cx="256" cy="180" r="120" fill="#10141c"/><circle cx="256" cy="180" r="40" fill="#3ee0ff" opacity=".18"/>`,
      ),
    },
    {
      id: "bg-grid",
      group: "Backdrop",
      value: "Neon Grid",
      z: 0,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<rect width="512" height="512" fill="#070709"/><path d="M0 96h512M0 192h512M0 288h512M0 384h512M96 0v512M192 0v512M288 0v512M384 0v512" stroke="#3ee0ff" stroke-width="1.2" opacity=".28"/><rect x="40" y="40" width="432" height="432" fill="none" stroke="#c4454a" opacity=".22"/>`,
      ),
    },
    {
      id: "bg-chamber",
      group: "Backdrop",
      value: "Fog Chamber",
      z: 0,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<rect width="512" height="512" fill="#0c1014"/><ellipse cx="256" cy="420" rx="200" ry="50" fill="#3ee0ff" opacity=".08"/><rect x="96" y="64" width="320" height="360" rx="16" fill="#16161c" stroke="#8b7cff" opacity=".55"/>`,
      ),
    },
    {
      id: "fig-warden",
      group: "Figure",
      value: "Warden",
      z: 1,
      visible: true,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<path d="M256 96l70 36v92l-70 40-70-40v-92z" fill="#1b2430" stroke="#3ee0ff" stroke-width="4"/><rect x="214" y="248" width="84" height="150" rx="8" fill="#141820" stroke="#8b939c"/><circle cx="256" cy="168" r="22" fill="#070709" stroke="#3ee0ff" stroke-width="3"/>`,
      ),
    },
    {
      id: "fig-courier",
      group: "Figure",
      value: "Courier",
      z: 1,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<path d="M200 140h112l24 200H176z" fill="#12161c" stroke="#b6f25c" stroke-width="3"/><circle cx="256" cy="128" r="28" fill="#1a1f26" stroke="#3ee0ff"/><path d="M176 340h160l-20 72H196z" fill="#0e1218" stroke="#c4454a"/>`,
      ),
    },
    {
      id: "fig-ghost",
      group: "Figure",
      value: "Ghost",
      z: 1,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<ellipse cx="256" cy="220" rx="88" ry="130" fill="#8b7cff" opacity=".28"/><ellipse cx="256" cy="168" rx="36" ry="40" fill="#e8eef2" opacity=".18"/>`,
      ),
    },
    {
      id: "acc-cyan",
      group: "Accent",
      value: "Cyan visor",
      z: 2,
      visible: true,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<rect x="208" y="154" width="96" height="22" rx="6" fill="#3ee0ff" opacity=".92"/>`,
      ),
    },
    {
      id: "acc-crimson",
      group: "Accent",
      value: "Crimson visor",
      z: 2,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<rect x="208" y="154" width="96" height="22" rx="6" fill="#c4454a" opacity=".92"/>`,
      ),
    },
    {
      id: "acc-none",
      group: "Accent",
      value: "None",
      z: 2,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(`<rect width="512" height="512" fill="none"/>`),
    },
    {
      id: "mark-h",
      group: "Mark",
      value: "Holofoil H",
      z: 3,
      visible: true,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<path d="M196 360h24v40h72v-40h24v96h-24v-40h-72v40h-24z" fill="#e8eef2"/><path d="M196 360h24v40" stroke="#3ee0ff" stroke-width="3"/><path d="M292 360h24v96" stroke="#c4454a" stroke-width="3"/>`,
      ),
    },
    {
      id: "mark-serial",
      group: "Mark",
      value: "Serial bar",
      z: 3,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(
        `<rect x="160" y="400" width="192" height="18" rx="4" fill="#b6f25c"/><text x="256" y="414" text-anchor="middle" font-size="12" font-family="monospace" fill="#070709">SERIAL</text>`,
      ),
    },
    {
      id: "mark-none",
      group: "Mark",
      value: "None",
      z: 3,
      visible: false,
      locked: false,
      source: "SAMPLE",
      src: svgData(`<rect width="512" height="512" fill="none"/>`),
    },
  ];
}

export function layerFromUpload(file: File, dataUrl: string, z: number): LayerAsset {
  const name = file.name.replace(/\.[^.]+$/, "").slice(0, 48) || "upload";
  return {
    id: `upload-${crypto.randomUUID()}`,
    group: "Uploaded",
    value: name,
    src: dataUrl,
    z,
    visible: true,
    locked: false,
    source: "UPLOAD",
    filename: file.name,
  };
}
