// Wrapper visual da seção de vídeo da aula. O parser de URL vive em shared/embeddable-video.ts
// (reaproveitado pelo bloco academy.video); aqui é só a moldura + o fallback de link.
import { parseEmbeddableVideoUrl } from "../../../shared/embeddable-video";

export function LessonVideoEmbed({ url }: { url: string }) {
  const video = parseEmbeddableVideoUrl(url);

  if (!video) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
        {url}
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded border border-border">
      <iframe
        src={video.embedUrl}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
