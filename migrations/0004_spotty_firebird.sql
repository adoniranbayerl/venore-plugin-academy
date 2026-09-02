ALTER TABLE "academy"."courses" ADD COLUMN "slug" text;--> statement-breakpoint
-- Backfill: slugify(title) + sufixo curto do id, pra garantir unicidade sem depender de laço
-- procedural em SQL puro (dois cursos com o mesmo título geram slugs diferentes por causa do
-- sufixo). Cursos criados depois desta migration recebem slug via TS (features/courses/*).
-- Sem unaccent() de propósito: exigiria CREATE EXTENSION unaccent, e essa migration não deveria
-- depender de extensão do Postgres estar disponível/habilitada no banco do site. Título com
-- acento vira mais hífen no backfill (ainda um slug válido) — cursos futuros que reeditam o slug
-- na UI podem ajustar manualmente.
UPDATE "academy"."courses"
SET "slug" = trim(both '-' from regexp_replace(lower(trim("title")), '[^a-z0-9]+', '-', 'g'))
  || '-' || substr("id", 1, 8)
WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "academy"."courses" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "courses_slug_idx" ON "academy"."courses" USING btree ("slug");
