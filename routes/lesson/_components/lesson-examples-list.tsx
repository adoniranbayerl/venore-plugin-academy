"use client";

import { useState } from "react";
import { InteractiveNotation } from "../../../shared/music";
import { Button } from "@venore/plugin-sdk/ui";
import { SingAlongPractice } from "../../../components/sing-along-practice";

export type LessonExampleStepItem = {
  id: string;
  title: string;
  captionText: string;
  audioUrl: string | null;
  sheetUrl: string | null;
  sheetFilename: string | null;
  notationData: string | null;
};

export function LessonExamplesList({ examples }: { examples: LessonExampleStepItem[] }) {
  const [openPracticeId, setOpenPracticeId] = useState<string | null>(null);

  return (
    <ul className="space-y-4">
      {examples.map((example) => {
        const isPracticing = openPracticeId === example.id;
        return (
          <li key={example.id} className="rounded-md border border-border px-3.5 py-3">
            <p className="text-sm font-medium text-foreground">{example.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{example.captionText}</p>
            <div className="mt-2 space-y-2">
              {example.notationData && (
                <>
                  {!isPracticing && (
                    <InteractiveNotation
                      abc={example.notationData}
                      className="overflow-x-auto rounded-md bg-card p-2"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenPracticeId(isPracticing ? null : example.id)}
                  >
                    {isPracticing ? "Fechar" : "Cantar junto"}
                  </Button>
                  {isPracticing && <SingAlongPractice abc={example.notationData} />}
                </>
              )}
              {example.audioUrl && <audio controls src={example.audioUrl} className="h-8 w-full" />}
              {example.sheetUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={example.sheetUrl}
                  alt={example.sheetFilename ?? example.title}
                  className="max-h-56 rounded-md border border-border"
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
