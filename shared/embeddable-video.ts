// Parser puro de URL de vídeo — sem estado, sem JSX. Cobre os formatos mais comuns de YouTube e
// Vimeo; URL não reconhecida devolve null (o chamador cai num fallback de link simples). Usado
// tanto pela seção de vídeo da aula (routes/lesson/_components/lesson-video-embed.tsx) quanto pelo
// bloco academy.video do page-builder (blocks/video-block.tsx).

export type EmbeddableVideo = { provider: "youtube" | "vimeo"; embedUrl: string };

export function parseEmbeddableVideoUrl(rawUrl: string): EmbeddableVideo | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const videoId = url.searchParams.get("v");
      if (videoId) return { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
      return null;
    }
    const match = url.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
    if (match) return { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${match[2]}` };
    return null;
  }

  if (host === "youtu.be") {
    const videoId = url.pathname.slice(1);
    if (videoId) return { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
    return null;
  }

  if (host === "vimeo.com") {
    const match = url.pathname.match(/^\/(\d+)/);
    if (match) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
    return null;
  }

  if (host === "player.vimeo.com") {
    const match = url.pathname.match(/^\/video\/(\d+)/);
    if (match) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
    return null;
  }

  return null;
}
