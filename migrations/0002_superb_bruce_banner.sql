CREATE TABLE "academy"."enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enrolled_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy"."courses" ADD COLUMN "self_enrollment_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "academy"."courses" ADD COLUMN "publicly_listed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "academy"."enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "academy"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_course_actor_idx" ON "academy"."enrollments" USING btree ("course_id","actor_id");