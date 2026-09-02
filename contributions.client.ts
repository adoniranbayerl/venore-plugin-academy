import type { PluginClientContributions } from "@venore/plugin-sdk/ui";
import { blockFieldPanels } from "./blocks/field-panels";

// Contribuição CLIENT do academy pro page-builder (painel de campo custom do bloco
// academy.notation.sheet). Importa DIRETO de "./blocks/field-panels" — nunca do barrel — pra não
// arrastar blockRenderers -> auth pro bundle client do builder do CMS. Agregado pelo codegen em
// contributions.client.generated.ts; consumido só por platform/page-builder/block-field-panels.ts.
export const academyClientContributions: PluginClientContributions = {
  blockFieldPanels,
};
