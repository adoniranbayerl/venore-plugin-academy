CREATE TABLE "academy"."lesson_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"title" text NOT NULL,
	"instructions_text" text NOT NULL,
	"deliverable_format" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."lesson_activity_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"activity_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"content_text" text,
	"media_id" text,
	"review_status" text DEFAULT 'pending' NOT NULL,
	"review_feedback" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_activity_submissions_content_check" CHECK ("academy"."lesson_activity_submissions"."content_text" is not null or "academy"."lesson_activity_submissions"."media_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "academy"."lesson_examples" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"title" text NOT NULL,
	"audio_media_id" text,
	"sheet_media_id" text,
	"caption_text" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_examples_media_check" CHECK ("academy"."lesson_examples"."audio_media_id" is not null or "academy"."lesson_examples"."sheet_media_id" is not null)
);
--> statement-breakpoint
ALTER TABLE "academy"."lesson_requirements" ADD COLUMN "activity_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "academy"."lesson_activities" ADD CONSTRAINT "lesson_activities_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."lesson_activity_submissions" ADD CONSTRAINT "lesson_activity_submissions_activity_id_lesson_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "academy"."lesson_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."lesson_examples" ADD CONSTRAINT "lesson_examples_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_activities_lesson_position_idx" ON "academy"."lesson_activities" USING btree ("lesson_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_activity_submissions_activity_actor_idx" ON "academy"."lesson_activity_submissions" USING btree ("activity_id","actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_examples_lesson_position_idx" ON "academy"."lesson_examples" USING btree ("lesson_id","position");