import type { BlockDefinition } from "@venore/plugin-sdk/cms";
import { DRUM_PATTERNS } from "./drum-grid-patterns";

export const drumGridBlockDefinition: BlockDefinition = {
  key: "academy.drum-grid",
  label: "Academy — Grade de bateria",
  category: "academy",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: { style: "backbeat", bpm: 96, bars: 2, caption: "" },
  editorFields: [
    {
      name: "style",
      type: "select",
      label: "Levada",
      options: Object.entries(DRUM_PATTERNS).map(([value, pattern]) => ({ value, label: pattern.label })),
    },
    { name: "bpm", type: "number", label: "Andamento (BPM)" },
    { name: "bars", type: "number", label: "Compassos (repetições)" },
    { name: "caption", type: "text", label: "Legenda (opcional)" },
  ],
};
