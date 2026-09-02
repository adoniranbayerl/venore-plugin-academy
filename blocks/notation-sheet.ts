import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const notationSheetBlockDefinition: BlockDefinition = {
  key: "academy.notation.sheet",
  label: "Academy — Partitura interativa",
  category: "academy",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: { tokens: [], caption: "", allowSingAlong: true, key: "C", timeSignature: "4/4", bpm: 90, showNoteNames: false },
  // Vazio de propósito: o painel de edição deste bloco é 100% custom (field-panels.ts) — "tokens"
  // precisa do compositor visual clique-a-clique, que não existe como EditorFieldType genérico.
  editorFields: [],
  // Sem requiredDataFields de propósito: isBlockConfigured só valida string vazia, não array vazio
  // — o guard de "sem melodia composta" vive no renderer (hasNotationTokens em
  // notation-sheet-block.tsx), mesmo padrão de RichtextBlock/hasRichTextContent.
};
