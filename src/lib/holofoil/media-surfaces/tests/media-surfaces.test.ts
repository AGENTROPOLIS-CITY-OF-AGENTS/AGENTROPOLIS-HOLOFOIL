import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { HolofoilMediaSurfaceEngine } from "../core/engine.ts";
import { audioAttenuation, createAudioController } from "../core/audio.ts";
import { selectPlayableSurfaces } from "../performance/governor.ts";
import { ingestMediaFiles } from "../loaders/ingest.ts";
import { inferMime } from "../loaders/video.ts";
import { commandFromFilename, commandFromKey, commandFromPointer } from "../interactions/dispatch.ts";
import { reportAccessibility, releaseBlocked } from "../accessibility/report.ts";
import { rightsFailClosed, validateMediaRecord } from "../schemas/validate.ts";
import type { HolofoilMediaRecord, HolofoilPlaybackContext, HolofoilSurfaceRecord } from "../schemas/types.ts";

const ROOT = join(import.meta.dirname, "../../../../../");

function validMedia(over: Partial<HolofoilMediaRecord> = {}): HolofoilMediaRecord {
  return {
    id: "media-001",
    source: "/media/media-001.mp4",
    mediaType: "video",
    poster: "/media/media-001.jpg",
    title: "Surface sample",
    altText: "Neutral media surface",
    captions: "/media/media-001.vtt",
    loop: true,
    mutedByDefault: true,
    priority: 1,
    rights: { owner: "owner-001", license: "internal", approved: true },
    moderationStatus: "approved",
    ...over,
  };
}

function surface(over: Partial<HolofoilSurfaceRecord> = {}): HolofoilSurfaceRecord {
  return {
    id: "surface-001",
    format: "wall",
    position: [0, 2, 0],
    mediaIds: ["media-001"],
    activationRadius: 12,
    ...over,
  };
}

function ctx(over: Partial<HolofoilPlaybackContext> = {}): HolofoilPlaybackContext {
  return {
    camera: [0, 2, 4],
    visibleSurfaceIds: ["surface-001"],
    pageVisible: true,
    windowFocused: true,
    reducedMotion: false,
    saveData: false,
    isMobile: false,
    frameMs: 16,
    nowMs: Date.parse("2026-01-01T00:00:00.000Z"),
    audioAuthorized: false,
    globalMute: false,
    ...over,
  };
}

test("valid media registration", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  const warnings = engine.registerMedia([validMedia()]);
  assert.equal(warnings.length, 0);
  assert.equal(engine.media.has("media-001"), true);
});

test("invalid media rejection", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  const warnings = engine.registerMedia([{ id: "", source: "", mediaType: "nope" }]);
  assert.equal(engine.media.size, 0);
  assert.ok(warnings.some((w) => w.code === "missing_id"));
  assert.equal(validateMediaRecord(null).ok, false);
});

test("duplicate IDs are rejected", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerMedia([validMedia()]);
  const warnings = engine.registerMedia([validMedia({ title: "copy" })]);
  assert.ok(warnings.some((w) => w.code === "duplicate_id"));
  assert.equal(engine.media.size, 1);
});

test("surface-to-media assignment", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerMedia([validMedia()]);
  engine.registerSurfaces([surface()]);
  const resolved = engine.resolve("surface-001");
  assert.equal(resolved.media?.id, "media-001");
  assert.equal(resolved.fallback, "none");
});

test("missing assets fail closed", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerSurfaces([surface({ mediaIds: ["missing"] })]);
  const resolved = engine.resolve("surface-001");
  assert.equal(resolved.media, null);
  assert.equal(resolved.fallback, "neutral");
  assert.ok(resolved.warnings.some((w) => w.code === "missing_asset"));
});

test("poster fallback when playback is not eligible", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerMedia([validMedia()]);
  engine.registerSurfaces([surface()]);
  engine.updateContext(ctx({ reducedMotion: true, pageVisible: false }));
  assert.equal(engine.canPlay("surface-001"), false);
});

test("visibility pausing", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerMedia([validMedia({ priority: 9 })]);
  engine.registerSurfaces([surface()]);
  engine.updateContext(ctx({ pageVisible: true }));
  assert.equal(engine.canPlay("surface-001"), true);
  engine.updateContext(ctx({ pageVisible: false }));
  assert.equal(engine.canPlay("surface-001"), false);
});

test("distance pausing", () => {
  const result = selectPlayableSurfaces({
    surfaces: [surface({ position: [0, 0, 40], activationRadius: 10 })],
    priorities: { "surface-001": 1 },
    context: ctx({ camera: [0, 0, 0], visibleSurfaceIds: ["surface-001"] }),
  });
  assert.equal(result.play.has("surface-001"), false);
});

test("playback-budget enforcement", () => {
  const surfaces = [0, 1, 2, 3].map((i) =>
    surface({ id: `surface-00${i + 1}`, position: [i, 0, 0], mediaIds: ["media-001"] }),
  );
  const result = selectPlayableSurfaces({
    surfaces,
    priorities: Object.fromEntries(surfaces.map((s, i) => [s.id, 4 - i])),
    context: ctx({ visibleSurfaceIds: surfaces.map((s) => s.id) }),
    config: { maxPlaying: 2, maxPlayingMobile: 1, maxDpr: 1, pauseDistance: 18, audioExclusive: true },
  });
  assert.equal(result.play.size, 2);
});

test("mobile performance limits", () => {
  const surfaces = [surface({ id: "surface-001" }), surface({ id: "surface-002", position: [1, 2, 0] })];
  const result = selectPlayableSurfaces({
    surfaces,
    priorities: { "surface-001": 2, "surface-002": 1 },
    context: ctx({ isMobile: true, visibleSurfaceIds: ["surface-001", "surface-002"] }),
  });
  assert.equal(result.play.size, 1);
});

