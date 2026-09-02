// Grade de bateria (docs/academy-recursos-musicais.md — "Percussão") — presets de levada em 4/4,
// 16 passos (semicolcheias). O bloco toca via Web Audio (sons sintetizados) e mostra a grade;
// autoria por preset, não editor de célula (fica pra depois se precisar).

export type DrumVoice = "kick" | "snare" | "hihat";
export type DrumRow = { voice: DrumVoice; label: string; steps: boolean[] };
export type DrumPattern = { label: string; rows: DrumRow[] };

const STEPS = 16;

function row(voice: DrumVoice, label: string, on: number[]): DrumRow {
  const steps = Array.from({ length: STEPS }, (_, i) => on.includes(i));
  return { voice, label, steps };
}

// Passos: 0,4,8,12 = tempos 1,2,3,4. Ímpares/entre = subdivisões.
export const DRUM_PATTERNS: Record<string, DrumPattern> = {
  backbeat: {
    label: "Backbeat (2 e 4)",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6, 8, 10, 12, 14]),
      row("snare", "Caixa", [4, 12]),
      row("kick", "Bumbo", [0, 8, 10]),
    ],
  },
  marcha: {
    label: "Marcha (1 e 3)",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6, 8, 10, 12, 14]),
      row("snare", "Caixa", [0, 8]),
      row("kick", "Bumbo", [4, 12]),
    ],
  },
  "meio-tempo": {
    label: "Meio-tempo (caixa só no 3)",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6, 8, 10, 12, 14]),
      row("snare", "Caixa", [8]),
      row("kick", "Bumbo", [0, 6]),
    ],
  },
  "levada-cheia": {
    label: "Levada cheia (refrão)",
    rows: [
      row("hihat", "Chimbal", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
      row("snare", "Caixa", [4, 12, 14]),
      row("kick", "Bumbo", [0, 3, 8, 10, 11]),
    ],
  },
  // Levada groovada/funk (gospel) para "Jesus Cristo mudou meu viver" a ~80 BPM: chimbal em
  // semicolcheias contínuas, caixa no contratempo (2 e 4) com fantasmas na "a" de cada tempo forte,
  // e bumbo sincopado (1, "a" de 1, "e" de 2, "e" de 3) empurrando a frente do tempo. Serve para
  // o REFRÃO (levada cheia).
  "groove-funk": {
    label: "Groove funk (gospel) — refrão",
    rows: [
      row("hihat", "Chimbal", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
      row("snare", "Caixa", [4, 7, 12, 15]),
      row("kick", "Bumbo", [0, 3, 6, 10]),
    ],
  },
  // Levada contida da ESTROFE: chimbal em colcheias (não semicolcheias), caixa só no tempo 4,
  // bumbo no 1 e no "e" do 2. Deixa espaço para a letra "que conta".
  "estrofe-corinho": {
    label: "Estrofe — levada contida",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6, 8, 10, 12, 14]),
      row("snare", "Caixa", [12]),
      row("kick", "Bumbo", [0, 6]),
    ],
  },
  // Virada de 1 compasso no fim de frase (estrofe -> refrão): a levada segue nos tempos 1–2 e a
  // caixa "quebra" em semicolcheias nos tempos 3–4, com o bumbo forte de novo no "1" (passo 0,
  // que na repetição da grade marca a chegada da parte nova).
  "virada-fim-de-frase": {
    label: "Virada de fim de frase",
    rows: [
      row("hihat", "Chimbal", [0, 2, 4, 6]),
      row("snare", "Caixa", [4, 8, 9, 10, 11, 12, 13, 14, 15]),
      row("kick", "Bumbo", [0, 12]),
    ],
  },
};

export const DRUM_STEPS_PER_BAR = STEPS;
