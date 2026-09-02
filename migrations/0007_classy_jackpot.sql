-- "restricted" pra aula nova E pra aula já existente (comportamento antigo preservado: aula
-- sempre foi visível assim que a aula nasce, sem gate próprio até agora) — ver contracts/types.ts,
-- LessonStatus.
ALTER TABLE "academy"."lessons" ADD COLUMN "status" text DEFAULT 'restricted' NOT NULL;--> statement-breakpoint
-- Colapsa o antigo par (status "draft"|"published", self_enrollment_enabled) no novo status
-- tri-state antes de derrubar a coluna: "published" + auto-matrícula ligada vira "public",
-- "published" sem auto-matrícula vira "restricted", "draft" continua "draft".
UPDATE "academy"."courses" SET "status" = CASE
  WHEN "status" = 'published' AND "self_enrollment_enabled" THEN 'public'
  WHEN "status" = 'published' THEN 'restricted'
  ELSE "status"
END;--> statement-breakpoint
ALTER TABLE "academy"."courses" DROP COLUMN "self_enrollment_enabled";
