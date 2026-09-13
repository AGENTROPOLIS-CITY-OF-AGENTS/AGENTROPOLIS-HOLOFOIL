# Renderer adapters

| Adapter | Import |
| --- | --- |
| DOM / CSS | `HolofoilDomSurface` from the public API |
| React Three Fiber | `@/lib/holofoil/media-surfaces/adapters/r3f` |
| Canvas 2D | `mountCanvasSurface` from `adapters/canvas` |
| HLS / live | `registerHolofoilAdapter("hls", adapter)` |

Do not import the R3F adapter from 2D routes. Future spatial runtimes should call `mountHolofoilSurface` + `createManagedVideo`.
