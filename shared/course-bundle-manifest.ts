import { z } from "zod";
import type { MediaVisibility } from "@venore/plugin-sdk/media";
import type { CourseStatus, DeliverableFormat, LessonStatus } from "../contracts/types";

// Formato do pacote de export/import de curso da Academy — mesma ideia de
// contexts/import-export/contracts/types.ts (IMPORT_EXPORT_FORMAT/_VERSION), versão própria
// porque o shape não tem nada a ver com o pacote de CMS+mídia daquele context (árvore
// curso→aula→seção, não listas planas com ref cruzado — ver plano da sessão). Só muda quando o
// SHAPE do manifest quebra leitura por um importador de versão anterior.
export const ACADEMY_COURSE_BUNDLE_FORMAT = "venore-academy-course";
export const ACADEMY_COURSE_BUNDLE_FORMAT_VERSION = 1;

// Gate AND (não OR de authorizeActor) dos dois handlers de export-course-bundle/import-course-
// bundle — mesmo raciocínio de IMPORT_EXPORT_REQUIRED_PERMISSIONS em contexts/import-export:
// media.manage porque o pacote lê/grava bytes de mídia, que academy.courses.manage sozinho não
// autoriza.
export const ACADEMY_COURSE_BUNDLE_REQUIRED_PERMISSIONS = ["academy.courses.manage", "media.manage"] as const;

// Toda referência de mídia é por checksum (sha256 do conteúdo), nunca id de banco — mesma
// convenção de ExportedMediaAsset.ref em contexts/import-export, id não sobrevive a uma
// exportação pra outra instalação.
export type ExportedMediaAsset = {
  ref: string;
  filename: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  checksum: string;
  visibility: MediaVisibility;
  categoryName: string | null;
  // Caminho do arquivo dentro do zip (assets/<checksum>-<filename sanitizado>).
  file: string;
};

// textData é o `data` bruto da cms entry por trás da seção (extractEntryComposition sabe ler a
// composição de dentro dele), com todo `mediaId` de bloco reescrito pro checksum do asset — nunca
// o cmsEntryId original, que não sobrevive fora desta instalação. null quando a seção é só vídeo.
export type ExportedLessonSection = { title: string; textData: unknown | null; videoUrl: string | null };

export type ExportedLessonMaterial = { label: string; mediaRef: string };

export type ExportedLessonExample = {
  title: string;
  audioMediaRef: string | null;
  sheetMediaRef: string | null;
  notationData: string | null;
  captionText: string;
};

export type ExportedLessonActivity = { title: string; instructionsText: string; deliverableFormat: DeliverableFormat };

export type ExportedQuizQuestion = {
  text: string;
  options: string[];
  correctOptionIndex: number;
  // Pergunta tipo áudio (treino de ouvido). Ausente = "text" (pergunta comum). Ver
  // contracts/types.ts QuizQuestionKind. Campos opcionais de propósito — um pacote de versão
  // anterior (sem eles) importa como pergunta de texto normal, sem quebrar.
  questionKind?: "text" | "audio";
  // ABC do enunciado ("ouça isto") — só faz sentido em questionKind "audio".
  promptNotation?: string | null;
  // Array paralelo a `options` (mesmo comprimento) — ABC tocável por opção, null pra opção
  // só-texto.
  optionNotations?: (string | null)[] | null;
};

export type ExportedLessonRequirements = {
  readTextEnabled: boolean;
  watchVideoEnabled: boolean;
  quizEnabled: boolean;
  quizPassThresholdPercent: number | null;
  quizMaxAttempts: number | null;
  activityEnabled: boolean;
} | null;

// Sem `position` explícito: toda rotina de criação usada no import (createLesson,
// createLessonSection, addLessonMaterial etc.) já atribui a próxima posição automaticamente
// (findNextPosition) — importar os arrays abaixo na ordem em que aparecem já reproduz a ordem
// original de graça.
export type ExportedLesson = {
  title: string;
  videoUrl: string | null;
  coverMediaRef: string | null;
  status: LessonStatus;
  sections: ExportedLessonSection[];
  materials: ExportedLessonMaterial[];
  examples: ExportedLessonExample[];
  activities: ExportedLessonActivity[];
  quizQuestions: ExportedQuizQuestion[];
  requirements: ExportedLessonRequirements;
};

