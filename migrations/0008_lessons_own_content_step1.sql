ALTER TABLE "academy"."lessons" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "academy"."lessons" ADD COLUMN "body" text;--> statement-breakpoint
-- Backfill: aula passa a ter título próprio (docs/implementation-roadmap.md, Fase 7/A1) — puxa o
-- título da cms entry ainda referenciada por cms_entry_id (coluna caindo no próximo step desta
-- mesma migração de duas partes), mesmo padrão de join pontual entre academy/cms já usado em
-- 0005_little_wraith.sql pro backfill de lesson_sections. Fallback 'Aula' cobre entry órfã
-- (apagada) — próxima etapa (step2) torna a coluna NOT NULL, então nenhuma linha pode ficar nula.
UPDATE "academy"."lessons" "l"
SET "title" = coalesce("e"."title", 'Aula')
FROM "cms"."entries" "e"
WHERE "e"."id" = "l"."cms_entry_id";--> statement-breakpoint
UPDATE "academy"."lessons" SET "title" = 'Aula' WHERE "title" IS NULL;