import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const earTrainerBlockDefinition: BlockDefinition = {
  key: "academy.ear-trainer",
  label: "Academy — Treinador de ouvido",
  category: "academy",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: {
    mode: "interval",
    set: "2M,3m,3M,4J,5J,6M",
    roots: "A,D,E",
    direction: "asc",
    rounds: 10,
    caption: "",
  },
  requiredDataFields: ["set"],
  missingConfigMessage: "Nenhum intervalo/acorde definido",
  editorFields: [
    {
      name: "mode",
      type: "select",
      label: "O que treinar",
      options: [
        { value: "interval", label: "Intervalos" },
        { value: "chord", label: "Qualidade de acorde" },
      ],
    },
    {
      name: "set",
      type: "text",
      label:
        "Conjunto (separado por vírgula) — intervalos: 2m,2M,3m,3M,4J,trítono,5J,6m,6M,7m,7M,8J · acordes: maior,menor,diminuto,aumentado,sétima da dominante,sétima maior",
    },
    { name: "roots", type: "text", label: "Tônicas (notas separadas por vírgula, ex: A,D,E)" },
    {
      name: "direction",
      type: "select",
      label: "Direção",
      options: [
        { value: "asc", label: "Ascendente (melódico)" },
        { value: "desc", label: "Descendente (melódico)" },
        { value: "harmonic", label: "Harmônico (juntas)" },
      ],
    },
    { name: "rounds", type: "number", label: "Número de perguntas" },
    { name: "caption", type: "text", label: "Legenda (opcional)" },
  ],
};
