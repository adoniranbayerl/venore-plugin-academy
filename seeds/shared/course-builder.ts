import { randomUUID } from "node:crypto";
import { updateEntry } from "@venore/plugin-sdk/cms";
import type { OperationResult } from "@venore/plugin-sdk";
import { compositionToAbc, type NotationComposition } from "../../components/notation-abc";
import { parseAbcToComposition } from "../../components/notation-abc-parse";
import { createCourse } from "../../features/courses/create-course/service";
import { listCourses } from "../../features/courses/list-courses/service";
import { publishCourse } from "../../features/courses/publish-course/service";
import { addLessonActivity } from "../../features/lessons/add-lesson-activity/service";
import { addLessonExample } from "../../features/lessons/add-lesson-example/service";
import { addQuizQuestion } from "../../features/lessons/add-quiz-question/service";
import { configureLessonRequirements } from "../../features/lessons/configure-lesson-requirements/service";
import { createLesson } from "../../features/lessons/create-lesson/service";
import { createLessonTextSection } from "../../features/lessons/sections/create-lesson-text-section/service";

// Helper compartilhado pelos seeds de curso (hoje só docs/curso-teoria-musical.md — os demais
// cursos entram por pacote de importação). Chama os SERVICES da Academy direto (sem sessão —
// actorId é rótulo de auditoria, mesmo racional de seeds/example.ts) e o handler `updateEntry` do
// CMS pra escrever o conteúdo de cada seção (o ator autenticado que dispara o seed via
// /admin/plugins precisa de `cms.entries.manage` — admin/superadmin têm).

// Um bloco extra dentro de uma seção, além do texto. "notation": vira um bloco
// `academy.notation.sheet` (o ABC é parseado pra tokens/tom/andamento/letra/vozes). "progression":
// vira um bloco `academy.progression`. "drum-grid": vira um bloco `academy.drum-grid` (preset de
// levada, ver blocks/drum-grid-patterns.ts).
export type SeedBlock =
  | { kind: "notation"; abc: string; caption?: string; allowSingAlong?: boolean }
  | { kind: "progression"; chords: string; key: string; bpm: number; beatsPerChord?: number; caption?: string }
  | { kind: "drum-grid"; style: string; bpm: number; bars?: number; caption?: string };

export type SeedSection = { title: string; markdown: string; blocks?: SeedBlock[] };
export type SeedQuiz = {
  text: string;
  options: string[];
  correctIndex: number;
  // Quando presente, a pergunta vira do tipo "audio" (treino de ouvido).
  promptAbc?: string;
  optionAbcs?: (string | null)[];
};
export type SeedActivity = { title: string; instructions: string; format: "none" | "text" | "audio" };
export type SeedExample = { title: string; caption: string; abc: string };
export type SeedLesson = {
  title: string;
  sections: SeedSection[];
  examples?: SeedExample[];
  quiz?: SeedQuiz[];
  activities?: SeedActivity[];
};

type SeedComposedBlock = {
  id: string;
  key: string;
  slot: string;
  data: Record<string, unknown>;
  areas: { key: string; blocks: SeedComposedBlock[] }[];
};

function block(key: string, data: Record<string, unknown>): SeedComposedBlock {
  return { id: randomUUID(), key, slot: "", data, areas: [] };
}

// `core.content.richtext` (e os blocos de leaf em geral) tem `allowedInRoot: false` — a composição
// de uma entry precisa de um contêiner na raiz. `core.layout.section` é o contêiner padrão do page
// builder e aceita richtext + blocos de plugin na área "content" (block-registry.ts,
// sectionNestableKeys). Sem isso o texto até é gravado, mas `getEntryComposition` (contracts/
// entry-body.ts) só extrai de `data.blocks`, e um re-save no /admin/cms builder seria recusado por
// validateComposition.
function sectionWrapper(children: SeedComposedBlock[]): SeedComposedBlock {
  return {
    id: randomUUID(),
    key: "core.layout.section",
    slot: "",
    data: { background: "none", maxWidth: "full", paddingY: "sm", paddingX: "sm", title: "", icon: "", titleAlign: "start" },
    areas: [{ key: "content", blocks: children }],
  };
}

function notationBlockData(abc: string, caption: string | undefined, allowSingAlong: boolean): Record<string, unknown> {
  const parsed = parseAbcToComposition(abc);
  const composition: NotationComposition =
    "error" in parsed
      ? { tokens: [], key: "C", timeSignature: "4/4", bpm: 90, showNoteNames: false }
      : parsed.composition;
  return {
    tokens: composition.tokens,
    key: composition.key,
    timeSignature: composition.timeSignature,
    bpm: composition.bpm,
    showNoteNames: composition.showNoteNames,
    lyrics: composition.lyrics ?? [],
    voices: composition.voices ?? [],
    caption: caption ?? "",
    allowSingAlong,
  };
}

