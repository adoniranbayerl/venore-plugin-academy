import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin (docs/venore-docks.md — "Sistema de plugins" / "Schema e
// migrations": "Cada plugin numera suas próprias migrations dentro da própria pasta"). Separado
// do drizzle.config.ts raiz de propósito — evita o core e o academy competirem pela mesma
// história de migration nas mesmas tabelas.
export default defineConfig({
  schema: ["./database/schema/index.ts"],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Tabela de tracking própria — sem isso, core e academy caem no mesmo default
  // ("drizzle"."__drizzle_migrations"), e o algoritmo de migrate() do drizzle-orm só olha o
  // created_at mais recente da tabela (comparação por cursor único, não por hash por arquivo).
  // Rodar `db:migrate` (core) antes de `db:migrate:academy` empurra esse cursor pra frente, e
  // qualquer migration do academy mais antiga que a última do core é pulada em silêncio — mesmo
  // nunca tendo rodado nesse banco. Bug real encontrado nesta sessão (deploy numa base nova).
  migrations: { schema: "academy_migrations", table: "__drizzle_migrations" },
});
