import {
  INTERACTION_MODES,
  MEDIA_TYPES,
  MODERATION_STATUSES,
  SURFACE_FORMATS,
  type HolofoilMediaRecord,
  type HolofoilSurfaceRecord,
  type RegistryWarning,
} from "./types.ts";

function isIso(value?: string): boolean {
  if (!value) return true;
  return Number.isFinite(Date.parse(value));
}

export function validateMediaRecord(record: unknown): {
  ok: boolean;
  value?: HolofoilMediaRecord;
  warnings: RegistryWarning[];
} {
  const warnings: RegistryWarning[] = [];
  if (!record || typeof record !== "object") {
    return { ok: false, warnings: [{ code: "invalid_record", message: "Media record must be an object." }] };
  }
  const raw = record as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const source = typeof raw.source === "string" ? raw.source.trim() : "";
  const mediaType = raw.mediaType;
  if (!id) warnings.push({ code: "missing_id", message: "Media id is required." });
  if (!source) warnings.push({ code: "missing_source", message: "Media source is required.", id });
  if (!MEDIA_TYPES.includes(mediaType as HolofoilMediaRecord["mediaType"])) {
    warnings.push({ code: "invalid_media_type", message: "mediaType must be video, image, or stream.", id });
  }
  const schedule = raw.schedule as HolofoilMediaRecord["schedule"] | undefined;
  if (schedule && (!isIso(schedule.startsAt) || !isIso(schedule.endsAt))) {
    warnings.push({ code: "invalid_schedule", message: "schedule dates must be ISO-8601.", id });
  }
  if (raw.moderationStatus && !MODERATION_STATUSES.includes(raw.moderationStatus as never)) {
    warnings.push({ code: "invalid_moderation", message: "Unknown moderation status.", id });
  }
  if (warnings.some((w) => w.code === "missing_id" || w.code === "missing_source" || w.code === "invalid_media_type")) {
    return { ok: false, warnings };
  }
  return { ok: true, value: raw as HolofoilMediaRecord, warnings };
}

export function validateSurfaceRecord(record: unknown): {
  ok: boolean;
  value?: HolofoilSurfaceRecord;
  warnings: RegistryWarning[];
} {
  const warnings: RegistryWarning[] = [];
  if (!record || typeof record !== "object") {
    return { ok: false, warnings: [{ code: "invalid_record", message: "Surface record must be an object." }] };
  }
  const raw = record as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) warnings.push({ code: "missing_id", message: "Surface id is required." });
  if (!SURFACE_FORMATS.includes(raw.format as HolofoilSurfaceRecord["format"])) {
    warnings.push({ code: "invalid_format", message: "Unknown surface format.", id });
  }
  if (raw.interactionMode && !INTERACTION_MODES.includes(raw.interactionMode as never)) {
    warnings.push({ code: "invalid_interaction", message: "Unknown interaction mode.", id });
  }
  if (warnings.length) return { ok: false, warnings };
  return { ok: true, value: raw as HolofoilSurfaceRecord, warnings };
}

export function rightsFailClosed(media: HolofoilMediaRecord, nowMs: number): RegistryWarning | null {
  if (media.rights?.approved !== true) {
    return { code: "unapproved", message: "Media is not approved for public render.", id: media.id };
  }
  if (!media.rights.owner || !media.rights.license) {
    return { code: "missing_rights", message: "Owner and license are required before public render.", id: media.id };
  }
  if (media.moderationStatus && media.moderationStatus !== "approved") {
    return { code: "restricted", message: `Moderation status ${media.moderationStatus} fails closed.`, id: media.id };
  }
  const ends = media.schedule?.endsAt ? Date.parse(media.schedule.endsAt) : NaN;
  const starts = media.schedule?.startsAt ? Date.parse(media.schedule.startsAt) : NaN;
  if (Number.isFinite(starts) && nowMs < starts) {
    return { code: "not_started", message: "Media schedule has not started.", id: media.id };
  }
  if (Number.isFinite(ends) && nowMs > ends) {
    return { code: "expired", message: "Media schedule has expired.", id: media.id };
  }
  return null;
}

export function accessibilityGaps(media: HolofoilMediaRecord): RegistryWarning[] {
  const gaps: RegistryWarning[] = [];
  if (!media.altText) gaps.push({ code: "missing_alt", message: "Public media needs alt text.", id: media.id });
  if (!media.title) gaps.push({ code: "missing_title", message: "Public media needs a title.", id: media.id });
  if (media.mediaType !== "image" && !media.captions && !media.transcript) {
    gaps.push({ code: "missing_captions", message: "Speech-bearing media should provide captions or a transcript.", id: media.id });
  }
  return gaps;
}
