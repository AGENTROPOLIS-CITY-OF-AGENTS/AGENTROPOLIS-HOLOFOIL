# Media manifest schema

`HolofoilMediaRecord`

Required: `id`, `source`, `mediaType` (`video` | `image` | `stream`).

Public render also requires: `title`, `altText`, `rights.owner`, `rights.license`, `rights.approved: true`.

Optional: poster, captions, transcript, aspectRatio, loop, mutedByDefault, audioEligible, priority, tags, placementGroup, schedule, audience, contentRating, moderationStatus, provenance, destinationUrl.

Invalid records warn and are skipped. Unapproved / expired / rights-missing records fail closed.
