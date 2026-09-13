# Troubleshooting

- Autoplay rejected → poster fallback, environment keeps running
- Duplicate ids → second record skipped
- Missing source → neutral fallback
- Several videos at once → governor budget; lower maxPlaying
- Audio from two surfaces → exclusive audible surface; authorize on gesture
- Abandoned decoders → unmount adapter / `disposeHolofoil()`
