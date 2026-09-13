# Migration

1. Leave assets in place.
2. Move hard-coded filenames and coordinates into a consumer manifest (`media-001`, `surface-001`).
3. Replace direct `<video src="…">` with `HolofoilDomSurface` or `HolofoilR3FSurface`.
4. Register rights.approved before public render.
5. Call `disposeHolofoil()` on teardown.
