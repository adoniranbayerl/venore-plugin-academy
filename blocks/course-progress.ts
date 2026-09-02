import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const courseProgressBlockDefinition: BlockDefinition = {
  key: "academy.course.progress",
  label: "Academy — Progresso do curso",
  category: "academy",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { slug: "" },
  requiredDataFields: ["slug"],
  missingConfigMessage: "Slug do curso não definido",
  editorFields: [{ name: "slug", type: "text", label: "Slug do curso" }],
};
