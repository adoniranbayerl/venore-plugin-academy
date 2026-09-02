import { and, eq, inArray } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonMaterialCompletions, lessonRequirements, lessonSectionCompletions } from "../database/schema";
import type { LessonRequirementsRecord } from "../contracts/types";

export async function findLessonRequirements(lessonId: string): Promise<LessonRequirementsRecord | null> {
  const [row] = await db.select().from(lessonRequirements).where(eq(lessonRequirements.lessonId, lessonId)).limit(1);
  return (row as LessonRequirementsRecord) ?? null;
}

// Compartilhado entre mark-lesson-section-read (checar se TODAS as seções da aula já foram
// marcadas, pra cascatear em lessonTextCompletions) e list-lesson-sections-for-student (anotar
// `completed` por seção) — mesmo raciocínio de findContentTypeIdsForEntries no CMS: query
// batelada usada por mais de um use case não pertence ao store.ts de nenhum sozinho.
export async function findCompletedSectionIds(sectionIds: string[], actorId: string): Promise<Set<string>> {
  if (sectionIds.length === 0) return new Set();
  const rows = await db
    .select({ sectionId: lessonSectionCompletions.sectionId })
    .from(lessonSectionCompletions)
    .where(and(inArray(lessonSectionCompletions.sectionId, sectionIds), eq(lessonSectionCompletions.actorId, actorId)));
  return new Set(rows.map((row) => row.sectionId));
}

export async function insertSectionCompletionIfMissing(sectionId: string, actorId: string): Promise<void> {
  await db.insert(lessonSectionCompletions).values({ sectionId, actorId }).onConflictDoNothing();
}

export async function findCompletedMaterialIds(materialIds: string[], actorId: string): Promise<Set<string>> {
  if (materialIds.length === 0) return new Set();
  const rows = await db
    .select({ materialId: lessonMaterialCompletions.materialId })
    .from(lessonMaterialCompletions)
    .where(and(inArray(lessonMaterialCompletions.materialId, materialIds), eq(lessonMaterialCompletions.actorId, actorId)));
  return new Set(rows.map((row) => row.materialId));
}

export async function insertMaterialCompletionIfMissing(materialId: string, actorId: string): Promise<void> {
  await db.insert(lessonMaterialCompletions).values({ materialId, actorId }).onConflictDoNothing();
}
