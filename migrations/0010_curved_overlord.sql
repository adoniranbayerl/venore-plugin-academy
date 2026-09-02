CREATE TABLE "academy"."lesson_materials" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"media_id" text NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy"."lesson_materials" ADD CONSTRAINT "lesson_materials_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_materials_lesson_position_idx" ON "academy"."lesson_materials" USING btree ("lesson_id","position");