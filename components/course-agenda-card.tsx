import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { cn } from "@venore/plugin-sdk/ui";

export type CourseAgendaActivity = {
  key: string;
  label: string;
  done: boolean;
};

// Sem modelo de prazo de entrega hoje (nenhum campo de due date no schema — ver AGENTS.md seção
// 7, Known Gaps). A "agenda" mostra as atividades da aula atualmente liberada em vez de um
// calendário de prazos: é o que dá pra assinalar com honestidade sem inventar dado.
export function CourseAgendaCard({
  courseSlug,
  currentLesson,
  activities,
  className,
}: {
  courseSlug: string;
  currentLesson: { lessonId: string; position: number; title: string } | null;
  activities: CourseAgendaActivity[];
  className?: string;
}) {
  return (
    <div className={cn("rounded-panel border border-border bg-card p-4 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Agenda</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentLesson ? "Atividades da sua aula atual" : "Nada pendente no momento"}
          </p>
        </div>
        {currentLesson && (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Aula {currentLesson.position}
          </span>
        )}
      </div>

      {!currentLesson ? (
        <p className="mt-4 text-sm text-muted-foreground">Você concluiu todas as aulas liberadas até agora.</p>
      ) : activities.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Esta aula não tem atividades pendentes.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {activities.map((activity) => (
            <li
              key={activity.key}
              className={cn(
                "flex items-center gap-3 rounded-panel p-2.5",
                !activity.done && "border border-primary/40 bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  activity.done ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
                )}
              >
                {activity.done ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
              </span>
              <p
                className={cn(
                  "truncate text-sm",
                  activity.done ? "text-muted-foreground line-through" : "font-medium text-foreground",
                )}
              >
                {activity.label}
              </p>
            </li>
          ))}
        </ul>
      )}

      {currentLesson && (
        <Link
          href={`/academy/${courseSlug}/${currentLesson.lessonId}`}
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Ir para a aula →
        </Link>
      )}
    </div>
  );
}
