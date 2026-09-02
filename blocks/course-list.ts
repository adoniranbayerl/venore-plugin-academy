import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const courseListBlockDefinition: BlockDefinition = {
  key: "academy.course.list",
  label: "Academy — Lista de cursos",
  category: "academy",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { limit: 6 },
  editorFields: [{ name: "limit", type: "number", label: "Quantidade máxima de cursos" }],
};
