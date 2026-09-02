import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses, lessonMessages, lessonMessageThreads, lessons, lessonSections } from "../database/schema";
import type {
  LessonMessageRecord,
  LessonMessageSenderRole,
  LessonMessageThreadRecord,
  LessonMessageThreadType,
} from "../contracts/types";

// Chaves fixas do client (LessonFlowStep.id em lesson-step-flow.tsx) — "text-fallback"/"donation"
// de propósito fora daqui (ver comentário em database/schema/index.ts). Qualquer outra string só
// é válida se for de fato um lessonSections.id da própria aula. Rótulos espelham os `kicker` dos
// mesmos steps em .../[courseSlug]/[lessonId]/page.tsx — acoplamento manual, pequeno o bastante
// pra não justificar extrair uma constante compartilhada entre app/ e plugins/.
const FIXED_STEP_LABELS: Record<string, string> = {
  video: "Vídeo",
  materials: "Material complementar",
  examples: "Exemplo sonoro",
  activity: "Atividade prática",
  quiz: "Avaliação",
};
const FIXED_STEP_KEYS = new Set(Object.keys(FIXED_STEP_LABELS));

export async function isValidStepKey(lessonId: string, stepKey: string): Promise<boolean> {
  if (FIXED_STEP_KEYS.has(stepKey)) return true;
  const [row] = await db
    .select({ id: lessonSections.id })
    .from(lessonSections)
    .where(and(eq(lessonSections.id, stepKey), eq(lessonSections.lessonId, lessonId)))
    .limit(1);
  return row !== undefined;
}

export async function findThreadByKey(
  lessonId: string,
  stepKey: string,
  studentActorId: string,
): Promise<LessonMessageThreadRecord | null> {
  const [row] = await db
    .select()
    .from(lessonMessageThreads)
    .where(
      and(
        eq(lessonMessageThreads.lessonId, lessonId),
        eq(lessonMessageThreads.stepKey, stepKey),
        eq(lessonMessageThreads.studentActorId, studentActorId),
      ),
    )
    .limit(1);
  return (row as LessonMessageThreadRecord) ?? null;
}

export async function findThreadById(id: string): Promise<LessonMessageThreadRecord | null> {
  const [row] = await db.select().from(lessonMessageThreads).where(eq(lessonMessageThreads.id, id)).limit(1);
  return (row as LessonMessageThreadRecord) ?? null;
}

// find-or-create pelo índice único (lessonId, stepKey, studentActorId) — os dois botões do aluno
// ("tirar dúvida"/"viu algo errado") e a resposta do professor caem aqui igual: se a conversa já
// existe, reaproveita (type não muda depois de criada, ver contracts/types.ts); só cria com o
// `type` pedido quando ainda não existe nenhuma.
export async function findOrCreateThread(input: {
  lessonId: string;
  stepKey: string;
  studentActorId: string;
  type: LessonMessageThreadType;
}): Promise<LessonMessageThreadRecord> {
  const existing = await findThreadByKey(input.lessonId, input.stepKey, input.studentActorId);
  if (existing) return existing;

  const [row] = await db
    .insert(lessonMessageThreads)
    .values({ lessonId: input.lessonId, stepKey: input.stepKey, studentActorId: input.studentActorId, type: input.type })
    .onConflictDoNothing()
    .returning();
  if (row) return row as LessonMessageThreadRecord;

  // Corrida rara (dois cliques quase simultâneos criando a mesma conversa) — onConflictDoNothing
  // não devolve linha nesse caso, busca de novo pra pegar a que o outro request criou primeiro.
  const raced = await findThreadByKey(input.lessonId, input.stepKey, input.studentActorId);
  if (!raced) throw new Error(`Falha ao criar ou encontrar lesson_message_thread (${input.lessonId}, ${input.stepKey}, ${input.studentActorId}).`);
  return raced;
}

