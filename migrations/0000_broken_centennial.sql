CREATE SCHEMA "academy";
--> statement-breakpoint
CREATE TABLE "academy"."courses" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."lesson_requirements" (
	"lesson_id" text PRIMARY KEY NOT NULL,
	"read_text_enabled" boolean DEFAULT false NOT NULL,
	"watch_video_enabled" boolean DEFAULT false NOT NULL,
	"quiz_enabled" boolean DEFAULT false NOT NULL,
	"quiz_pass_threshold_percent" integer,
	"quiz_max_attempts" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."lesson_text_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."lesson_video_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"cms_entry_id" text NOT NULL,
	"video_url" text,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."quiz_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."quiz_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy"."lesson_requirements" ADD CONSTRAINT "lesson_requirements_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."lesson_text_completions" ADD CONSTRAINT "lesson_text_completions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."lesson_video_completions" ADD CONSTRAINT "lesson_video_completions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "academy"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."quiz_questions" ADD CONSTRAINT "quiz_questions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_text_completions_lesson_actor_idx" ON "academy"."lesson_text_completions" USING btree ("lesson_id","actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_video_completions_lesson_actor_idx" ON "academy"."lesson_video_completions" USING btree ("lesson_id","actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_course_position_idx" ON "academy"."lessons" USING btree ("course_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempts_lesson_actor_attempt_idx" ON "academy"."quiz_attempts" USING btree ("lesson_id","actor_id","attempt_number");