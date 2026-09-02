"use client";

import { useState, useTransition } from "react";
import { Badge } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { Textarea } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";
import type { LessonMessageThreadType } from "../../../index";
import {
  getMessageThreadForStudentAction,
  sendTeacherMessageAction,
  type TeacherMessageItem,
} from "../actions";

const TYPE_LABEL: Record<LessonMessageThreadType, string> = { question: "Dúvida", correction: "Correção" };

// Uma conversa (aula+etapa+aluno) — colapsada por padrão, mesma mecânica de "abrir sob demanda"
// de ActivitySubmissionsPanel (lessons/[id]/_components/). Responder aqui É a "corrigir trabalhos
// ... enviar mensagens dentro dos trabalhos" pedida pra etapa "activity"; pras outras etapas é só
// a resposta à dúvida/correção do aluno.
export function MessageThreadPanel({
  threadId,
  lessonId,
  stepKey,
  studentActorId,
  courseId,
  title,
  type,
  unreadCount,
}: {
  threadId: string;
  lessonId: string;
  stepKey: string;
  studentActorId: string;
  courseId: string;
  title: string;
  type: LessonMessageThreadType;
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState<TeacherMessageItem[]>([]);
  const [body, setBody] = useState("");
  const [pendingLoad, startLoad] = useTransition();
  const [pendingSend, startSend] = useTransition();

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      startLoad(async () => {
        const data = await getMessageThreadForStudentAction(threadId);
        setMessages(data);
        setLoaded(true);
      });
    }
  }

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    startSend(async () => {
      const result = await sendTeacherMessageAction(lessonId, stepKey, studentActorId, trimmed, courseId);
      if (result.error || !result.message) return;
      setMessages((prev) => [...prev, result.message as TeacherMessageItem]);
      setBody("");
    });
  }

  return (
    <div className="rounded-panel border border-border p-3">
      <button type="button" onClick={toggle} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="outline">{TYPE_LABEL[type]}</Badge>
          {unreadCount > 0 && <Badge>{unreadCount} nova{unreadCount > 1 ? "s" : ""}</Badge>}
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {pendingLoad && !loaded ? (
            <p className="text-xs text-muted-foreground">Carregando…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda.</p>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    message.senderRole === "teacher" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {message.body}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Responder…"
              className="min-h-16 text-sm"
            />
          </div>
          <Button type="button" size="sm" disabled={pendingSend || body.trim().length === 0} onClick={handleSend}>
            Enviar
          </Button>
        </div>
      )}
    </div>
  );
}