export async function insertMessage(input: {
  threadId: string;
  senderRole: LessonMessageSenderRole;
  senderActorId: string;
  body: string;
}): Promise<LessonMessageRecord> {
  return db.transaction(async (tx) => {
    const [message] = await tx
      .insert(lessonMessages)
      .values({ threadId: input.threadId, senderRole: input.senderRole, senderActorId: input.senderActorId, body: input.body })
      .returning();
    await tx.update(lessonMessageThreads).set({ lastMessageAt: message.createdAt }).where(eq(lessonMessageThreads.id, input.threadId));
    return message as LessonMessageRecord;
  });
}

export async function findMessagesByThread(threadId: string): Promise<LessonMessageRecord[]> {
  const rows = await db.select().from(lessonMessages).where(eq(lessonMessages.threadId, threadId)).orderBy(lessonMessages.createdAt);
  return rows as LessonMessageRecord[];
}

export type LessonMessageThreadWithContext = LessonMessageThreadRecord & {
  lessonTitle: string;
  lessonPosition: number;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  // Rótulo pra exibição — nome da seção quando stepKey é um lessonSections.id real, senão o
  // rótulo fixo (FIXED_STEP_LABELS acima).
  stepLabel: string;
  unreadCount: number;
};

function resolveStepLabel(stepKey: string, sectionTitle: string | null): string {
  return sectionTitle ?? FIXED_STEP_LABELS[stepKey] ?? stepKey;
}

async function countUnreadMessagesByThread(threadIds: string[], unreadFromRole: LessonMessageSenderRole): Promise<Map<string, number>> {
  if (threadIds.length === 0) return new Map();
  const rows = await db
    .select({ threadId: lessonMessages.threadId, value: count() })
    .from(lessonMessages)
    .where(and(inArray(lessonMessages.threadId, threadIds), eq(lessonMessages.senderRole, unreadFromRole), isNull(lessonMessages.readAt)))
    .groupBy(lessonMessages.threadId);
  return new Map(rows.map((row) => [row.threadId, row.value]));
}

// Inbox do aluno — todas as conversas dele (cross-curso quando opts.lessonId ausente, pra
// /academy/messages), com contagem de não-lida a partir das mensagens do PROFESSOR (é isso que o
// aluno precisa saber que chegou). opts.lessonId estreita pra uma aula só — usado pela própria
// aula pra acender o pontinho de não-lida por etapa sem uma segunda ida ao banco por etapa.
export async function findThreadsByStudent(
  studentActorId: string,
  opts?: { lessonId?: string },
): Promise<LessonMessageThreadWithContext[]> {
  const conditions = [eq(lessonMessageThreads.studentActorId, studentActorId)];
  if (opts?.lessonId) conditions.push(eq(lessonMessageThreads.lessonId, opts.lessonId));

  const rows = await db
    .select({
      thread: lessonMessageThreads,
      lessonTitle: lessons.title,
      lessonPosition: lessons.position,
      courseId: courses.id,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      sectionTitle: lessonSections.title,
    })
    .from(lessonMessageThreads)
    .innerJoin(lessons, eq(lessonMessageThreads.lessonId, lessons.id))
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .leftJoin(lessonSections, eq(lessonMessageThreads.stepKey, lessonSections.id))
    .where(and(...conditions))
    .orderBy(desc(lessonMessageThreads.lastMessageAt));

  const unreadByThread = await countUnreadMessagesByThread(
    rows.map((row) => row.thread.id),
    "teacher",
  );

  return rows.map((row) => ({
    ...(row.thread as LessonMessageThreadRecord),
    lessonTitle: row.lessonTitle,
    lessonPosition: row.lessonPosition,
    courseId: row.courseId,
    courseTitle: row.courseTitle,
    courseSlug: row.courseSlug,
    stepLabel: resolveStepLabel(row.thread.stepKey, row.sectionTitle),
    unreadCount: unreadByThread.get(row.thread.id) ?? 0,
  }));
}

