CREATE TABLE "academy"."lesson_material_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"material_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."lesson_section_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy"."lesson_material_completions" ADD CONSTRAINT "lesson_material_completions_material_id_lesson_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "academy"."lesson_materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."lesson_section_completions" ADD CONSTRAINT "lesson_section_completions_section_id_lesson_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "academy"."lesson_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_material_completions_material_actor_idx" ON "academy"."lesson_material_completions" USING btree ("material_id","actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_section_completions_section_actor_idx" ON "academy"."lesson_section_completions" USING btree ("section_id","actor_id");