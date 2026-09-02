"use client";

import { createContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Flag, ListChecks, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@venore/plugin-sdk/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@venore/plugin-sdk/ui";
import { Textarea } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";
import { getLessonMessageThreadAction, sendLessonMessageAction, type LessonMessageItem } from "../actions";
import { ReadingPreferencesControl, readingPrefsStyle, useReadingPrefs } from "./reading-preferences";

type ActionState = { error: string | null };

// "server": chama a Server Action de verdade (mesmo round-trip que existia no botão dedicado
// antes) — usado no modo live. "local": só feedback no client, sem persistir nada (modo preview,
// onde marcar como lida já é simulação — ver preview-mark-button.tsx, reaproveitado só nas linhas
// de material, que continuam com estado próprio por serem vários itens independentes).
export type ReadMarkAction =
  | { kind: "server"; action: (prevState: ActionState, formData: FormData) => Promise<ActionState>; fields: Record<string, string> }
  | { kind: "local" };

export type LessonStepReadMark = {
  mark: ReadMarkAction;
  // Verdade do servidor no momento do render (sempre false em modo "none"/free-sample, que não
  // rastreia nada). Combinada com o estado local otimista abaixo pra decidir o que mostrar.
  completed: boolean;
  actionLabel: string;
  doneLabel: string;
  // Só etapas de leitura pedem confirmação ao avançar sem marcar (pedido desta sessão) — vídeo
  // fica de fora de propósito, não faz parte do pedido original.
  confirmBeforeAdvance?: boolean;
};

export type LessonFlowStep = {
  id: string;
  kicker: string;
  content: ReactNode;
  readMark?: LessonStepReadMark;
  // false só na etapa de doação (buildDonationStep em page.tsx) — "dúvida"/"correção" não fazem
  // sentido ali. Default true (ausente = mensagens permitidas).
  allowMessages?: boolean;
  // true só na etapa de doação — pedido desta sessão: "Voltar ao curso"/"Próxima aula" acima do
  // "Faça uma doação", não abaixo (a etapa final não tem mais nada pra avançar depois dela, então
  // a navegação de saída faz mais sentido antes do pedido de apoio do que depois). Default false
  // (ausente = barra de navegação continua depois do conteúdo, como em toda outra etapa).
  navBeforeContent?: boolean;
  // Só a etapa "activity" em modo interativo preenche isto (pedido desta sessão: "não podemos
  // seguir sem que tudo seja marcado como concluído"). totalCount vem de activities.length;
  // initiallyCompleteIds das entregas que já existem no servidor no momento do render (mesmo
  // critério que já bloqueia a PRÓXIMA aula em shared/lesson-chain.ts: entrega existe, não
  // precisa estar aprovada). ActivitiesList (activity-form.tsx) reporta as entregas feitas DEPOIS
  // via ActivityGateContext, logo abaixo.
  activityGate?: { totalCount: number; initiallyCompleteIds: string[] };
};

// Ponte entre ActivitiesList (dentro de current.content, uma etapa por vez) e LessonStepFlow (dono
// do botão "Avançar") — só existe enquanto a etapa atual tiver activityGate (ver Provider mais
// abaixo). Null fora desse contexto: componentes de atividade em modo preview/amostra grátis não
// têm gate nenhum pra reportar.
export const ActivityGateContext = createContext<((activityId: string, complete: boolean) => void) | null>(null);

// lessonId + threadsByStepKey resolvidos no servidor (page.tsx, só no modo "full" — sem matrícula
// real não tem pra quem mandar mensagem). threadsByStepKey[stepId] ausente = conversa ainda não
// começou nessa etapa (dot de não-lida não aparece, histórico abre vazio).
export type LessonStepMessaging = {
  lessonId: string;
  threadsByStepKey: Record<string, { unreadCount: number }>;
};

const MESSAGE_TYPE_LABEL: Record<"question" | "correction", string> = {
  question: "Tirar dúvida",
  correction: "Viu algo errado?",
};

// Aula real é composta por vídeo + seções + material + quiz (Fase 7) — antes tudo abria de uma
// vez num acordeão, cada tipo com sua própria cor de fundo. Aqui vira um fluxo guiado, uma etapa
// por vez. O controle de "marcar como lida/assistido" (botão ao final + dialog de confirmação)
// mora TODO aqui, numa única fonte de estado (`locallyRead`) — antes o botão embutido no
// conteúdo de cada etapa (server-rendered) e o dialog desta tela liam de lugares diferentes, e um
// marcar via dialog não refletia no botão (bug reportado nesta sessão: aula marcada, botão ainda
// dizia "marcar como lida"). Content agora só traz o CORPO da etapa, nunca o botão de conclusão.
export function LessonStepFlow({
  steps,
  courseHref,
  nextLessonHref,
  messaging,
  initialStepId,
  autoOpenMessage,
}: {
  steps: LessonFlowStep[];
  // Pra onde o aluno vai quando chega na última etapa — sem isso, "Avançar" só ficava desabilitado
  // no fim da aula e a pessoa não tinha como continuar (bug reportado nesta sessão). null/undefined
  // em nextLessonHref = esta é a última aula do curso, ou o modo atual (preview/amostra grátis)
  // não tem uma "próxima aula" com sentido — só "Voltar ao curso" aparece nesse caso.
  courseHref: string;
  nextLessonHref?: string | null;
  // Ausente em preview de professor/amostra grátis (sem matrícula real, ver AcademyLessonPage) —
  // os dois botões de contato só aparecem quando presente.
  messaging?: LessonStepMessaging;
  // Vem do query param ?openThread= (deep link do alerta de mensagem/inbox — pedido desta sessão:
  // "preciso estar na etapa pra ver a resposta do professor"). id de step que não existe nesta
  // aula cai pro comportamento default (primeira etapa).
  initialStepId?: string;
  // Junto com initialStepId: abre o dialog de mensagem certo assim que a etapa carrega, em vez de
  // exigir mais um clique em "Tirar dúvida"/"Viu algo errado?".
  autoOpenMessage?: "question" | "correction";
}) {
  const [index, setIndex] = useState(() => {
    if (!initialStepId) return 0;
    const found = steps.findIndex((step) => step.id === initialStepId);
    return found >= 0 ? found : 0;
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locallyRead, setLocallyRead] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const { prefs: readingPrefs } = useReadingPrefs();

  // Ao trocar de etapa, o scroll ficava onde estava (ex: no rodapé, depois de terminar a
  // avaliação) — o aluno avançava e não via o conteúdo novo. Volta ao topo do fluxo a cada
  // mudança de `index`, menos no primeiro render (a página já carrega no lugar certo, inclusive
  // quando vem por deep link de mensagem com initialStepId).
  const flowRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(index);
  useEffect(() => {
    if (prevIndexRef.current === index) return; // primeiro render (e re-invocação do StrictMode)
    prevIndexRef.current = index;
    flowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [index]);

  const [messageType, setMessageType] = useState<"question" | "correction" | null>(null);
  const [messageLoaded, setMessageLoaded] = useState(false);
  const [messages, setMessages] = useState<LessonMessageItem[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [messagePending, startMessageTransition] = useTransition();

  const [activityCompletion, setActivityCompletion] = useState<Record<string, boolean>>(() => {
    const step = steps.find((item) => item.activityGate);
    if (!step?.activityGate) return {};
    return Object.fromEntries(step.activityGate.initiallyCompleteIds.map((id) => [id, true]));
  });

  // Roda uma vez, só quando a aula chega via deep link de mensagem (ver initialStepId/autoOpenMessage
  // acima) — abrir o dialog não deve repetir a cada navegação manual entre etapas. Antes do early
  // return de `steps.length === 0` logo abaixo (hooks não podem ser condicionais), por isso
  // recalcula a etapa/permissão localmente em vez de reusar `current`/`canMessage`.
  useEffect(() => {
    if (!autoOpenMessage || steps.length === 0) return;
    const step = steps[Math.min(index, steps.length - 1)];
    if (!!messaging && step.allowMessages !== false) {
      openMessageDialog(autoOpenMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (steps.length === 0) return null;

  const current = steps[Math.min(index, steps.length - 1)];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const isCurrentRead = current.readMark ? current.readMark.completed || locallyRead.has(current.id) : false;
  const needsConfirm = !!current.readMark?.confirmBeforeAdvance && !isCurrentRead;
  const canMessage = !!messaging && current.allowMessages !== false;
  const currentUnread = messaging?.threadsByStepKey[current.id]?.unreadCount ?? 0;
  const activityGateBlocked =
    !!current.activityGate &&
    current.activityGate.totalCount > Object.values(activityCompletion).filter(Boolean).length;
  const activityStepIndex = steps.findIndex((step) => step.id === "activity");
  const quizStepIndex = steps.findIndex((step) => step.id === "quiz");

  function goNext() {
    setIndex((value) => Math.min(value + 1, steps.length - 1));
  }

  function openMessageDialog(type: "question" | "correction") {
    setMessageType(type);
    setMessageLoaded(false);
    setMessages([]);
    setMessageBody("");
    if (messaging) {
      startMessageTransition(async () => {
        const data = await getLessonMessageThreadAction(messaging.lessonId, current.id);
        setMessages(data);
        setMessageLoaded(true);
      });
    }
  }

  function handleSendMessage() {
    const trimmed = messageBody.trim();
    if (!trimmed || !messaging || !messageType) return;
    startMessageTransition(async () => {
      const result = await sendLessonMessageAction(messaging.lessonId, current.id, messageType, trimmed);
      if (result.error || !result.message) {
        toast.error(result.error ?? "Não foi possível enviar a mensagem.");
        return;
      }
      setMessages((prev) => [...prev, result.message as LessonMessageItem]);
      setMessageBody("");
    });
  }

  function performMark(step: LessonFlowStep, onDone?: () => void) {
    const readMark = step.readMark;
    if (!readMark) return;

    if (readMark.mark.kind === "local") {
      setLocallyRead((prev) => new Set(prev).add(step.id));
      toast.success("Marcado.");
      onDone?.();
      return;
    }

    const mark = readMark.mark;
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(mark.fields).forEach(([key, value]) => formData.set(key, value));
      const result = await mark.action({ error: null }, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Otimista: não espera a revalidação do servidor pra refletir na tela — quando ela
      // completar, `readMark.completed` também vira true, mas o usuário já vê o resultado agora.
      setLocallyRead((prev) => new Set(prev).add(step.id));
      toast.success("Marcado.");
      onDone?.();
    });
  }

  function handleAdvanceClick() {
    if (needsConfirm) {
      setDialogOpen(true);
      return;
    }
    goNext();
  }

  // Antes só aparecia com mais de 1 etapa, e "Avançar" virava um beco sem saída ao chegar na
  // última (desabilitado, sem alternativa nenhuma) — agora esta barra sempre existe quando a
  // etapa atual é a última, pra sempre sobrar um jeito de sair da aula (voltar ao curso ou seguir
  // pra próxima), mesmo numa aula de etapa única. Extraída de dentro do JSX principal pra poder
  // ser posicionada antes OU depois do conteúdo (current.navBeforeContent, ver comentário no tipo).
  const navBar = (steps.length > 1 || isLast) && (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      {steps.length > 1 ? (
        <Button type="button" variant="outline" disabled={isFirst} onClick={() => setIndex((value) => value - 1)}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </Button>
      ) : (
        <span />
      )}

      {steps.length > 1 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {index + 1}/{steps.length}
        </span>
      )}

      {isLast ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={courseHref}>Voltar ao curso</Link>
          </Button>
          {nextLessonHref && (
            <Button asChild>
              <Link href={nextLessonHref}>
                Próxima aula
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-end gap-1.5">
          <Button type="button" variant="outline" disabled={activityGateBlocked} onClick={handleAdvanceClick}>
            Avançar
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
          {activityGateBlocked && (
            <p className="text-xs text-muted-foreground">Marque todas as atividades como concluídas para avançar.</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div ref={flowRef} className="space-y-5 scroll-mt-20">
      {steps.length > 1 && (
        <div role="tablist" aria-label="Etapas da aula" className="flex items-center gap-1.5">
          {steps.map((step, i) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              title={step.kicker}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1 flex-1 rounded-full outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
                i < index && "bg-primary/50",
                i === index && "bg-primary",
                i > index && "bg-border hover:bg-ring",
              )}
            />
          ))}
        </div>
      )}

      {/* Atalho pra Atividades/Avaliação sem precisar clicar "Avançar" várias vezes — pedido desta
          sessão ("uma forma em que o aluno possa acessar diretamente as Atividades e o Quiz"). As
          abas acima já permitem pular etapa clicando, mas são finas demais pra serem óbvias; estes
          botões só aparecem quando a etapa existe e não é a atual. */}
      {(activityStepIndex >= 0 || quizStepIndex >= 0) && (
        <div className="flex flex-wrap gap-2">
          {activityStepIndex >= 0 && activityStepIndex !== index && (
            <Button type="button" variant="outline" size="sm" onClick={() => setIndex(activityStepIndex)}>
              <ListChecks className="size-3.5" aria-hidden="true" />
              Ir para Atividades
            </Button>
          )}
          {quizStepIndex >= 0 && quizStepIndex !== index && (
            <Button type="button" variant="outline" size="sm" onClick={() => setIndex(quizStepIndex)}>
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Ir para Avaliação
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-caps text-primary uppercase">
          {steps.length > 1 ? `Etapa ${index + 1} de ${steps.length} · ${current.kicker}` : current.kicker}
        </span>
        <ReadingPreferencesControl />
      </div>

      {/* Contato com o professor por etapa (pedido desta sessão) — nunca gate de conclusão, só
          um jeito de perguntar/reportar sem sair da aula. Ausente na etapa de doação (allowMessages
          false, ver buildDonationStep em page.tsx). */}
      {canMessage && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="relative" onClick={() => openMessageDialog("question")}>
            <MessageCircle className="size-3.5" aria-hidden="true" />
            {MESSAGE_TYPE_LABEL.question}
            {currentUnread > 0 && <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-primary" aria-hidden="true" />}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => openMessageDialog("correction")}>
            <Flag className="size-3.5" aria-hidden="true" />
            {MESSAGE_TYPE_LABEL.correction}
          </Button>
        </div>
      )}

      {/* key força remontagem completa ao trocar de etapa — evita qualquer estado local de um
          componente dentro do conteúdo (ex: formulário de quiz) vazar pra etapa seguinte. zoom
          (não uma classe text-lg) porque precisa escalar TUDO dentro do conteúdo — parágrafos,
          títulos, legendas de partitura — sem que cada bloco do page builder precise saber sobre
          essa preferência. */}
      {current.navBeforeContent && navBar}

      <div key={current.id} className="space-y-4" style={readingPrefsStyle(readingPrefs)}>
        {current.activityGate ? (
          <ActivityGateContext.Provider
            value={(activityId, complete) =>
              setActivityCompletion((prev) => (prev[activityId] === complete ? prev : { ...prev, [activityId]: complete }))
            }
          >
            {current.content}
          </ActivityGateContext.Provider>
        ) : (
          current.content
        )}

        {current.readMark &&
          (isCurrentRead ? (
            <div className="flex justify-center border-t border-border pt-5">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="size-4" aria-hidden="true" /> {current.readMark.doneLabel}
              </span>
            </div>
          ) : (
            <div className="flex justify-center border-t border-border pt-5">
              <Button type="button" size="lg" disabled={pending} onClick={() => performMark(current)}>
                {current.readMark.actionLabel}
              </Button>
            </div>
          ))}
      </div>

      {!current.navBeforeContent && navBar}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como lida?</DialogTitle>
            <DialogDescription>Você ainda não marcou esta leitura como concluída.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                goNext();
              }}
            >
              Avançar sem marcar
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                performMark(current, () => {
                  setDialogOpen(false);
                  goNext();
                })
              }
            >
              Marcar como lida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={messageType !== null} onOpenChange={(next) => !next && setMessageType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messageType ? MESSAGE_TYPE_LABEL[messageType] : ""}</DialogTitle>
            <DialogDescription>
              {messageType === "question"
                ? "Envie sua dúvida sobre esta etapa — o professor responde por aqui."
                : "Viu algo errado ou incompleto nesta etapa? Descreva o que encontrou."}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {messagePending && !messageLoaded ? (
              <p className="text-xs text-muted-foreground">Carregando…</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    message.senderRole === "student" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {message.body}
                </div>
              ))
            )}
          </div>

          <Textarea
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
            placeholder={messageType === "question" ? "Escreva sua dúvida…" : "Descreva o que está errado…"}
            className="min-h-20 text-sm"
          />

          <DialogFooter>
            <Button type="button" disabled={messagePending || messageBody.trim().length === 0} onClick={handleSendMessage}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