// Página do professor por aluno — todas as conversas de UM aluno num curso, com contagem de
// não-lida a partir das mensagens do ALUNO (é isso que o professor precisa saber que chegou).
export async function findThreadsByCourseAndStudent(
  courseId: string,
  studentActorId: string,
): Promise<LessonMessageThreadWithContext[]> {
  const rows = await db
    .select({
      thread: lessonMessageThreads,
      lessonTitle: lessons.title,
      lessonPosition: lessons.position,
      courseId: courses.id,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      sectionTitle: lessonSections.title,
    })
    .from(lessonMessageThreads)
    .innerJoin(lessons, eq(lessonMessageThreads.lessonId, lessons.id))
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .leftJoin(lessonSections, eq(lessonMessageThreads.stepKey, lessonSections.id))
    .where(and(eq(lessons.courseId, courseId), eq(lessonMessageThreads.studentActorId, studentActorId)))
    .orderBy(desc(lessonMessageThreads.lastMessageAt));

  const unreadByThread = await countUnreadMessagesByThread(
    rows.map((row) => row.thread.id),
    "student",
  );

  return rows.map((row) => ({
    ...(row.thread as LessonMessageThreadRecord),
    lessonTitle: row.lessonTitle,
    lessonPosition: row.lessonPosition,
    courseId: row.courseId,
    courseTitle: row.courseTitle,
    courseSlug: row.courseSlug,
    stepLabel: resolveStepLabel(row.thread.stepKey, row.sectionTitle),
    unreadCount: unreadByThread.get(row.thread.id) ?? 0,
  }));
}

// Página dedicada de mensagens do professor (pedido desta sessão: "talvez seja bom ter uma página
// específica com todas as mensagens") — todas as conversas de TODOS os cursos/alunos, sem filtro,
// com contagem de não-lida a partir do ALUNO (mesmo critério de findThreadsByCourseAndStudent:
// professor precisa saber o que chegou dele). Também alimenta o alerta do header (get-message-alert)
// pro papel de professor — qualquer ator com academy.courses.manage vê tudo, sem filtrar por
// "curso que ele criou" (mesma regra de list-message-threads-for-course/handler.ts).
export async function findAllThreads(): Promise<LessonMessageThreadWithContext[]> {
  const rows = await db
    .select({
      thread: lessonMessageThreads,
      lessonTitle: lessons.title,
      lessonPosition: lessons.position,
      courseId: courses.id,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      sectionTitle: lessonSections.title,
    })
    .from(lessonMessageThreads)
    .innerJoin(lessons, eq(lessonMessageThreads.lessonId, lessons.id))
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .leftJoin(lessonSections, eq(lessonMessageThreads.stepKey, lessonSections.id))
    .orderBy(desc(lessonMessageThreads.lastMessageAt));

  const unreadByThread = await countUnreadMessagesByThread(
    rows.map((row) => row.thread.id),
    "student",
  );

  return rows.map((row) => ({
    ...(row.thread as LessonMessageThreadRecord),
    lessonTitle: row.lessonTitle,
    lessonPosition: row.lessonPosition,
    courseId: row.courseId,
    courseTitle: row.courseTitle,
    courseSlug: row.courseSlug,
    stepLabel: resolveStepLabel(row.thread.stepKey, row.sectionTitle),
    unreadCount: unreadByThread.get(row.thread.id) ?? 0,
  }));
}

// Marcada por quem NÃO enviou — professor abrindo a conversa lê as mensagens do aluno, aluno
// abrindo lê as do professor (mesmo raciocínio do comentário em database/schema/index.ts).
export async function markMessagesRead(threadId: string, viewerRole: LessonMessageSenderRole): Promise<void> {
  const otherRole: LessonMessageSenderRole = viewerRole === "student" ? "teacher" : "student";
  await db
    .update(lessonMessages)
    .set({ readAt: new Date() })
    .where(and(eq(lessonMessages.threadId, threadId), eq(lessonMessages.senderRole, otherRole), isNull(lessonMessages.readAt)));
}
