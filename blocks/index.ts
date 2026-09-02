// Três arquivos separados (não um só) — definitions.ts é dado puro (sem tocar em handler/auth),
// renderers.ts importa os componentes de render (que puxam handler -> @/contexts/auth ->
// next-auth). Testes que só precisam de blockDefinitions importam definitions.ts direto, sem
// arrastar a cadeia de auth pro ambiente de teste (mesmo motivo do mock em block-registry.test.ts).
// field-panels.ts reexportado aqui só por paridade/descoberta — a plataforma
// (platform/page-builder/block-field-panels.ts) NUNCA consome por este barrel: ela importa direto
// de "./field-panels" pra não puxar blockRenderers (e a cadeia de auth) pro bundle client do
// builder do CMS (composition-builder.tsx é "use client").
export { blockDefinitions } from "./definitions";
export { blockRenderers } from "./renderers";
export { blockFieldPanels } from "./field-panels";
