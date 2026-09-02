import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { cn } from "@venore/plugin-sdk/ui";
import type { LessonProgressView } from "../index";

// Lista compacta de linhas (v2 — substitui a trilha ilustrada com linha conectando círculos):
// mesmo vocabulário do resto do admin (borda + divisor, sem elemento gráfico novo pra sustentar).
// Cor continua reservada a estado real: --success só quando concluída, --primary só na atual.
export function CourseLessonList({ courseSlug, lessons }: { courseSlug: string; lessons: LessonProgressView[] }) {
  return (
    <div className="overflow-hidden rounded-panel border border-border">
      {lessons.map((lesson) => {
        const isCurrent = !lesson.locked && !lesson.completed;
        const href = `/academy/${courseSlug}/${lesson.lessonId}`;

        return (
          <div
            key={lesson.lessonId}
            className={cn(
              "flex items-center gap-3.5 border-b border-border px-4 py-3.5 last:border-b-0",
              !lesson.locked && "ui-motion-base hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border",
                lesson.completed && "border-success bg-success text-success-foreground",
                isCurrent && "border-primary text-primary",
                lesson.locked && "border-border text-muted-foreground",
              )}
            >
              {lesson.completed ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : lesson.locked ? (
                <Lock className="size-3" strokeWidth={2.5} />
              ) : (
                <span className="size-2 rounded-full bg-current" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              {lesson.locked ? (
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {lesson.position}. {lesson.title}
                </p>
              ) : (
                <Link
                  href={href}
                  className="truncate rounded-sm text-sm font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {lesson.position}. {lesson.title}
                </Link>
              )}
              {isCurrent && (
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {lesson.videoUrl && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">vídeo</span>
                  )}
                  {lesson.requirements.quizEnabled && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      quiz · {lesson.requirements.quizAttemptsUsed > 0 ? "em andamento" : "não iniciado"}
                    </span>
                  )}
                </div>
              )}
            </div>

            <span className="shrink-0 text-right text-xs">
              {lesson.completed && lesson.requirements.quizEnabled && lesson.requirements.quizBestGrade !== null ? (
                <span className="font-semibold text-foreground tabular-nums">{lesson.requirements.quizBestGrade.toFixed(1)}</span>
              ) : isCurrent ? (
                <Link href={href} className="font-medium text-primary hover:underline">
                  Continuar
                </Link>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
