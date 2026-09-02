import type { BlockRendererProps } from "@venore/plugin-sdk";
import {
  compositionToAbc,
  type KeySignature,
  type NotationComposition,
  type NotationToken,
  type NotationVoice,
  type TimeSignature,
} from "../components/notation-abc";
import { NotationSheetBlockClient } from "../components/notation-sheet-block-client";
import { getExercisePracticeStatsHandler } from "../features/progress/get-exercise-practice-stats/handler";
import { singAlongExerciseKey } from "../shared/exercise-key";

function readTokens(data: Record<string, unknown>): NotationToken[] {
  const value = data.tokens;
  return Array.isArray(value) ? (value as NotationToken[]) : [];
}

function readCaption(data: Record<string, unknown>): string {
  const value = data.caption;
  return typeof value === "string" ? value : "";
}

function readAllowSingAlong(data: Record<string, unknown>): boolean {
  return data.allowSingAlong !== false;
}

function readKey(data: Record<string, unknown>): KeySignature {
  return typeof data.key === "string" ? (data.key as KeySignature) : "C";
}

function readTimeSignature(data: Record<string, unknown>): TimeSignature {
  return typeof data.timeSignature === "string" ? (data.timeSignature as TimeSignature) : "4/4";
}

function readBpm(data: Record<string, unknown>): number {
  return typeof data.bpm === "number" ? data.bpm : 90;
}

function readShowNoteNames(data: Record<string, unknown>): boolean {
  return data.showNoteNames === true;
}

function readLyrics(data: Record<string, unknown>): string[] | undefined {
  const value = data.lyrics;
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : undefined;
}

function readVoices(data: Record<string, unknown>): NotationVoice[] | undefined {
  const value = data.voices;
  if (!Array.isArray(value)) return undefined;
  const voices = value
    .filter((entry): entry is { name?: unknown; tokens?: unknown } => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      name: typeof entry.name === "string" ? entry.name : undefined,
      tokens: Array.isArray(entry.tokens) ? (entry.tokens as NotationToken[]) : [],
    }))
    .filter((voice) => voice.tokens.length > 0);
  return voices.length > 0 ? voices : undefined;
}

// Mesmo padrão de RichtextBlock (block-renderers.tsx): bloco sem conteúdo não renderiza nada em
// nenhum modo — tokens: [] é o estado inicial de todo bloco recém-adicionado, antes do professor
// compor a melodia.
function hasNotationTokens(data: Record<string, unknown>): boolean {
  return readTokens(data).length > 0;
}

export async function AcademyNotationSheetBlock({ block }: BlockRendererProps) {
  if (!hasNotationTokens(block.data)) return null;

  const tokens = readTokens(block.data);
  const voices = readVoices(block.data);
  const composition: NotationComposition = {
    key: readKey(block.data),
    timeSignature: readTimeSignature(block.data),
    tokens,
    bpm: readBpm(block.data),
    showNoteNames: readShowNoteNames(block.data),
    lyrics: readLyrics(block.data),
    voices,
  };

  const abc = compositionToAbc(composition);
  const melodyAbc = compositionToAbc({ ...composition, voices: undefined });

  // Contador de repetições (gamificação): só quando o "Cantar junto" está ligado. A chave é o
  // hash da melodia (estável por conteúdo — ver shared/exercise-key.ts). As stats iniciais vêm do
  // servidor; o SingAlongPractice atualiza a cada tentativa pelo retorno da action.
  const allowSingAlong = readAllowSingAlong(block.data);
  const exerciseKey = allowSingAlong ? singAlongExerciseKey(melodyAbc) : null;
  const statsResult = exerciseKey ? await getExercisePracticeStatsHandler({ exerciseKey }) : null;
  const practiceStats = statsResult && statsResult.success ? statsResult.data : null;

  // Uma opção de reprodução por voz + "Tudo" — é isto que dá o "ouvir só a melodia" (pedido do
  // dono). Sem vozes extras, só um botão "Ouvir".
  const playback = voices
    ? [
        { label: "Tudo", abc },
        { label: "Melodia", abc: melodyAbc },
        ...voices.map((voice, index) => ({
          label: voice.name ?? `Voz ${index + 2}`,
          abc: compositionToAbc({ ...composition, tokens: voice.tokens, voices: undefined, lyrics: undefined }),
        })),
      ]
    : [{ label: "Ouvir", abc }];

  return (
    <NotationSheetBlockClient
      abc={abc}
      singAlongAbc={melodyAbc}
      playback={playback}
      caption={readCaption(block.data)}
      allowSingAlong={allowSingAlong}
      tokens={tokens}
      exerciseKey={exerciseKey}
      practiceStats={practiceStats}
    />
  );
}
