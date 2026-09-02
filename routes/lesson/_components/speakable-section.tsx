"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Square, Volume2 } from "lucide-react";

const noopSubscribe = () => () => {};

// Seção de texto da aula com um botão "Ouvir" (leitura por voz via speechSynthesis, nativo do
// navegador) — pedido de acessibilidade pro público de letramento digital / idade avançada. Lê o
// texto renderizado (textContent do <article>), então não precisa extrair texto puro da
// composição de blocos. Some quando o navegador não suporta.
export function SpeakableSection({ title, children }: { title: string; children: ReactNode }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState(false);
  // Suporte a speechSynthesis não muda durante a vida do componente — lido como store externo pra
  // não cair no react-hooks/set-state-in-effect, e com snapshot de servidor false (SSR).
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => "speechSynthesis" in window,
    () => false,
  );

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function toggle() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = `${title}. ${articleRef.current?.textContent ?? ""}`.replace(/\s+/g, " ").trim();
    if (!text) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {supported && (
          <button
            type="button"
            onClick={toggle}
            aria-pressed={speaking}
            className="inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-1 text-[11px] font-medium text-muted-foreground outline-none ui-motion-base hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {speaking ? <Square className="size-3.5" aria-hidden="true" /> : <Volume2 className="size-3.5" aria-hidden="true" />}
            {speaking ? "Parar" : "Ouvir"}
          </button>
        )}
      </div>
      <article ref={articleRef} className="prose max-w-none text-sm">
        {children}
      </article>
    </div>
  );
}