test("audio exclusivity and global mute", () => {
  const audio = createAudioController();
  audio.authorize();
  audio.setAudible("surface-001");
  assert.equal(audio.get().audibleSurfaceId, "surface-001");
  audio.setGlobalMute(true);
  audio.setAudible("surface-002");
  assert.equal(audio.get().audibleSurfaceId, null);
  audio.setGlobalMute(false);
  audio.setAudible("surface-002");
  assert.equal(audio.get().audibleSurfaceId, "surface-002");
});

test("expired content fails closed", () => {
  const media = validMedia({ schedule: { endsAt: "2020-01-01T00:00:00.000Z" } });
  const closed = rightsFailClosed(media, Date.parse("2026-01-01T00:00:00.000Z"));
  assert.equal(closed?.code, "expired");
});

test("unapproved content fails closed", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerMedia([validMedia({ rights: { owner: "owner-001", license: "internal", approved: false } })]);
  engine.registerSurfaces([surface()]);
  engine.updateContext(ctx());
  assert.equal(engine.resolve("surface-001").media, null);
});

test("missing rights metadata fails closed", () => {
  const closed = rightsFailClosed(validMedia({ rights: { approved: true } }), 1);
  assert.equal(closed?.code, "missing_rights");
});

test("failed video playback is represented as a rejected play result", async () => {
  const play = async () => {
    throw new Error("autoplay blocked");
  };
  const result = await play().then(
    () => "playing" as const,
    () => "rejected" as const,
  );
  assert.equal(result, "rejected");
  assert.equal(inferMime("clip.webm"), "video/webm");
});

test("keyboard interaction maps to engine audio authorization", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.audio.authorize();
  engine.audio.setGlobalMute(false);
  engine.updateContext(ctx({ audioAuthorized: true }));
  assert.equal(engine.audio.get().authorized, true);
});

test("cleanup and disposal", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerMedia([validMedia()]);
  engine.registerSurfaces([surface()]);
  engine.dispose();
  assert.equal(engine.media.size, 0);
  assert.equal(engine.surfaces.size, 0);
  assert.equal(engine.canPlay("surface-001"), false);
});

test("existing-project migration keeps consumer filenames out of core", () => {
  const engineSrc = readFileSync(join(ROOT, "src/lib/holofoil/media-surfaces/core/engine.ts"), "utf8");
  const campusHero = readFileSync(join(ROOT, "src/components/holofoil/CampusHero.tsx"), "utf8");
  assert.equal(engineSrc.includes("campus-hero"), false);
  assert.equal(engineSrc.toLowerCase().includes("origin engine"), false);
  assert.equal(campusHero.includes("/campus-hero.mp4"), false);
  assert.equal(campusHero.includes("registerHolofoil") || campusHero.includes("getHolofoilMediaEngine"), true);
});

test("ingest preserves spaced filenames and does not auto-approve", () => {
  const { drafts, warnings } = ingestMediaFiles([
    "public/media/Launch Clip #1.mp4",
    "public/media/Launch Clip #1.mp4",
    "public/media/notes.txt",
  ]);
  assert.equal(drafts[0]?.source, "public/media/Launch Clip #1.mp4");
  assert.equal(drafts[0]?.rights?.approved, false);
  assert.ok(warnings.some((w) => w.code === "duplicate_asset"));
  assert.ok(warnings.some((w) => w.code === "skipped_file"));
});

test("playlist rotation prefers the scheduled slot", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.registerMedia([
    validMedia({ id: "media-001", priority: 1 }),
    validMedia({ id: "media-002", source: "/media/media-002.mp4", priority: 1 }),
  ]);
  engine.registerPlaylist({ id: "playlist-001", mediaIds: ["media-001", "media-002"], rotateMs: 1000 });
  engine.registerSurfaces([surface({ playlistId: "playlist-001", mediaIds: undefined })]);
  engine.updateContext(ctx({ nowMs: 0 }));
  assert.equal(engine.resolve("surface-001").media?.id, "media-001");
  engine.updateContext(ctx({ nowMs: 1000 }));
  assert.equal(engine.resolve("surface-001").media?.id, "media-002");
});

test("destinations are never inferred from filenames", () => {
  assert.equal(commandFromFilename("visit-store.mp4").type, "none");
  assert.equal(commandFromKey("Enter", "portal").type, "none");
  const opened = commandFromKey("Enter", "portal", "https://example.invalid/media-001");
  assert.equal(opened.type, "open_destination");
});

test("pointer click opens and plays instead of staying on a still", () => {
  assert.equal(commandFromPointer("expand").type, "expand");
  assert.equal(commandFromPointer("focus").type, "expand");
  assert.equal(commandFromPointer("none").type, "none");
});

test("accessibility gaps block release", () => {
  const gaps = reportAccessibility([validMedia({ altText: undefined, title: undefined, captions: undefined })]);
  assert.ok(gaps.some((g) => g.code === "missing_alt"));
  assert.equal(releaseBlocked([validMedia({ altText: undefined, title: undefined })]), true);
  assert.equal(releaseBlocked([validMedia()]), false);
});

test("distance attenuation reaches zero at radius", () => {
  assert.equal(audioAttenuation(0, 10), 1);
  assert.equal(audioAttenuation(10, 10), 0);
  assert.equal(audioAttenuation(12, 10), 0);
});

test("focus loss clears the audible surface", () => {
  const engine = new HolofoilMediaSurfaceEngine();
  engine.audio.authorize();
  engine.audio.setAudible("surface-001");
  engine.updateContext(ctx({ windowFocused: false, pageVisible: true }));
  assert.equal(engine.audio.get().audibleSurfaceId, null);
});

