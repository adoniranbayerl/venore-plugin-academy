import { MessageCircle } from "lucide-react";
import { listAllMessageThreads } from "../../index";
import { listUsers } from "@venore/plugin-sdk/auth";
import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import { AdminAccessDenied } from "@venore/plugin-sdk/ui";
import { AdminPageHeader } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { MessageThreadPanel } from "../admin-course-enrolled-student/_components/message-thread-panel";

export const dynamic = "force-dynamic";

// Página dedicada de mensagens do professor (pedido desta sessão: "talvez seja bom ter uma página
// específica com todas as mensagens, também com um alerta") — todas as conversas de todos os
// cursos/alunos, reaproveitando MessageThreadPanel (responder inline) da página por aluno em vez
// de duplicar o painel de conversa. usersById resolve nome/e-mail do aluno pra exibição —
// LessonMessageThreadWithContext só carrega studentActorId, sem nome (listAllMessageThreads não é
// escopada a um curso/aluno, então não reaproveita o join de listEnrollmentsForCourse).
export default async function AcademyMessagesAdminPage() {
  const gate = await getPluginAdminPageData("academy");

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para gerenciar a Academy." />;
  }

  const [threadsResult, usersResult] = await Promise.all([listAllMessageThreads(), listUsers()]);
  if (!threadsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar mensagens: {threadsResult.error.message}</p>;
  }

  const usersById = new Map((usersResult.success ? usersResult.data : []).map((user) => [user.id, user]));
  const threads = threadsResult.data;

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Mensagens" description="Todas as conversas com alunos, de todos os cursos." />

      {threads.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-8" strokeWidth={1.5} />}
          title="Nenhuma conversa ainda"
          description="Assim que um aluno tirar uma dúvida ou reportar algo numa aula, a conversa aparece aqui."
        />
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => {
            const student = usersById.get(thread.studentActorId);
            const studentLabel = student?.name ?? student?.email ?? thread.studentActorId;
            return (
              <MessageThreadPanel
                key={thread.id}
                threadId={thread.id}
                lessonId={thread.lessonId}
                stepKey={thread.stepKey}
                studentActorId={thread.studentActorId}
                courseId={thread.courseId}
                title={`${studentLabel} — ${thread.courseTitle} · Aula ${thread.lessonPosition}: ${thread.lessonTitle} — ${thread.stepLabel}`}
                type={thread.type}
                unreadCount={thread.unreadCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
