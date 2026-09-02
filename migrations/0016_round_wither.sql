CREATE TABLE "academy"."lesson_message_threads" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"step_key" text NOT NULL,
	"student_actor_id" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy"."lesson_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"sender_role" text NOT NULL,
	"sender_actor_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "academy"."lesson_message_threads" ADD CONSTRAINT "lesson_message_threads_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "academy"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy"."lesson_messages" ADD CONSTRAINT "lesson_messages_thread_id_lesson_message_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "academy"."lesson_message_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_message_threads_lesson_step_student_idx" ON "academy"."lesson_message_threads" USING btree ("lesson_id","step_key","student_actor_id");