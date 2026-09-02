"use client";

import type { Block, BlockDefinition } from "@venore/plugin-sdk/cms";
import { NotationEditor } from "../components/notation-editor";
import type { KeySignature, NotationToken, NotationVoice, TimeSignature } from "../components/notation-abc";

function readTokens(data: Block["data"]): NotationToken[] {
  const value = data.tokens;
  return Array.isArray(value) ? (value as NotationToken[]) : [];
}

function readCaption(data: Block["data"]): string {
  const value = data.caption;
  return typeof value === "string" ? value : "";
}

function readAllowSingAlong(data: Block["data"]): boolean {
  return data.allowSingAlong !== false;
}

function readKey(data: Block["data"]): KeySignature {
  return typeof data.key === "string" ? (data.key as KeySignature) : "C";
}

function readTimeSignature(data: Block["data"]): TimeSignature {
  return typeof data.timeSignature === "string" ? (data.timeSignature as TimeSignature) : "4/4";
}

function readBpm(data: Block["data"]): number {
  return typeof data.bpm === "number" ? data.bpm : 90;
}

function readShowNoteNames(data: Block["data"]): boolean {
  return data.showNoteNames === true;
}

function readLyrics(data: Block["data"]): string[] | undefined {
  const value = data.lyrics;
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : undefined;
}

function readVoices(data: Block["data"]): NotationVoice[] | undefined {
  const value = data.voices;
  if (!Array.isArray(value)) return undefined;
  const voices = value
    .filter((entry): entry is { name?: unknown; tokens?: unknown } => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      name: typeof entry.name === "string" ? entry.name : undefined,
      tokens: Array.isArray(entry.tokens) ? (entry.tokens as NotationToken[]) : [],
    }));
  return voices.length > 0 ? voices : undefined;
}

// Painel custom (registrado em field-panels.ts) em vez do genérico BlockFieldsPanel: "tokens"
// precisa do compositor visual clique-a-clique (NotationEditor em modo controlado), que não existe
// como EditorFieldType genérico. Mesmo contrato de props do painel genérico — só o corpo é
// específico deste bloco.
export function NotationSheetFieldPanel({
  block,
  definition,
  errorMessage,
  onChange,
}: {
  block: Block;
  definition: BlockDefinition;
  errorMessage: string | null;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const tokens = readTokens(block.data);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{definition.label}</h2>
        <p className="text-xs text-muted-foreground/56">{definition.category}</p>
      </div>

      {errorMessage && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">{errorMessage}</p>
      )}

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Melodia</label>
        <div className="mt-1">
          <NotationEditor
            // key={block.id}: força remontar ao trocar de bloco selecionado no builder — sem isso,
            // o estado de seleção de nota (interno deste componente, não faz parte de
            // NotationComposition) ficaria apontando pra um índice do bloco anterior.
            key={block.id}
            value={{
              tokens,
              key: readKey(block.data),
              timeSignature: readTimeSignature(block.data),
              bpm: readBpm(block.data),
              showNoteNames: readShowNoteNames(block.data),
              lyrics: readLyrics(block.data),
              voices: readVoices(block.data),
            }}
            onChange={(next) => onChange({ ...block.data, ...next, voices: next.voices ?? [] })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Legenda (opcional)</label>
        <input
          type="text"
          value={readCaption(block.data)}
          onChange={(event) => onChange({ ...block.data, caption: event.target.value })}
          className="mt-1 w-full rounded-md border border-border px-2 py-1 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <input
          type="checkbox"
          checked={readAllowSingAlong(block.data)}
          onChange={(event) => onChange({ ...block.data, allowSingAlong: event.target.checked })}
        />
        Permitir &quot;Cantar junto&quot;
      </label>
    </div>
  );
}
