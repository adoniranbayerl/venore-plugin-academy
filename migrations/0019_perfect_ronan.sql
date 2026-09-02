CREATE TABLE "academy"."course_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."practice_days" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"day" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy"."course_completions" ADD CONSTRAINT "course_completions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "academy"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_completions_course_actor_idx" ON "academy"."course_completions" USING btree ("course_id","actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_days_actor_day_idx" ON "academy"."practice_days" USING btree ("actor_id","day");