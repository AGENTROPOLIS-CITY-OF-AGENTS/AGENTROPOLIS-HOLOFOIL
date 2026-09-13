# Integration

```ts
import {
  registerHolofoilMedia,
  registerHolofoilSurfaces,
  registerHolofoilTheme,
  mountHolofoilSurface,
  updateHolofoilContext,
  disposeHolofoil,
} from "@/lib/holofoil/media-surfaces"

registerHolofoilMedia([{ id: "media-001", source: "/media/media-001.mp4", mediaType: "video",
  poster: "/media/media-001.jpg", title: "Sample", altText: "Sample surface",
  rights: { owner: "owner-001", license: "internal", approved: true }, moderationStatus: "approved" }])
registerHolofoilSurfaces([{ id: "surface-001", format: "wall", mediaIds: ["media-001"], themeId: "theme-default" }])
updateHolofoilContext({ pageVisible: true, camera: [0, 2, 8] })
mountHolofoilSurface("surface-001")
```

R3F is opt-in: `import { HolofoilR3FSurface } from "@/lib/holofoil/media-surfaces/adapters/r3f"`.
