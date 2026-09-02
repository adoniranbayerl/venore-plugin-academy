"use client";

import { useEffect, useState } from "react";
import { Check, Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@venore/plugin-sdk/ui";

// "Baixar para offline" um curso: manda a lista de URLs das aulas pro service worker cachear
// (cache "lessons-v1"). Depois, sem rede, as navegações em /academy/** caem nesse cache.
// Só funciona com o SW ativo (produção) e `caches` disponível — fora disso não renderiza nada.
const LESSONS_CACHE = "lessons-v1";
const storageKey = (courseId: string) => `pwa-offline-course-${courseId}`;

type State = "unsupported" | "idle" | "downloading" | "ready" | "error";

async function messageSW(message: unknown): Promise<{ ok: boolean; error?: string }> {
  const controller = navigator.serviceWorker.controller;
  if (!controller) return { ok: false, error: "sem service worker" };
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => resolve(event.data ?? { ok: false });
    controller.postMessage(message, [channel.port2]);
    window.setTimeout(() => resolve({ ok: false, error: "timeout" }), 60_000);
  });
}

export function OfflineCourseToggle({ courseId, paths }: { courseId: string; paths: string[] }) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const id = window.setTimeout(() => {
      const supported = "serviceWorker" in navigator && "caches" in window && Boolean(navigator.serviceWorker.controller);
      if (!supported) {
        setState("unsupported");
        return;
      }
      try {
        setState(window.localStorage.getItem(storageKey(courseId)) ? "ready" : "idle");
      } catch {
        setState("idle");
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [courseId]);

  async function download() {
    setState("downloading");
    const result = await messageSW({ type: "CACHE_URLS", cacheName: LESSONS_CACHE, urls: paths });
    if (!result.ok) {
      setState("error");
      toast.error("Não consegui baixar o curso para offline.");
      return;
    }
    try {
      window.localStorage.setItem(storageKey(courseId), JSON.stringify({ paths, at: Date.now() }));
    } catch {
      // sem localStorage: o cache foi feito, só não fica lembrado entre sessões
    }
    setState("ready");
    toast.success("Curso disponível offline.");
  }

  async function remove() {
    const result = await messageSW({ type: "UNCACHE_URLS", cacheName: LESSONS_CACHE, urls: paths });
    try {
      window.localStorage.removeItem(storageKey(courseId));
    } catch {
      // ignora
    }
    setState("idle");
    if (!result.ok) toast.error("Removi da lista, mas pode ter sobrado algo no cache.");
  }

  if (state === "unsupported") return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-panel border border-border bg-card p-3 text-sm">
      <div className="flex items-center gap-2.5 text-foreground">
        {state === "ready" ? (
          <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Download className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span>
          {state === "ready"
            ? "Curso salvo para ler offline."
            : state === "downloading"
              ? "Baixando as aulas…"
              : "Baixar o curso para ler sem internet."}
        </span>
      </div>
      {state === "ready" ? (
        <Button type="button" variant="ghost" size="sm" onClick={remove} aria-label="Remover download">
          <Trash2 className="size-4 text-destructive" aria-hidden="true" />
        </Button>
      ) : (
        <Button type="button" size="sm" disabled={state === "downloading"} onClick={download}>
          {state === "downloading" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : "Baixar"}
        </Button>
      )}
    </div>
  );
}
