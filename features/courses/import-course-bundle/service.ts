import { randomUUID } from "node:crypto";
import { createEntry, extractEntryComposition, getOrCreateReservedContentType } from "@venore/plugin-sdk/cms";
import { remapCompositionMediaIds, type ImportReportOutcome } from "@venore/plugin-sdk/import-export";
import { listCategories as listMediaCategories, listMediaAssets, uploadMediaAsset } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { academyCourseBundleManifestSchema, type ExportedLesson } from "../../../shared/course-bundle-manifest";
import { validateQuizAudioShape } from "../../../shared/quiz-audio";
import { addLessonActivity } from "../../lessons/add-lesson-activity/service";
import { addLessonExample } from "../../lessons/add-lesson-example/service";
import { addLessonMaterial } from "../../lessons/add-lesson-material/service";
import { addQuizQuestion } from "../../lessons/add-quiz-question/service";
import { configureLessonRequirements } from "../../lessons/configure-lesson-requirements/service";
import { createLesson } from "../../lessons/create-lesson/service";
import { createLessonSectionService } from "../../lessons/sections/create-lesson-section/service";
import { setLessonStatus } from "../../lessons/set-lesson-status/service";
import { createCourse } from "../create-course/service";
import { listCourses } from "../list-courses/service";
import { publishCourse } from "../publish-course/service";
import type {
  AcademyImportReport,
  AcademyImportReportLine,
  AcademyImportReportLineKind,
  ImportCourseBundleCommand,
  ImportCourseBundleResult,
} from "./types";

// Mesma cms entry reservada que create-lesson-text-section/service.ts usa pra seção de texto —
// getOrCreateReservedContentType é idempotente por key, então repetir a constante aqui não cria
// uma segunda tag "academy" solta, só reaproveita a existente.
const ACADEMY_CONTENT_TYPE_KEY = "academy";
const ACADEMY_CONTENT_TYPE_NAME = "Academy (interno)";

const DEFAULT_LESSON_STATUS = "restricted";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function buildReport(lines: AcademyImportReportLine[]): AcademyImportReport {
  return {
    lines,
    createdCount: lines.filter((line) => line.outcome === "created").length,
    reusedCount: lines.filter((line) => line.outcome === "reused").length,
    skippedCount: lines.filter((line) => line.outcome === "skipped").length,
    failedCount: lines.filter((line) => line.outcome === "failed").length,
  };
}

