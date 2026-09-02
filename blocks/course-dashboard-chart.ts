import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const courseDashboardChartBlockDefinition: BlockDefinition = {
  key: "academy.course.dashboard-chart",
  label: "Academy — Gráfico de progresso do curso",
  category: "academy",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { slug: "" },
  requiredDataFields: ["slug"],
  missingConfigMessage: "Slug do curso não definido",
  editorFields: [{ name: "slug", type: "text", label: "Slug do curso" }],
};
