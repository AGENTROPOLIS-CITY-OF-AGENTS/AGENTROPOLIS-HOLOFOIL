# Holofoil Media-Surface Engine

Evergreen Holofoil capability. Consuming apps supply media, surface placements, themes, and optional adapters. The core never owns project titles, campaigns, routes, or filenames.

## Public API

```ts
registerHolofoilMedia(records)
registerHolofoilSurfaces(surfaces)
registerHolofoilTheme(theme)
registerHolofoilAdapter(kind, adapter)
mountHolofoilSurface(surfaceId)
updateHolofoilContext(context)
disposeHolofoil()
```

Import from `@/lib/holofoil/media-surfaces`.
The React Three Fiber adapter is **opt-in**:

```ts
import { HolofoilR3FSurface } from "@/lib/holofoil/media-surfaces/adapters/r3f"
```

Do not import the R3F adapter from 2D routes.

## Integration

1. Register media records with rights, alt text, and `rights.approved: true`.
2. Register surfaces that reference those ids.
3. Mount a DOM or R3F surface.
4. Call `updateHolofoilContext` with camera, visibility, and device flags.
5. Dispose on unmount.

Neutral example:

```ts
registerHolofoilMedia([{
  id: "media-001",
  source: "/media/media-001.mp4",
  mediaType: "video",
  poster: "/media/media-001.jpg",
  title: "Sample",
  altText: "Sample surface",
  rights: { owner: "owner-001", license: "internal", approved: true },
  moderationStatus: "approved",
}])
registerHolofoilSurfaces([{
  id: "surface-001",
  format: "wall",
  mediaIds: ["media-001"],
  themeId: "theme-default",
}])
```

## Manifests

- Media schema: `HolofoilMediaRecord`
- Surface schema: `HolofoilSurfaceRecord`
- Theme schema: `HolofoilMediaTheme`

Invalid records warn and are skipped. Unapproved, expired, or rights-missing media fail closed and render a neutral fallback.

## Renderer adapters

- DOM / CSS: `HolofoilDomSurface`
- React Three Fiber / Three.js: `HolofoilR3FSurface`
- HLS and live streams: optional `registerHolofoilAdapter("hls", adapter)`
- Canvas / future spatial runtimes: implement against `createManagedVideo` + `mountHolofoilSurface`

## Performance budget

Configurable via `engine.governor`:

- max concurrent playing surfaces (desktop / mobile)
- distance / activation radius
- page visibility
- reduced motion (poster only)
- save-data
- frame-time backoff
- DPR cap (`maxDpr`)

Physical surfaces remain in the world when paused.

## Audio

Muted by default. One audible surface. Global mute persists. Focus loss mutes. User gesture required.

## Accessibility

Public media should include title, alt text, and captions/transcript. Gaps are reported before release. Keyboard: Enter/Space authorize audio, Escape closes expanded view, M toggles global mute.

## Rights

Required before public render: owner, license, `approved: true`. Optional: audience, rating, schedule, provenance, destination URL (never inferred from filenames).

## Telemetry

Disabled until `registerHolofoilAdapter("telemetry", { emit })`. Events are surface/media ids only.

## Ingest

```
node scripts/holofoil-media-ingest.mjs public/media
```

Writes draft records. Drafts are not approved.

## Migration

Project-specific billboards move to a consumer module (example: `src/data/media-surfaces/campus.ts`). Components import the Holofoil API instead of hard-coded filenames.

## Troubleshooting

- Autoplay rejected → poster fallback, no crash
- Duplicate ids → second record skipped
- Missing source → surface shows neutral fallback
- Abandoned decoders → call `disposeHolofoil()` / unmount adapters
