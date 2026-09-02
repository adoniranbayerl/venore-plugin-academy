"use client";

import { useEffect, useRef } from "react";
import { renderAbc, synth, type AbcElem } from "abcjs";

// Renderiza notação ABC (abcjs) e toca só a nota clicada via synth.playEvent — sem sequenciador,
// sem "tocar tudo": o pedido era "clicar na nota e ouvir ela", não um player de música completo.
// Usado tanto no preview do professor (lesson-examples-section.tsx) quanto na aula do aluno
// (lesson-examples-list.tsx) — mesmo componente, mesma lib dos dois lados.

// Quantos compassos por linha cabem numa largura, assumindo ~150px por compasso legível.
function measuresPerLine(width: number): number {
  return Math.max(1, Math.floor(width / 150));
}

export function InteractiveNotation({ abc, className }: { abc: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastWidth = 0;

    function draw() {
      if (!container) return;
      // Largura útil = largura do container menos o padding do wrapper (p-2 = 8px de cada lado) e
      // uma folga. `staffwidth` + `wrap` fazem o abcjs QUEBRAR os compassos em várias linhas pra
      // caber — sem `wrap`, ele mantém tudo numa linha só e estoura no mobile (bug reportado).
      const width = Math.max(240, container.clientWidth - 24);
      lastWidth = container.clientWidth;
      const tunes = renderAbc(container, abc, {
        staffwidth: width,
        wrap: { minSpacing: 1.6, maxSpacing: 2.7, preferredMeasuresPerLine: measuresPerLine(width) },
        // selectTypes: sem isso, a nota nasce com selectable=false e o clickListener nunca dispara.
        selectTypes: ["note"],
        clickListener: (abcElem: AbcElem) => {
          if (!abcElem.midiPitches || abcElem.midiPitches.length === 0) return;
          void synth.playEvent(abcElem.midiPitches, undefined, 500);
        },
      });

      // renderAbc sozinho NUNCA popula abcElem.midiPitches — só a passagem de "flatten" do
      // setUpAudio() calcula isso em cada elemento.
      tunes[0]?.setUpAudio({});
    }

    draw();

    // Redesenha quando a largura muda de verdade (rotação de tela, layout que assenta depois do
    // primeiro paint) — evita loop de re-render.
    const observer = new ResizeObserver(() => {
      if (container && Math.abs(container.clientWidth - lastWidth) > 8) draw();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [abc]);

  return <div ref={containerRef} className={className} />;
}
