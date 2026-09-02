ALTER TABLE "academy"."quiz_questions" ADD COLUMN "option_notations" jsonb;--> statement-breakpoint
ALTER TABLE "academy"."quiz_questions" ADD COLUMN "question_kind" text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "academy"."quiz_questions" ADD COLUMN "prompt_notation" text;