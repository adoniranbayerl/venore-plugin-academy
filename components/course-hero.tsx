import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { getMediaAsset } from "@venore/plugin-sdk/media";
import { cn } from "@venore/plugin-sdk/ui";

export type CourseHeroBadge = { icon: ReactNode; label: string };

// Herói do painel do curso — usa a capa real (course.coverMediaId, já existente no schema e já
// usada nos cards de curso via CourseCover) em vez de um gradiente decorativo. O véu escuro sobre
// a imagem é a mesma técnica que o overlay do Dialog já usa (bg-black/N em dialog.tsx), não uma
// cor de marca nova. Sem capa cadastrada, NÃO reaproveita a mesma caixa com véu escuro por cima
// de um fundo neutro — em dark mode os dois ficavam quase pretos empilhados e a caixa inteira
// virava um vazio (achado desta sessão, print do usuário) — cai num cabeçalho simples sem
// aspect-ratio nenhum, mesmo espírito do CourseCover (ícone/fallback só quando há área de imagem
// de verdade pra preencher).
export async function CourseHero({
  coverMediaId,
  eyebrow,
  title,
  description,
  badge,
  stats,
  backHref,
  backLabel,
}: {
  coverMediaId: string | null;
  eyebrow?: string;
  title: string;
  description: string | null;
  badge?: CourseHeroBadge;
  stats?: string[];
  backHref: string;
  backLabel: string;
}) {
  const media = coverMediaId ? await getMediaAsset({ id: coverMediaId }) : null;
  const url = media?.success ? (media.data?.url ?? null) : null;

  if (!url) {
    return (
      <div className="space-y-3 border-b border-border pb-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {eyebrow && <span className="text-[11px] font-semibold tracking-caps text-muted-foreground uppercase">{eyebrow}</span>}
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>}
          </div>
          {badge && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {badge.icon}
              {badge.label}
            </span>
          )}
        </div>
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.map((stat) => (
              <span
                key={stat}
                className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {stat}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative isolate flex aspect-21/9 min-h-60 flex-col justify-end overflow-hidden rounded-panel border border-border shadow-panel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/25 to-black/5" />

      <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 sm:inset-x-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-overlay-foreground/85 outline-none ui-motion-base hover:text-overlay-foreground focus-visible:ring-2 focus-visible:ring-overlay-foreground"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        {badge && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-overlay-foreground/25 bg-overlay-foreground/10 px-2.5 py-1 text-xs font-medium text-overlay-foreground backdrop-blur-sm">
            {badge.icon}
            {badge.label}
          </span>
        )}
      </div>

      <div className="p-5 sm:p-8">
        {eyebrow && <span className="text-[11px] font-bold tracking-caps text-accent uppercase">{eyebrow}</span>}
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-balance text-overlay-foreground sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-pretty text-sm text-overlay-foreground/80">{description}</p>}
        {stats && stats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.map((stat) => (
              <span
                key={stat}
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                  "border border-overlay-foreground/25 bg-overlay-foreground/10 text-overlay-foreground backdrop-blur-sm",
                )}
              >
                {stat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