// Retorna já no formato que a entry guarda: `{ blocks: Composition }` (contracts/entry-body.ts).
function sectionComposition(section: SeedSection): { blocks: SeedComposedBlock[] } {
  const children: SeedComposedBlock[] = [block("core.content.richtext", { content: section.markdown })];
  for (const extra of section.blocks ?? []) {
    if (extra.kind === "notation") {
      children.push(block("academy.notation.sheet", notationBlockData(extra.abc, extra.caption, extra.allowSingAlong ?? true)));
    } else if (extra.kind === "progression") {
      children.push(
        block("academy.progression", {
          chords: extra.chords,
          key: extra.key,
          bpm: extra.bpm,
          beatsPerChord: extra.beatsPerChord ?? 4,
          caption: extra.caption ?? "",
        }),
      );
    } else {
      children.push(
        block("academy.drum-grid", {
          style: extra.style,
          bpm: extra.bpm,
          bars: extra.bars ?? 2,
          caption: extra.caption ?? "",
        }),
      );
    }
  }
  return { blocks: [sectionWrapper(children)] };
}

export async function seedLesson(courseId: string, actorId: string, lesson: SeedLesson): Promise<OperationResult<void>> {
  const created = await createLesson({ courseId, title: lesson.title, actorId });
  if (!created.success) return created;
  const lessonId = created.data.id;

  for (const section of lesson.sections) {
    const sectionResult = await createLessonTextSection({ lessonId, title: section.title, actorId });
    if (!sectionResult.success) return sectionResult;
    if (sectionResult.data.cmsEntryId) {
      const updated = await updateEntry({ id: sectionResult.data.cmsEntryId, data: sectionComposition(section) });
      if (!updated.success) return updated;
    }
  }

  for (const example of lesson.examples ?? []) {
    const result = await addLessonExample({
      lessonId,
      title: example.title,
      captionText: example.caption,
      notationData: example.abc,
      actorId,
    });
    if (!result.success) return result;
  }

  for (const quiz of lesson.quiz ?? []) {
    const result = await addQuizQuestion({
      lessonId,
      text: quiz.text,
      options: quiz.options,
      correctOptionIndex: quiz.correctIndex,
      questionKind: quiz.promptAbc || quiz.optionAbcs ? "audio" : "text",
      promptNotation: quiz.promptAbc ?? null,
      optionNotations: quiz.optionAbcs ?? null,
      actorId,
    });
    if (!result.success) return result;
  }

  for (const activity of lesson.activities ?? []) {
    const result = await addLessonActivity({
      lessonId,
      title: activity.title,
      instructionsText: activity.instructions,
      deliverableFormat: activity.format,
      actorId,
    });
    if (!result.success) return result;
  }

  const hasQuiz = (lesson.quiz?.length ?? 0) > 0;
  const requirements = await configureLessonRequirements({
    lessonId,
    readTextEnabled: lesson.sections.length > 0,
    watchVideoEnabled: false,
    quizEnabled: hasQuiz,
    quizPassThresholdPercent: hasQuiz ? 70 : undefined,
    quizMaxAttempts: hasQuiz ? 3 : undefined,
    activityEnabled: (lesson.activities?.length ?? 0) > 0,
    actorId,
  });
  if (!requirements.success) return requirements;

  return { success: true, data: undefined };
}

// Cria o curso (rascunho), monta todas as aulas e publica como "public". Idempotente: pula se já
// existe um curso PUBLICADO com o mesmo slug/título. Um curso ainda "draft" com esse slug é
// resíduo de um seed que falhou no meio (ex: o ator não tinha `cms.entries.manage`) — apague pelo
// /admin/academy e rode de novo.
export async function runCourseSeed(
  config: { slug: string; title: string; description: string; actorId: string },
  lessons: SeedLesson[],
): Promise<OperationResult<void>> {
  const existing = await listCourses();
  if (!existing.success) return { success: false, error: existing.error };

  const alreadySeeded = existing.data.some(
    (course) => (course.slug === config.slug || course.title === config.title) && course.status !== "draft",
  );
  if (alreadySeeded) return { success: true, data: undefined };

  const course = await createCourse({
    title: config.title,
    description: config.description,
    slug: config.slug,
    publiclyListed: true,
    actorId: config.actorId,
  });
  if (!course.success) return { success: false, error: course.error };

  for (const lesson of lessons) {
    const result = await seedLesson(course.data.id, config.actorId, lesson);
    if (!result.success) return { success: false, error: result.error };
  }

  const published = await publishCourse({ id: course.data.id, status: "public", actorId: config.actorId });
  if (!published.success) return { success: false, error: published.error };

  return { success: true, data: undefined };
}

// `compositionToAbc` reexportado pros seeds montarem exemplos de partitura a partir de uma
// NotationComposition quando for mais fácil que escrever o ABC na mão.
export { compositionToAbc };