export type AcademyCourseBundleManifest = {
  format: typeof ACADEMY_COURSE_BUNDLE_FORMAT;
  formatVersion: typeof ACADEMY_COURSE_BUNDLE_FORMAT_VERSION;
  exportedAt: string;
  course: {
    title: string;
    description: string | null;
    slug: string;
    status: CourseStatus;
    publiclyListed: boolean;
    coverMediaRef: string | null;
    lessons: ExportedLesson[];
  };
  mediaAssets: ExportedMediaAsset[];
};

const academyStatusSchema = z.enum(["draft", "restricted", "public"]);
const mediaVisibilitySchema = z.enum(["public", "restricted", "private"]);
const deliverableFormatSchema = z.enum(["text", "audio", "image", "pdf", "none"]);

const exportedMediaAssetSchema = z.object({
  ref: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().nonnegative(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  alt: z.string().nullable(),
  checksum: z.string().min(1),
  visibility: mediaVisibilitySchema,
  categoryName: z.string().nullable(),
  file: z.string().min(1),
});

const exportedLessonSectionSchema = z.object({
  title: z.string().min(1),
  textData: z.unknown().nullable(),
  videoUrl: z.string().nullable(),
});

const exportedLessonMaterialSchema = z.object({ label: z.string().min(1), mediaRef: z.string().min(1) });

const exportedLessonExampleSchema = z.object({
  title: z.string().min(1),
  audioMediaRef: z.string().nullable(),
  sheetMediaRef: z.string().nullable(),
  notationData: z.string().nullable(),
  captionText: z.string(),
});

const exportedLessonActivitySchema = z.object({
  title: z.string().min(1),
  instructionsText: z.string(),
  deliverableFormat: deliverableFormatSchema,
});

const exportedQuizQuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string()),
  correctOptionIndex: z.number().int().nonnegative(),
  questionKind: z.enum(["text", "audio"]).optional(),
  promptNotation: z.string().nullable().optional(),
  optionNotations: z.array(z.string().nullable()).nullable().optional(),
});

const exportedLessonRequirementsSchema = z
  .object({
    readTextEnabled: z.boolean(),
    watchVideoEnabled: z.boolean(),
    quizEnabled: z.boolean(),
    quizPassThresholdPercent: z.number().nullable(),
    quizMaxAttempts: z.number().nullable(),
    activityEnabled: z.boolean(),
  })
  .nullable();

const exportedLessonSchema = z.object({
  title: z.string().min(1),
  videoUrl: z.string().nullable(),
  coverMediaRef: z.string().nullable(),
  status: academyStatusSchema,
  sections: z.array(exportedLessonSectionSchema),
  materials: z.array(exportedLessonMaterialSchema),
  examples: z.array(exportedLessonExampleSchema),
  activities: z.array(exportedLessonActivitySchema),
  quizQuestions: z.array(exportedQuizQuestionSchema),
  requirements: exportedLessonRequirementsSchema,
});

// Validação de fronteira do pacote não confiável (.zip enviado pelo admin) antes de qualquer
// gravação — mesmo raciocínio de exportManifestSchema em contexts/import-export.
export const academyCourseBundleManifestSchema = z.object({
  format: z.literal(ACADEMY_COURSE_BUNDLE_FORMAT),
  formatVersion: z.literal(ACADEMY_COURSE_BUNDLE_FORMAT_VERSION),
  exportedAt: z.string(),
  course: z.object({
    title: z.string().min(1),
    description: z.string().nullable(),
    slug: z.string().min(1),
    status: academyStatusSchema,
    publiclyListed: z.boolean(),
    coverMediaRef: z.string().nullable(),
    lessons: z.array(exportedLessonSchema),
  }),
  mediaAssets: z.array(exportedMediaAssetSchema),
});
