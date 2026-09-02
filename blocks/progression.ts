import type { BlockDefinition } from "@venore/plugin-sdk/cms";

// Opções de tom — mesmo catálogo do NotationEditor (KeySignature), rótulos em pt.
const KEY_OPTIONS: { value: string; label: string }[] = [
  { value: "C", label: "Dó maior" },
  { value: "G", label: "Sol maior" },
  { value: "D", label: "Ré maior" },
  { value: "A", label: "Lá maior" },
  { value: "E", label: "Mi maior" },
  { value: "B", label: "Si maior" },
  { value: "F", label: "Fá maior" },
  { value: "Bb", label: "Si♭ maior" },
  { value: "Eb", label: "Mi♭ maior" },
  { value: "Ab", label: "Lá♭ maior" },
  { value: "Am", label: "Lá menor" },
  { value: "Em", label: "Mi menor" },
  { value: "Dm", label: "Ré menor" },
];

export const progressionBlockDefinition: BlockDefinition = {
  key: "academy.progression",
  label: "Academy — Progressão de acordes",
  category: "academy",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: { chords: "", key: "C", bpm: 90, beatsPerChord: 4, caption: "" },
  requiredDataFields: ["chords"],
  missingConfigMessage: "Nenhum acorde definido",
  editorFields: [
    { name: "chords", type: "text", label: "Acordes (ex: A D E7 A — use A:2 pra mudar os tempos de um acorde)" },
    { name: "key", type: "select", label: "Tom", options: KEY_OPTIONS },
    { name: "bpm", type: "number", label: "Andamento (BPM)" },
    { name: "beatsPerChord", type: "number", label: "Tempos por acorde (padrão)" },
    { name: "caption", type: "text", label: "Legenda (opcional)" },
  ],
};
