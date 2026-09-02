import { Check, Download } from "lucide-react";
import { Badge } from "@venore/plugin-sdk/ui";
import { MarkMaterialReadButton } from "./mark-material-read-button";
import { PreviewMarkButton } from "./preview-mark-button";

export type LessonMaterialStepItem = { id: string; label: string; url: string; completed: boolean };

export function DoneBadge({ label }: { label: string }) {
  return (
    <Badge variant="outline" className="shrink-0 gap-1 border-success-border bg-success-soft text-success">
      <Check className="size-3" aria-hidden="true" /> {label}
    </Badge>
  );
}

export function LessonMaterialsList({
  courseSlug,
  lessonId,
  materials,
  progressMode,
}: {
  courseSlug: string;
  lessonId: string;
  materials: LessonMaterialStepItem[];
  progressMode: "live" | "preview" | "none";
}) {
  return (
    <ul className="space-y-2">
      {materials.map((material) => (
        <li
          key={material.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border px-3.5 py-2.5"
        >
          <a
            href={material.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm text-sm text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            {material.label}
          </a>
          {progressMode === "live" && (
            <MarkMaterialReadButton
              courseSlug={courseSlug}
              lessonId={lessonId}
              materialId={material.id}
              completed={material.completed}
            />
          )}
          {progressMode === "preview" &&
            (material.completed ? (
              <DoneBadge label="Lido" />
            ) : (
              <PreviewMarkButton label="Marcar como lido" doneLabel="Lido" />
            ))}
        </li>
      ))}
    </ul>
  );
}
