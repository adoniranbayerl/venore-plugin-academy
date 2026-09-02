import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const courseCardBlockDefinition: BlockDefinition = {
  key: "academy.course.card",
  label: "Academy — Curso",
  category: "academy",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { slug: "" },
  requiredDataFields: ["slug"],
  missingConfigMessage: "Slug do curso não definido",
  editorFields: [{ name: "slug", type: "text", label: "Slug do curso" }],
};