// Único ponto que sabe gravar o pacote inteiro (mídia + curso + aulas) no destino — orquestra as
// outras features do próprio plugin via import relativo direto de service.ts (mesmo padrão de
// create-lesson-text-section/service.ts), mais os barrels públicos de cms/media. Curso é a
// unidade atômica de dedupe (ver plano da sessão): se já existe um curso com o mesmo slug, o
// import inteiro é pulado — nunca mescla aula dentro de um curso existente. Dentro de um curso
// novo, best-effort por aula (uma aula ruim não trava as outras).
export async function importCourseBundle(command: ImportCourseBundleCommand): Promise<ImportCourseBundleResult> {
  const parsed = academyCourseBundleManifestSchema.safeParse(command.manifest);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "academy.import-course-bundle.invalid_manifest",
        message: "O manifest.json do pacote não tem o formato esperado (ou é de uma versão incompatível).",
      },
    };
  }
  const manifest = parsed.data;

  const handle = beginOperation({
    useCase: "academy.import-course-bundle",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lines: AcademyImportReportLine[] = [];
  function record(kind: AcademyImportReportLineKind, ref: string, outcome: ImportReportOutcome, message?: string): void {
    lines.push({ kind, ref, outcome, message });
  }

  const existingCoursesResult = await listCourses();
  if (!existingCoursesResult.success) {
    endOperation(handle, existingCoursesResult);
    return existingCoursesResult;
  }
  if (existingCoursesResult.data.some((course) => course.slug === manifest.course.slug)) {
    record("course", manifest.course.slug, "skipped", "Já existe um curso com este slug no destino — nenhuma aula foi importada.");
    const report = buildReport(lines);
    endOperation(handle, { success: true });
    return { success: true, data: report };
  }

  // ---- Mídia primeiro (dependência de tudo mais) ---------------------------------------------
  const [existingMediaAssetsResult, existingMediaCategoriesResult] = await Promise.all([listMediaAssets({}), listMediaCategories()]);
  if (!existingMediaAssetsResult.success) {
    endOperation(handle, existingMediaAssetsResult);
    return existingMediaAssetsResult;
  }
  if (!existingMediaCategoriesResult.success) {
    endOperation(handle, existingMediaCategoriesResult);
    return existingMediaCategoriesResult;
  }

  const mediaIdByChecksum = new Map(existingMediaAssetsResult.data.map((asset) => [asset.checksum, asset.id]));
  const mediaCategoryIdByName = new Map(existingMediaCategoriesResult.data.map((category) => [category.name, category.id]));

  for (const asset of manifest.mediaAssets) {
    if (mediaIdByChecksum.has(asset.checksum)) {
      record("media-asset", asset.ref, "reused", "Já existe um arquivo idêntico (mesmo checksum) no destino — reaproveitado.");
      continue;
    }

    const bytes = command.files.get(asset.file);
    if (!bytes) {
      record("media-asset", asset.ref, "failed", `Arquivo "${asset.file}" não encontrado dentro do pacote.`);
      continue;
    }

    try {
      const uploaded = await uploadMediaAsset({
        filename: asset.filename,
        contentType: asset.contentType,
        size: bytes.byteLength,
        data: bytes,
        visibility: asset.visibility,
        categoryId: asset.categoryName ? mediaCategoryIdByName.get(asset.categoryName) : undefined,
      });
      if (!uploaded.success) {
        record("media-asset", asset.ref, "failed", uploaded.error.message);
        continue;
      }
      mediaIdByChecksum.set(asset.checksum, uploaded.data.id);
      record("media-asset", asset.ref, "created");
    } catch (error) {
      record("media-asset", asset.ref, "failed", errorMessage(error));
    }
  }

  function resolveMediaId(mediaRef: string | null): string | undefined {
    return mediaRef ? mediaIdByChecksum.get(mediaRef) : undefined;
  }

  // ---- Curso ------------------------------------------------------------------------------------
  const createdCourseResult = await createCourse({
    title: manifest.course.title,
    description: manifest.course.description ?? undefined,
    slug: manifest.course.slug,
    publiclyListed: manifest.course.publiclyListed,
    coverMediaId: resolveMediaId(manifest.course.coverMediaRef),
    actorId: command.actorId,
  });

  if (!createdCourseResult.success) {
    record("course", manifest.course.slug, "failed", createdCourseResult.error.message);
    const report = buildReport(lines);
    endOperation(handle, { success: true });
    return { success: true, data: report };
  }

  const courseId = createdCourseResult.data.id;

  // ---- Aulas (best-effort — uma aula ruim não trava as outras) --------------------------------
  for (const lesson of manifest.course.lessons) {
    await importLesson({ courseId, lesson, actorId: command.actorId, resolveMediaId, record });
  }

  // ---- Status do curso (reaplicado depois de importar as aulas, mesmo padrão de publishEntry
  // ser chamado depois de createEntry em import-site-bundle/service.ts) -------------------------
  let courseNote: string | undefined;
  if (manifest.course.status !== "draft") {
    const published = await publishCourse({ id: courseId, status: manifest.course.status, actorId: command.actorId });
    if (!published.success) {
      courseNote = `Criado como rascunho — falha ao aplicar status "${manifest.course.status}": ${published.error.message}`;
    }
  }
  lines.unshift({ kind: "course", ref: manifest.course.slug, outcome: "created", message: courseNote });

  const report = buildReport(lines);
  endOperation(handle, { success: true });
  return { success: true, data: report };
}

type ImportLessonArgs = {
  courseId: string;
  lesson: ExportedLesson;
  actorId: string;
  resolveMediaId: (mediaRef: string | null) => string | undefined;
  record: (kind: AcademyImportReportLineKind, ref: string, outcome: ImportReportOutcome, message?: string) => void;
};

async function importLesson({ courseId, lesson, actorId, resolveMediaId, record }: ImportLessonArgs): Promise<void> {
  const createdLessonResult = await createLesson({
    courseId,
    title: lesson.title,
    videoUrl: lesson.videoUrl ?? undefined,
    coverMediaId: resolveMediaId(lesson.coverMediaRef),
    actorId,
  });

  if (!createdLessonResult.success) {
    record("lesson", lesson.title, "failed", createdLessonResult.error.message);
    return;
  }

  const lessonId = createdLessonResult.data.id;
  const notes: string[] = [];

  if (lesson.status !== DEFAULT_LESSON_STATUS) {
    const statusResult = await setLessonStatus({ id: lessonId, status: lesson.status, actorId });
    if (!statusResult.success) notes.push(`Falha ao aplicar status "${lesson.status}": ${statusResult.error.message}`);
  }

  for (const section of lesson.sections) {
    if (section.textData !== null) {
      const composition = extractEntryComposition(section.textData);
      const rawObject = typeof section.textData === "object" ? (section.textData as Record<string, unknown>) : {};
      const data = composition ? { ...rawObject, blocks: remapCompositionMediaIds(composition, (ref) => resolveMediaId(ref) ?? null) } : rawObject;

      const contentType = await getOrCreateReservedContentType(ACADEMY_CONTENT_TYPE_KEY, ACADEMY_CONTENT_TYPE_NAME);
      const entryResult = await createEntry({
        contentTypeIds: [contentType.id],
        title: section.title,
        slug: `academy-section-${randomUUID()}`,
        internalOwner: "academy",
        data,
      });
      if (!entryResult.success) {
        notes.push(`Seção "${section.title}": falha ao criar conteúdo — ${entryResult.error.message}`);
        continue;
      }

      const sectionResult = await createLessonSectionService({ lessonId, title: section.title, cmsEntryId: entryResult.data.id, actorId });
      if (!sectionResult.success) notes.push(`Seção "${section.title}": ${sectionResult.error.message}`);
      continue;
    }

    if (section.videoUrl) {
      const sectionResult = await createLessonSectionService({ lessonId, title: section.title, videoUrl: section.videoUrl, actorId });
      if (!sectionResult.success) notes.push(`Seção "${section.title}": ${sectionResult.error.message}`);
    }
  }

  for (const material of lesson.materials) {
    const mediaId = resolveMediaId(material.mediaRef);
    if (!mediaId) {
      notes.push(`Material "${material.label}": arquivo de mídia não disponível no destino.`);
      continue;
    }
    const materialResult = await addLessonMaterial({ lessonId, mediaId, label: material.label, actorId });
    if (!materialResult.success) notes.push(`Material "${material.label}": ${materialResult.error.message}`);
  }

  for (const example of lesson.examples) {
    const exampleResult = await addLessonExample({
      lessonId,
      title: example.title,
      audioMediaId: resolveMediaId(example.audioMediaRef),
      sheetMediaId: resolveMediaId(example.sheetMediaRef),
      notationData: example.notationData ?? undefined,
      captionText: example.captionText,
      actorId,
    });
    if (!exampleResult.success) notes.push(`Exemplo "${example.title}": ${exampleResult.error.message}`);
  }

  for (const activity of lesson.activities) {
    const activityResult = await addLessonActivity({
      lessonId,
      title: activity.title,
      instructionsText: activity.instructionsText,
      deliverableFormat: activity.deliverableFormat,
      actorId,
    });
    if (!activityResult.success) notes.push(`Atividade "${activity.title}": ${activityResult.error.message}`);
  }

  for (const question of lesson.quizQuestions) {
    const questionKind = question.questionKind ?? "text";
    const promptNotation = question.promptNotation ?? null;
    const optionNotations = question.optionNotations ?? null;

    // Mesma checagem de forma que o handler de add-quiz-question faz (a rota de import chama o
    // service direto, então precisa validar aqui) — pega um pacote com quiz de áudio malformado
    // e reporta por pergunta em vez de gravar algo quebrado.
    const audioError = validateQuizAudioShape({ questionKind, options: question.options, optionNotations, promptNotation });
    if (audioError) {
      notes.push(`Pergunta "${question.text}": ${audioError.message}`);
      continue;
    }

    const questionResult = await addQuizQuestion({
      lessonId,
      text: question.text,
      options: question.options,
      correctOptionIndex: question.correctOptionIndex,
      questionKind,
      promptNotation,
      optionNotations,
      actorId,
    });
    if (!questionResult.success) notes.push(`Pergunta "${question.text}": ${questionResult.error.message}`);
  }

  // Requisitos por último: activityEnabled/quizEnabled exigem que já existam atividades/perguntas
  // na lesson, então isto só pode rodar depois dos loops de seções, exemplos, atividades e quiz.
  if (lesson.requirements) {
    const requirementsResult = await configureLessonRequirements({
      lessonId,
      readTextEnabled: lesson.requirements.readTextEnabled,
      watchVideoEnabled: lesson.requirements.watchVideoEnabled,
      quizEnabled: lesson.requirements.quizEnabled,
      quizPassThresholdPercent: lesson.requirements.quizPassThresholdPercent ?? undefined,
      quizMaxAttempts: lesson.requirements.quizMaxAttempts ?? undefined,
      activityEnabled: lesson.requirements.activityEnabled,
      actorId,
    });
    if (!requirementsResult.success) notes.push(`Falha ao configurar requisitos: ${requirementsResult.error.message}`);
  }

  record("lesson", lesson.title, "created", notes.length > 0 ? notes.join(" ") : undefined);
}
