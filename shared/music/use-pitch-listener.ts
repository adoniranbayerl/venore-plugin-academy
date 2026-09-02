"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PitchListener, type PitchFrame, type PitchListenerStartResult } from "./pitch-listener";

export type PitchListenerStatus = "idle" | "listening" | "permission-denied" | "no-mic" | "unsupported" | "error";

// Wrapper React fino em cima de PitchListener (src/lib/pitch-listener.ts): guarda a instância num
// ref (criada só no primeiro start(), não em render) e garante que o microfone é liberado mesmo se
// o aluno sair da página no meio da gravação, não só ao clicar "Parar".
export function usePitchListener() {
  const [status, setStatus] = useState<PitchListenerStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const listenerRef = useRef<PitchListener | null>(null);
  const subscribersRef = useRef(new Set<(frame: PitchFrame) => void>());

  useEffect(() => {
    return () => {
      listenerRef.current?.stop();
    };
  }, []);

  const start = useCallback(async (): Promise<PitchListenerStartResult> => {
    if (!listenerRef.current) {
      listenerRef.current = new PitchListener((frame) => {
        subscribersRef.current.forEach((callback) => callback(frame));
      });
    }
    const result = await listenerRef.current.start();
    if (result.ok) {
      setStatus("listening");
      setErrorMessage(null);
    } else {
      setStatus(result.reason === "unknown" ? "error" : result.reason);
      setErrorMessage(result.message);
    }
    return result;
  }, []);

  const stop = useCallback(() => {
    listenerRef.current?.stop();
    setStatus("idle");
  }, []);

  const subscribe = useCallback((callback: (frame: PitchFrame) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  return { status, errorMessage, start, stop, subscribe };
}
