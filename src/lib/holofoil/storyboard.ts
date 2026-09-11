import type { StoryboardDeck, StoryboardPanel } from "./types";

const BEATS = [
  {
    title: "Establish",
    camera: "Cinematic Wide-Shot",
    notes: "Hold on architecture. Let the foil catch first light.",
  },
  {
    title: "Approach",
    camera: "Tracking Medium",
    notes: "Move the camera along the refraction edge.",
  },
  {
    title: "Inspect",
    camera: "Macro Insert",
    notes: "Focus on grain, fresnel, and serialized mark.",
  },
  {
    title: "Turn",
    camera: "Orbital Close",
    notes: "Rotate to prove the material is view-dependent.",
  },
  {
    title: "Confirm",
    camera: "Over-shoulder",
    notes: "Operator verifies the configuration hash.",
  },
  {
    title: "Export",
    camera: "Locked Product",
    notes: "Static foil state for reduced-motion delivery.",
  },
];

export function composeStoryboard(input: {
  storyPrompt: string;
  stylePreset: string;
  cameraPreset: string;
  lightingPreset: string;
}): StoryboardDeck {
  const panels: StoryboardPanel[] = BEATS.map((beat, index) => ({
    panelNumber: index + 1,
    title: beat.title,
    description: `${beat.title} beat for: ${input.storyPrompt}`,
    visualStylePrompt: `${input.storyPrompt}, ${input.stylePreset}, ${beat.camera}, ${input.lightingPreset}, holofoil material response`,
    cameraAngle: index === 0 ? input.cameraPreset : beat.camera,
    lighting: input.lightingPreset,
    directorNotes: beat.notes,
  }));

  return {
    id: `sb-${Math.abs(hash(input.storyPrompt)).toString(16)}`,
    storyPrompt: input.storyPrompt,
    stylePreset: input.stylePreset,
    cameraAnglePreset: input.cameraPreset,
    lightingPreset: input.lightingPreset,
    panels,
    createdAt: new Date().toISOString(),
  };
}

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}
