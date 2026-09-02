"use client";

import { useState } from "react";
import { InteractiveNotation } from "../shared/music";
import { Button } from "@venore/plugin-sdk/ui";
import { NotationPlayButton } from "./notation-play-button";
import { SingAlongPractice } from "./sing-along-practice";
import type { NotationToken } from "./notation-abc";

// Mesmo toggle que já existe em lesson-examples-list.tsx (openPracticeId), na granularidade de um
// único bloco — sem precisar de id pra distinguir "qual exemplo", um boolean local basta.
export function NotationSheetBlockClient({
  abc,
  singAlongAbc,
  playback,
  caption,
  allowSingAlong,
  tokens,
  exerciseKey = null,
  practiceStats = null,
}: {
  abc: string;
  // ABC só da voz 1 (melodia) — o "Cantar junto" compara com uma linha só; passar o ABC multi-voz
  // desalinha a extração de notas esperadas. Sem vozes extras, é igual a `abc`.
  singAlongAbc: string;
  // Uma entrada = um botão "Ouvir <label>". Um item só (sem vozes extras) vira um botão simples.
  playback: { label: string; abc: string }[];
  caption: string;
  allowSingAlong: boolean;
  tokens: NotationToken[];
  // Gamificação: chave estável do exercício + contagem/recorde iniciais (do servidor). null quando
  // o "Cantar junto" está desligado.
  exerciseKey?: string | null;
  practiceStats?: { count: number; bestScore: number | null } | null;
}) {
  const [isPracticing, setIsPracticing] = useState(false);

  return (
    <div className="space-y-2">
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      {!isPracticing && <InteractiveNotation abc={abc} className="overflow-x-auto rounded-md bg-card p-2" />}

      {!isPracticing && (
        <div className="flex flex-wrap items-center gap-1.5">
          {playback.map((option) => (
            <NotationPlayButton key={option.label} abc={option.abc} label={option.label} />
          ))}
        </div>
      )}

      {allowSingAlong && (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsPracticing((prev) => !prev)}>
            {isPracticing ? "Fechar" : "Cantar junto"}
          </Button>
          {isPracticing && (
            <SingAlongPractice abc={singAlongAbc} tokens={tokens} exerciseKey={exerciseKey} practiceStats={practiceStats} />
          )}
        </>
      )}
    </div>
  );
}
