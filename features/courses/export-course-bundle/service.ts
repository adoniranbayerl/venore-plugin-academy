import { extractEntryComposition, getEntry } from "@venore/plugin-sdk/cms";
import { remapCompositionMediaIds } from "@venore/plugin-sdk/import-export";
import { getMediaAsset, listCategories as listMediaCategories } from "@venore/plugin-sdk/media";
import type {
  LessonActivityRecord,
  LessonExampleRecord,
  LessonMaterialRecord,
  LessonRecord,
  LessonRequirementsRecord,
  LessonSectionRecord,
  QuizQuestionRecord,
} from "../../../contracts/types";
import {
  ACADEMY_COURSE_BUNDLE_FORMAT,
  ACADEMY_COURSE_BUNDLE_FORMAT_VERSION,
  type AcademyCourseBundleManifest,
  type ExportedLesson,
  type ExportedLessonMaterial,
  type ExportedLessonSection,
  type ExportedMediaAsset,
} from "../../../shared/course-bundle-manifest";
import { getLessonRequirements } from "../../lessons/get-lesson-requirements/service";
import { listLessonActivitiesByLesson } from "../../lessons/list-lesson-activities-by-lesson/service";
import { listLessonExamplesByLesson } from "../../lessons/list-lesson-examples-by-lesson/service";
import { listLessonMaterialsByLesson } from "../../lessons/list-lesson-materials-by-lesson/service";
import { listLessonsByCourse } from "../../lessons/list-lessons-by-course/service";
import { listQuizQuestionsByLesson } from "../../lessons/list-quiz-questions-by-lesson/service";
import { listLessonSectionsByLesson } from "../../lessons/sections/list-lesson-sections-by-lesson/service";
import { getCourse } from "../get-course/service";
import type { ExportCourseBundleAssetFile, ExportCourseBundleCommand, ExportCourseBundleResult } from "./types";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function downloadAssetBytes(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar mídia de "${url}" (HTTP ${response.status}).`);
  }
  return Buffer.from(await response.arrayBuffer());
}

type LessonDetail = {
  lesson: LessonRecord;
  sections: LessonSectionRecord[];
  materials: LessonMaterialRecord[];
  examples: LessonExampleRecord[];
  activities: LessonActivityRecord[];
  quizQuestions: QuizQuestionRecord[];
  requirements: LessonRequirementsRecord | null;
};

// Único ponto que sabe montar o pacote inteiro de um curso (manifest + bytes de mídia) —
// orquestra as outras features do próprio plugin via import relativo direto de service.ts (não
// via barrel: um plugin não se auto-importa pelo próprio index.ts, mesmo padrão de
// create-lesson-text-section/service.ts chamando ../create-lesson-section/service), mais os
// barrels públicos de cms/media (permitido — plugin pode importar barrel de outro context).
export async function exportCourseBundle(command: ExportCourseBundleCommand): Promise<ExportCourseBundleResult> {
  const courseResult = await getCourse({ id: command.courseId });
  if (!courseResult.success) return courseResult;
  const course = courseResult.data;
  if (!course) {
    return {
      success: false,
      error: { code: "academy.export-course-bundle.not_found", message: `Nenhum curso encontrado com id "${command.courseId}".` },
    };
  }

  const lessonsResult = await listLessonsByCourse({ courseId: course.id });
  if (!lessonsResult.success) return lessonsResult;

  const lessonDetails: LessonDetail[] = [];
  for (const lesson of lessonsResult.data) {
    const [sectionsResult, materialsResult, examplesResult, activitiesResult, quizQuestionsResult, requirementsResult] = await Promise.all([
      listLessonSectionsByLesson({ lessonId: lesson.id }),
      listLessonMaterialsByLesson({ lessonId: lesson.id }),
      listLessonExamplesByLesson({ lessonId: lesson.id }),
      listLessonActivitiesByLesson({ lessonId: lesson.id }),
      listQuizQuestionsByLesson({ lessonId: lesson.id }),
      getLessonRequirements({ lessonId: lesson.id }),
    ]);

    if (!sectionsResult.success) return sectionsResult;
    if (!materialsResult.success) return materialsResult;
    if (!examplesResult.success) return examplesResult;
    if (!activitiesResult.success) return activitiesResult;
    if (!quizQuestionsResult.success) return quizQuestionsResult;
    if (!requirementsResult.success) return requirementsResult;

    lessonDetails.push({
      lesson,
      sections: sectionsResult.data,
      materials: materialsResult.data,
      examples: examplesResult.data,
      activities: activitiesResult.data,
      quizQuestions: quizQuestionsResult.data,
      requirements: requirementsResult.data,
    });
  }

  // Seção de texto = cms entry oculta (ver contracts/types.ts LessonSectionRecord) — busca o
  // `data` bruto de cada uma pra depois extrair a composição e remapear mediaId.
  const sectionRawDataById = new Map<string, unknown | null>();
  for (const detail of lessonDetails) {
    for (const section of detail.sections) {
      if (!section.cmsEntryId) continue;
      const entryResult = await getEntry({ id: section.cmsEntryId });
      if (!entryResult.success) return entryResult;
      sectionRawDataById.set(section.id, entryResult.data ? entryResult.data.data : null);
    }
  }

  // Coleta todo mediaId referenciado (capa de curso/aula, material, exemplo, e o que estiver
  // embutido nas composições de seção) antes de saber o checksum de cada um — reaproveita
  // remapCompositionMediaIds com um resolver que só colhe o id via efeito colateral (identity),
  // evitando escrever um segundo walker de árvore de blocos.
  const mediaIds = new Set<string>();
  if (course.coverMediaId) mediaIds.add(course.coverMediaId);
  for (const detail of lessonDetails) {
    if (detail.lesson.coverMediaId) mediaIds.add(detail.lesson.coverMediaId);
    for (const material of detail.materials) mediaIds.add(material.mediaId);
    for (const example of detail.examples) {
      if (example.audioMediaId) mediaIds.add(example.audioMediaId);
      if (example.sheetMediaId) mediaIds.add(example.sheetMediaId);
    }
  }
  for (const rawData of sectionRawDataById.values()) {
    const composition = rawData ? extractEntryComposition(rawData) : null;
    if (composition) {
      remapCompositionMediaIds(composition, (mediaId) => {
        mediaIds.add(mediaId);
        return mediaId;
      });
    }
  }

  const mediaCategoriesResult = mediaIds.size > 0 ? await listMediaCategories() : null;
  if (mediaCategoriesResult && !mediaCategoriesResult.success) return mediaCategoriesResult;
  const mediaCategoryNameById = new Map((mediaCategoriesResult?.data ?? []).map((category) => [category.id, category.name]));

  const checksumByMediaAssetId = new Map<string, string>();
  const mediaAssets: ExportedMediaAsset[] = [];
  const files: ExportCourseBundleAssetFile[] = [];

  for (const mediaId of mediaIds) {
    const assetResult = await getMediaAsset({ id: mediaId });
    if (!assetResult.success) return assetResult;
    const asset = assetResult.data;
    if (!asset) continue; // referência órfã (mídia apagada) — vira null no manifest, sem travar o export

    const filePath = `assets/${asset.checksum}-${sanitizeFilename(asset.filename)}`;
    const data = await downloadAssetBytes(asset.url);
    files.push({ path: filePath, data });
    checksumByMediaAssetId.set(asset.id, asset.checksum);
    mediaAssets.push({
      ref: asset.checksum,
      filename: asset.filename,
      contentType: asset.contentType,
      size: asset.size,
      width: asset.width,
      height: asset.height,
      alt: asset.alt,
      checksum: asset.checksum,
      visibility: asset.visibility,
      categoryName: asset.categoryId ? (mediaCategoryNameById.get(asset.categoryId) ?? null) : null,
      file: filePath,
    });
  }

  function resolveMediaRef(mediaId: string | null): string | null {
    return mediaId ? (checksumByMediaAssetId.get(mediaId) ?? null) : null;
  }

  const lessons: ExportedLesson[] = lessonDetails.map((detail) => {
    const sections: ExportedLessonSection[] = detail.sections.map((section) => {
      const rawData = sectionRawDataById.get(section.id) ?? null;
      if (!rawData) {
        return { title: section.title, textData: null, videoUrl: section.videoUrl };
      }

      const composition = extractEntryComposition(rawData);
      const rawObject = typeof rawData === "object" ? (rawData as Record<string, unknown>) : {};
      const textData = composition ? { ...rawObject, blocks: remapCompositionMediaIds(composition, resolveMediaRef) } : rawObject;
      return { title: section.title, textData, videoUrl: section.videoUrl };
    });

    const materials: ExportedLessonMaterial[] = detail.materials
      .map((material) => ({ label: material.label, mediaRef: resolveMediaRef(material.mediaId) }))
      .filter((material): material is ExportedLessonMaterial => material.mediaRef !== null);

    return {
      title: detail.lesson.title,
      videoUrl: detail.lesson.videoUrl,
      coverMediaRef: resolveMediaRef(detail.lesson.coverMediaId),
      status: detail.lesson.status,
      sections,
      materials,
      examples: detail.examples.map((example) => ({
        title: example.title,
        audioMediaRef: resolveMediaRef(example.audioMediaId),
        sheetMediaRef: resolveMediaRef(example.sheetMediaId),
        notationData: example.notationData,
        captionText: example.captionText,
      })),
      activities: detail.activities.map((activity) => ({
        title: activity.title,
        instructionsText: activity.instructionsText,
        deliverableFormat: activity.deliverableFormat,
      })),
      quizQuestions: detail.quizQuestions.map((question) => ({
        text: question.text,
        options: question.options,
        correctOptionIndex: question.correctOptionIndex,
        // Só emite os campos de áudio quando a pergunta é de fato tipo áudio — assim uma pergunta
        // de texto comum sai exatamente `{ text, options, correctOptionIndex }` (compatível com
        // importadores antigos).
        ...(question.questionKind === "audio" ? { questionKind: "audio" as const } : {}),
        ...(question.promptNotation ? { promptNotation: question.promptNotation } : {}),
        ...(question.optionNotations ? { optionNotations: question.optionNotations } : {}),
      })),
      requirements: detail.requirements
        ? {
            readTextEnabled: detail.requirements.readTextEnabled,
            watchVideoEnabled: detail.requirements.watchVideoEnabled,
            quizEnabled: detail.requirements.quizEnabled,
            quizPassThresholdPercent: detail.requirements.quizPassThresholdPercent,
            quizMaxAttempts: detail.requirements.quizMaxAttempts,
            activityEnabled: detail.requirements.activityEnabled,
          }
        : null,
    };
  });

  const manifest: AcademyCourseBundleManifest = {
    format: ACADEMY_COURSE_BUNDLE_FORMAT,
    formatVersion: ACADEMY_COURSE_BUNDLE_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    course: {
      title: course.title,
      description: course.description,
      slug: course.slug,
      status: course.status,
      publiclyListed: course.publiclyListed,
      coverMediaRef: resolveMediaRef(course.coverMediaId),
      lessons,
    },
    mediaAssets,
  };

  return { success: true, data: { manifest, files } };
}
