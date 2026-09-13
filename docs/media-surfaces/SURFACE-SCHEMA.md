# Surface manifest schema

`HolofoilSurfaceRecord`

Required: `id`, `format` (`rooftop` | `wall` | `street` | `portrait` | `landscape` | `cinema` | `storefront` | `transit` | `custom`).

Optional: position, rotation, scale, activationRadius, audioRadius, playlistId, mediaIds, themeId, interactionMode (`none` | `focus` | `expand` | `portal`).

The same `media-001` may be assigned to `surface-001` and `surface-002` without duplicating the asset.
