CREATE TABLE "academy"."lesson_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"cms_entry_id" text,
	"video_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_sections_content_check" CHECK ("academy"."lesson_sections"."cms_entry_id" is not null or "academy"."lesson_sections"."video_url" is not null)
);
--> statement-breakpoint
ALTER TABLE "academy"."lesson_sections" ADD CONSTRAINT "lesson_sections_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_sections_lesson_position_idx" ON "academy"."lesson_sections" USING btree ("lesson_id","position");--> statement-breakpoint
-- Backfill: toda aula existente ganha exatamente uma seção em position 1, carregando o
-- cmsEntryId/videoUrl atuais da aula (que continuam em lessons, depreciadas — ver comentário no
-- schema). id gerado por gen_random_uuid() porque esta migration não passa pelo TS
-- ($defaultFn); pgcrypto/gen_random_uuid() já é usado pelo restante do banco (mesma extensão que
-- os outros $defaultFn(() => crypto.randomUUID()) do projeto assumem estar disponível). lessons
-- não tem coluna de título própria — o "título da aula" que a tela mostra hoje é o título da cms
-- entry referenciada (ver LessonTrail); title é obrigatório em lesson_sections, então cai pro
-- fallback 'Seção 1' quando a entry não existir mais (órfã) ou a aula não tiver cms_entry_id.
-- Este é o único lugar do sistema que faz join direto entre os schemas academy e cms — migration
-- de dados pontual, não um FK cross-schema (que seguiria violando o isolamento por domínio).
INSERT INTO "academy"."lesson_sections" ("id", "lesson_id", "position", "title", "cms_entry_id", "video_url")
SELECT gen_random_uuid(), "l"."id", 1, coalesce("e"."title", 'Seção 1'), "l"."cms_entry_id", "l"."video_url"
FROM "academy"."lessons" "l"
LEFT JOIN "cms"."entries" "e" ON "e"."id" = "l"."cms_entry_id";