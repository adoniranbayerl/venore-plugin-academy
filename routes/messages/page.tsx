import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { listMessageThreads } from "../../index";
import { getAcademyStudentPageData } from "../../student/get-academy-student-page-data";
import { Badge } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<"question" | "correction", string> = { question: "Dúvida", correction: "Correção" };

// Caixa de mensagens do aluno — todas as conversas, de qualquer curso, ordenadas por atividade
// recente (listMessageThreads sem lessonId = inbox inteira). Link vai direto pra etapa certa da
// aula, com o dialog de mensagem já aberto (?openThread=stepKey&openThreadType=type, lido por
// LessonStepFlow em .../[lessonId]/_components/lesson-step-flow.tsx) — pedido desta sessão: "eu
// preciso estar na etapa pra ver a resposta do professor... encaminhe diretamente para a página e
// abra a mensagem". Reverte a simplificação de uma sessão anterior (deep-link ficava de fora).
export default async function AcademyMessagesPage() {
  const gate = await getAcademyStudentPageData();

  if (!gate.granted && gate.reason === "plugin_disabled") {
    notFound();
  }
  if (!gate.granted) {
    redirect("/api/auth/signin");
  }

  const threadsResult = await listMessageThreads({});
  if (!threadsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar mensagens: {threadsResult.error.message}</p>;
  }

  const threads = threadsResult.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Mensagens</h1>
        <p className="mt-1 text-sm text-muted-foreground">Suas conversas com os professores, por aula.</p>
      </div>

      {threads.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-8" strokeWidth={1.5} />}
          title="Nenhuma conversa ainda"
          description="Use os botões “Tirar dúvida” ou “Viu algo errado?” em qualquer etapa de uma aula para começar."
        />
      ) : (
        <div className="overflow-hidden rounded-panel border border-border">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/academy/${thread.courseSlug}/${thread.lessonId}?openThread=${thread.stepKey}&openThreadType=${thread.type}`}
              className="group flex items-center gap-3.5 border-b border-border px-4 py-3.5 outline-none ui-motion-base last:border-b-0 hover:bg-muted/60 focus-visible:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {thread.courseTitle} — Aula {thread.lessonPosition}: {thread.lessonTitle}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{thread.stepLabel}</span>
                  <Badge variant="secondary">{TYPE_LABEL[thread.type]}</Badge>
                </div>
              </div>
              {thread.unreadCount > 0 && <Badge>{thread.unreadCount} nova{thread.unreadCount > 1 ? "s" : ""}</Badge>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
