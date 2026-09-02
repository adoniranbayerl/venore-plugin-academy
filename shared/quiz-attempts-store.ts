import { and, eq, isNull } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { quizAttempts } from "../database/schema";

export async function countActiveAttempts(lessonId: string, actorId: string): Promise<number> {
  const rows = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.lessonId, lessonId), eq(quizAttempts.actorId, actorId), isNull(quizAttempts.invalidatedAt)));

  return rows.length;
}

// Reset de professor: invalida em vez de apagar (auditoria). Só afeta tentativas ainda ativas —
// chamar de novo depois de já resetado não invalida nada extra.
export async function invalidateAttempts(lessonId: string, actorId: string): Promise<number> {
  const rows = await db
    .update(quizAttempts)
    .set({ invalidatedAt: new Date() })
    .where(and(eq(quizAttempts.lessonId, lessonId), eq(quizAttempts.actorId, actorId), isNull(quizAttempts.invalidatedAt)))
    .returning({ id: quizAttempts.id });
  return rows.length;
}
