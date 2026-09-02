import type { BlockDefinition } from "@venore/plugin-sdk/cms";

// Vídeo (YouTube/Vimeo) embutido dentro de uma seção de aula ou de qualquer página do CMS. O
// parser de URL é o mesmo da seção de vídeo da aula (shared/embeddable-video.ts). URL não
// reconhecida vira um link simples no render.
export const videoBlockDefinition: BlockDefinition = {
  key: "academy.video",
  label: "Academy — Vídeo (YouTube/Vimeo)",
  category: "academy",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: { url: "", caption: "" },
  requiredDataFields: ["url"],
  missingConfigMessage: "Nenhuma URL de vídeo definida",
  editorFields: [
    { name: "url", type: "text", label: "URL do vídeo (YouTube ou Vimeo)" },
    { name: "caption", type: "text", label: "Legenda (opcional)" },
  ],
};
