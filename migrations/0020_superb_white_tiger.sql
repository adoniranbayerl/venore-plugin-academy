CREATE TABLE "academy"."exercise_practice" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"exercise_key" text NOT NULL,
	"score" integer,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "exercise_practice_actor_key_idx" ON "academy"."exercise_practice" USING btree ("actor_id","exercise_key");