"use client";

import { useSyncExternalStore } from "react";
import { Type } from "lucide-react";

// Preferências de leitura da aula — tamanho do texto (3 níveis) e fonte mais legível. Público de
// letramento digital / idade avançada. Vive em localStorage, client-only, por navegador (mesmo
// padrão do color-mode — AGENTS.md, "nav-mode vs color-mode"); sincronizar com a conta fica pra
// depois. useSyncExternalStore porque ler localStorage é sincronizar com um store externo; o
// evento custom existe porque o "storage" nativo só dispara em OUTRAS abas.
const STORAGE_KEY = "academy-reading-prefs";
const EVENT = "academy-reading-prefs-change";

export type ReadingPrefs = { scale: number; readableFont: boolean };

const DEFAULT_PREFS: ReadingPrefs = { scale: 1, readableFont: false };
const SCALES = [1, 1.15, 1.35] as const;
const READABLE_FONT_STACK =
  '"Atkinson Hyperlegible", "Verdana", "Segoe UI", system-ui, sans-serif';

function readSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function serverSnapshot(): string {
  return "";
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function parse(raw: string): ReadingPrefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const value = JSON.parse(raw) as Partial<ReadingPrefs>;
    const scale = SCALES.includes(value.scale as (typeof SCALES)[number]) ? (value.scale as number) : 1;
    return { scale, readableFont: value.readableFont === true };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useReadingPrefs(): { prefs: ReadingPrefs; setPrefs: (next: ReadingPrefs) => void } {
  const raw = useSyncExternalStore(subscribe, readSnapshot, serverSnapshot);
  const prefs = parse(raw);

  function setPrefs(next: ReadingPrefs) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private mode / storage bloqueado — a preferência só não persiste */
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return { prefs, setPrefs };
}

// Estilo pra aplicar no container do conteúdo da etapa — `zoom` escala TUDO (parágrafos, títulos,
// legendas) sem cada bloco precisar saber da preferência.
export function readingPrefsStyle(prefs: ReadingPrefs): React.CSSProperties {
  return {
    zoom: prefs.scale !== 1 ? prefs.scale : undefined,
    fontFamily: prefs.readableFont ? READABLE_FONT_STACK : undefined,
  };
}

export function ReadingPreferencesControl() {
  const { prefs, setPrefs } = useReadingPrefs();
  const scaleIndex = SCALES.indexOf(prefs.scale as (typeof SCALES)[number]);

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <Type className="size-3.5" aria-hidden="true" />
      <div className="flex items-center gap-0.5" role="group" aria-label="Tamanho do texto">
        {SCALES.map((scale, index) => (
          <button
            key={scale}
            type="button"
            onClick={() => setPrefs({ ...prefs, scale })}
            aria-pressed={scaleIndex === index}
            title={index === 0 ? "Texto normal" : index === 1 ? "Texto maior" : "Texto bem maior"}
            className={`rounded-sm px-1.5 py-0.5 outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring ${
              scaleIndex === index ? "bg-primary/10 text-primary" : "hover:text-foreground"
            }`}
            style={{ fontSize: `${11 + index * 3}px` }}
          >
            A
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPrefs({ ...prefs, readableFont: !prefs.readableFont })}
        aria-pressed={prefs.readableFont}
        className={`rounded-sm px-1.5 py-0.5 outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring ${
          prefs.readableFont ? "bg-primary/10 text-primary" : "hover:text-foreground"
        }`}
      >
        Fonte legível
      </button>
    </div>
  );
}
