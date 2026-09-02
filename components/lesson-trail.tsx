import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { cn } from "@venore/plugin-sdk/ui";

export type LessonTrailItem = {
  id: string;
  position: number;
  title: string;
  state: "completed" | "current" | "unlocked" | "locked";
};

export function LessonTrail({ courseSlug, items }: { courseSlug: string; items: LessonTrailItem[] }) {
  return (
    <nav
      aria-label="Trilha da aula"
      // sticky só no desktop (lg): no mobile a trilha fica empilhada no fim da página (aside vira
      // flex-col), e um `sticky` ali faz o card deslizar por cima do que vem depois — ex.: o
      // widget de doação — ao rolar. No mobile é fluxo normal.
      className="flex flex-col gap-2 rounded-panel border border-border bg-card p-4 shadow-panel lg:sticky lg:top-8"
    >
      <p className="text-[11px] font-semibold tracking-caps text-muted-foreground/56 uppercase">Trilha do curso</p>
      <ol className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isLocked = item.state === "locked";
          const isCurrent = item.state === "current";

          const row = (
            <span
              className={cn(
                "flex items-center gap-2 rounded-control px-2 py-1.5 text-sm",
                isCurrent && "bg-accent/14 font-medium text-primary",
                !isCurrent && !isLocked && "text-muted-foreground",
                isLocked && "text-muted-foreground/56",
              )}
            >
              {item.state === "completed" ? (
                <Check className="size-3.5 shrink-0 text-success" />
              ) : isLocked ? (
                <Lock className="size-3.5 shrink-0" />
              ) : (
                <span
                  className={cn(
                    "size-3.5 shrink-0 rounded-full border",
                    isCurrent ? "border-primary" : "border-muted-foreground/56",
                  )}
                />
              )}
              <span className="truncate">
                {item.position}. {item.title}
              </span>
            </span>
          );

          return (
            <li key={item.id}>
              {isLocked ? row : <Link href={`/academy/${courseSlug}/${item.id}`}>{row}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
