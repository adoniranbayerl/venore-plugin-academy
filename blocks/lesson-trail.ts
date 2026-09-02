import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const lessonTrailBlockDefinition: BlockDefinition = {
  key: "academy.course.lesson-trail",
  label: "Academy — Trilha de lições",
  category: "academy",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { slug: "" },
  requiredDataFields: ["slug"],
  missingConfigMessage: "Slug do curso não definido",
  editorFields: [{ name: "slug", type: "text", label: "Slug do curso" }],
};
