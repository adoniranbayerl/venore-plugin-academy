import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const enrollCtaBlockDefinition: BlockDefinition = {
  key: "academy.enroll.cta",
  label: "Academy — Botão de matrícula",
  category: "academy",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { slug: "", label: "Matricular-se" },
  requiredDataFields: ["slug"],
  missingConfigMessage: "Slug do curso não definido",
  editorFields: [
    { name: "slug", type: "text", label: "Slug do curso" },
    { name: "label", type: "text", label: "Texto do botão" },
  ],
};
