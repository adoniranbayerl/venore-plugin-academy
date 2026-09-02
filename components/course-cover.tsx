import { BookOpen } from "lucide-react";
import { getMediaAsset } from "@venore/plugin-sdk/media";
import { cn } from "@venore/plugin-sdk/ui";

export async function CourseCover({ coverMediaId, className }: { coverMediaId?: string | null; className?: string }) {
  const media = coverMediaId ? await getMediaAsset({ id: coverMediaId }) : null;
  const url = media?.success ? (media.data?.url ?? null) : null;

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={cn("aspect-[16/9] w-full rounded-panel object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-[16/9] w-full items-center justify-center rounded-panel bg-(image:--sidebar-bg) text-muted-foreground/56",
        className,
      )}
    >
      <BookOpen className="size-8" strokeWidth={1.5} />
    </div>
  );
}
