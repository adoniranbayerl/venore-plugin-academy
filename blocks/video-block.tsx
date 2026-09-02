import type { BlockRendererProps } from "@venore/plugin-sdk";
import { parseEmbeddableVideoUrl } from "../shared/embeddable-video";

function readString(data: Record<string, unknown>, field: string): string {
  const value = data[field];
  return typeof value === "string" ? value : "";
}

export function AcademyVideoBlock({ block }: BlockRendererProps) {
  const url = readString(block.data, "url").trim();
  if (!url) return null;

  const caption = readString(block.data, "caption");
  const video = parseEmbeddableVideoUrl(url);

  return (
    <figure className="space-y-2">
      {video ? (
        <div className="aspect-video w-full overflow-hidden rounded border border-border">
          <iframe
            src={video.embedUrl}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
          {url}
        </a>
      )}
      {caption && <figcaption className="text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
