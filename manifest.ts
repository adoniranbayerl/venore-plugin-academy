import type { PluginManifest } from "@venore/plugin-sdk";

// Faixa escrita à mão, não importada de platform/plugin-engine/core-version.ts: se importasse o
// CORE_VERSION corrente, a checagem de compatibilidade seria sempre trivialmente satisfeita e
// perderia o sentido (docs/venore-docks.md — "Sistema de plugins" / compatibility.coreVersion).
export const academyManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "academy",
  name: "Academy",
  version: "1.0.0",
  description: "Cursos com aulas sequenciais, requisitos configuráveis e progresso do aluno.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  // Opcional: a etapa de doação da aula e a chamada na página de curso reusam DonationWidget/
  // DonationTeaser do barrel de donations, mas só quando isPluginActive("donations") — academy
  // funciona inteiro sem donations instalado. `optional` nunca bloqueia o registro nem a
  // desabilitação de donations (resolve-dependencies.ts / find-dependent-plugins.ts).
  dependencies: [{ pluginKey: "donations", type: "optional" }],
  // Schema próprio do plugin — aplicado no install (run-plugin-migrations.ts), não no
  // vercel-build. Default de migrationsSchema ("academy_migrations") já bate com
  // src/plugins/academy/drizzle.config.ts.
  migrationsPath: "./migrations",
  permissions: [{ key: "academy.courses.manage", label: "Gerenciar cursos, aulas e perguntas da Academy" }],
  navigation: [
    {
      key: "academy.courses",
      label: "Academy",
      href: "/admin/academy",
      icon: "graduation-cap",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 10,
      requiredPermission: "academy.courses.manage",
    },
    // "Mensagens" NÃO fica no admin-nav (grupo Plugins) — é um destino pessoal, não uma função
    // administrativa. Vai pro user-nav (menu do usuário) via platform/user-nav/registry.ts, com o
    // href resolvido por papel (professor → /admin/academy/messages, aluno → /academy/messages).
  ],
  seeds: [
    { key: "example", label: "Dados de exemplo", description: "Um curso de exemplo com três aulas." },
    {
      key: "teoria-musical",
      label: "Curso: Teoria Musical na Prática",
      description:
        "Curso público de 19 aulas (ritmo, intervalos, harmonia funcional) com seções de texto, " +
        "exemplos de partitura, perguntas de treino de ouvido e atividades — ver docs/curso-teoria-musical.md.",
    },
  ],
  blocks: [
    { key: "academy.course.list", label: "Academy — Lista de cursos" },
    { key: "academy.course.card", label: "Academy — Curso" },
    { key: "academy.enroll.cta", label: "Academy — Botão de matrícula" },
    { key: "academy.course.progress", label: "Academy — Progresso do curso" },
    { key: "academy.course.lesson-trail", label: "Academy — Trilha de lições" },
    { key: "academy.course.dashboard-chart", label: "Academy — Gráfico de progresso do curso" },
    { key: "academy.notation.sheet", label: "Academy — Partitura interativa" },
    { key: "academy.progression", label: "Academy — Progressão de acordes" },
    { key: "academy.ear-trainer", label: "Academy — Treino de ouvido (intervalos/acordes)" },
    { key: "academy.drum-grid", label: "Academy — Grade de bateria" },
    { key: "academy.video", label: "Academy — Vídeo (YouTube/Vimeo)" },
  ],
};
