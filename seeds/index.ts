import type { PluginSeedFn } from "@venore/plugin-sdk";
import { seedAcademyExample } from "./example";
import { seedAcademyTeoriaMusical } from "./teoria-musical";

// Ponto de extensão "seeds" do plugin engine (mesmo padrão de blockDefinitions): a chave bate com
// a `key` declarada em manifest.seeds, e platform/plugin-engine/plugin-seed-registry.ts agrega
// este objeto por import estático.
//
// O curso "Jesus Cristo mudou meu viver" saiu do seed: cursos agora entram por pacote de
// importação (docs/cursos/*.md → scripts/build-course-bundle.ts → /admin/academy "Importar curso").
export const academySeeds: Record<string, PluginSeedFn> = {
  example: seedAcademyExample,
  "teoria-musical": seedAcademyTeoriaMusical,
};
