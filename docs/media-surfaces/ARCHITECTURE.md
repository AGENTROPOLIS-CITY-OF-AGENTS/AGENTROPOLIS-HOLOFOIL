# Architecture

Holofoil Media-Surface Engine is shared infrastructure.

```
consumer app
  media records + surface records + theme
        ↓
Holofoil registries (validate → fail closed)
        ↓
governor (distance, budget, visibility, device)
        ↓
adapter (DOM | R3F | canvas | future)
```

Core never owns city names, campaigns, filenames, or brand colors. Those live in the consuming app’s manifest.
