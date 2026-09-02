import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getEntry = vi.fn();
const extractEntryComposition = vi.fn();

vi.mock("@venore/plugin-sdk/cms", () => ({
  getEntry: (...args: unknown[]) => getEntry(...args),
  extractEntryComposition: (...args: unknown[]) => extractEntryComposition(...args),
}));

const remapCompositionMediaIds = vi.fn();

vi.mock("@venore/plugin-sdk/import-export", () => ({
  remapCompositionMediaIds: (...args: unknown[]) => remapCompositionMediaIds(...args),
}));

const getMediaAsset = vi.fn();
const listMediaCategories = vi.fn();

vi.mock("@venore/plugin-sdk/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
  listCategories: (...args: unknown[]) => listMediaCategories(...args),
}));

const getCourse = vi.fn();
vi.mock("../get-course/service", () => ({ getCourse: (...args: unknown[]) => getCourse(...args) }));

const listLessonsByCourse = vi.fn();
vi.mock("../../lessons/list-lessons-by-course/service", () => ({
  listLessonsByCourse: (...args: unknown[]) => listLessonsByCourse(...args),
}));

const listLessonSectionsByLesson = vi.fn();
vi.mock("../../lessons/sections/list-lesson-sections-by-lesson/service", () => ({
  listLessonSectionsByLesson: (...args: unknown[]) => listLessonSectionsByLesson(...args),
}));

const listLessonMaterialsByLesson = vi.fn();
vi.mock("../../lessons/list-lesson-materials-by-lesson/service", () => ({
  listLessonMaterialsByLesson: (...args: unknown[]) => listLessonMaterialsByLesson(...args),
}));

const listLessonExamplesByLesson = vi.fn();
vi.mock("../../lessons/list-lesson-examples-by-lesson/service", () => ({
  listLessonExamplesByLesson: (...args: unknown[]) => listLessonExamplesByLesson(...args),
}));

const listLessonActivitiesByLesson = vi.fn();
vi.mock("../../lessons/list-lesson-activities-by-lesson/service", () => ({
  listLessonActivitiesByLesson: (...args: unknown[]) => listLessonActivitiesByLesson(...args),
}));

const listQuizQuestionsByLesson = vi.fn();
vi.mock("../../lessons/list-quiz-questions-by-lesson/service", () => ({
  listQuizQuestionsByLesson: (...args: unknown[]) => listQuizQuestionsByLesson(...args),
}));

const getLessonRequirements = vi.fn();
vi.mock("../../lessons/get-lesson-requirements/service", () => ({
  getLessonRequirements: (...args: unknown[]) => getLessonRequirements(...args),
}));

const MEDIA_ASSETS_BY_ID: Record<string, { id: string; filename: string; url: string; contentType: string; size: number; width: number | null; height: number | null; alt: string | null; checksum: string; visibility: string; categoryId: string | null }> = {
  "media-course": { id: "media-course", filename: "course.png", url: "https://blob/course.png", contentType: "image/png", size: 10, width: 1, height: 1, alt: null, checksum: "chk-course", visibility: "public", categoryId: null },
  "media-lesson": { id: "media-lesson", filename: "lesson.png", url: "https://blob/lesson.png", contentType: "image/png", size: 10, width: 1, height: 1, alt: null, checksum: "chk-lesson", visibility: "public", categoryId: null },
  "media-material": { id: "media-material", filename: "slides.pdf", url: "https://blob/slides.pdf", contentType: "application/pdf", size: 20, width: null, height: null, alt: null, checksum: "chk-material", visibility: "public", categoryId: null },
  "media-audio": { id: "media-audio", filename: "audio.mp3", url: "https://blob/audio.mp3", contentType: "audio/mpeg", size: 30, width: null, height: null, alt: null, checksum: "chk-audio", visibility: "public", categoryId: null },
  "media-sheet": { id: "media-sheet", filename: "sheet.png", url: "https://blob/sheet.png", contentType: "image/png", size: 15, width: 2, height: 2, alt: null, checksum: "chk-sheet", visibility: "public", categoryId: null },
  "media-in-section": { id: "media-in-section", filename: "inline.png", url: "https://blob/inline.png", contentType: "image/png", size: 5, width: 3, height: 3, alt: null, checksum: "chk-section-media", visibility: "public", categoryId: null },
};

describe("exportCourseBundle", () => {
  beforeEach(() => {
    getEntry.mockReset();
    extractEntryComposition.mockReset();
    remapCompositionMediaIds.mockReset();
    getMediaAsset.mockReset();
    listMediaCategories.mockReset();
    getCourse.mockReset();
    listLessonsByCourse.mockReset();
    listLessonSectionsByLesson.mockReset();
    listLessonMaterialsByLesson.mockReset();
    listLessonExamplesByLesson.mockReset();
    listLessonActivitiesByLesson.mockReset();
    listQuizQuestionsByLesson.mockReset();
    getLessonRequirements.mockReset();

    listMediaCategories.mockResolvedValue({ success: true, data: [] });
    getMediaAsset.mockImplementation(async ({ id }: { id: string }) => ({ success: true, data: MEDIA_ASSETS_BY_ID[id] ?? null }));
    extractEntryComposition.mockImplementation((data: unknown) =>
      data && typeof data === "object" && "blocks" in data ? (data as { blocks: unknown }).blocks : null,
    );
    remapCompositionMediaIds.mockImplementation((composition: unknown, resolve: (id: string) => unknown) => {
      resolve("media-in-section");
      return { remapped: composition };
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => ({
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode(`bytes-for-${url}`).buffer,
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("assembles the manifest with media resolved to checksums and text sections remapped", async () => {
    getCourse.mockResolvedValue({
      success: true,
      data: {
        id: "course-1",
        title: "Curso Teste",
        description: "Desc",
        slug: "curso-teste",
        status: "restricted",
        createdBy: "actor-1",
        publiclyListed: true,
        coverMediaId: "media-course",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    listLessonsByCourse.mockResolvedValue({
      success: true,
      data: [
        {
          id: "lesson-1",
          courseId: "course-1",
          title: "Aula 1",
          body: null,
          videoUrl: "https://video",
          position: 1,
          coverMediaId: "media-lesson",
          status: "public",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    listLessonSectionsByLesson.mockResolvedValue({
      success: true,
      data: [{ id: "section-1", lessonId: "lesson-1", position: 1, title: "Texto", cmsEntryId: "entry-1", videoUrl: null, createdAt: new Date(), updatedAt: new Date() }],
    });
    listLessonMaterialsByLesson.mockResolvedValue({
      success: true,
      data: [{ id: "material-1", lessonId: "lesson-1", mediaId: "media-material", label: "Slides", position: 1, createdAt: new Date() }],
    });
    listLessonExamplesByLesson.mockResolvedValue({
      success: true,
      data: [
        {
          id: "example-1",
          lessonId: "lesson-1",
          title: "Exemplo",
          audioMediaId: "media-audio",
          sheetMediaId: "media-sheet",
          notationData: null,
          captionText: "caption",
          position: 1,
          createdAt: new Date(),
        },
      ],
    });
    listLessonActivitiesByLesson.mockResolvedValue({
      success: true,
      data: [{ id: "activity-1", lessonId: "lesson-1", title: "Atividade", instructionsText: "faça isso", deliverableFormat: "text", position: 1, createdAt: new Date(), updatedAt: new Date() }],
    });
    listQuizQuestionsByLesson.mockResolvedValue({
      success: true,
      data: [
        { id: "quiz-1", lessonId: "lesson-1", text: "Pergunta?", options: ["A", "B"], correctOptionIndex: 0, questionKind: "text", promptNotation: null, optionNotations: null, createdAt: new Date() },
        {
          id: "quiz-2",
          lessonId: "lesson-1",
          text: "Ouça e escolha:",
          options: ["Terça", "Quinta"],
          correctOptionIndex: 1,
          questionKind: "audio",
          promptNotation: "X:1\nK:C\nC E |",
          optionNotations: null,
          createdAt: new Date(),
        },
      ],
    });
    getLessonRequirements.mockResolvedValue({
      success: true,
      data: {
        lessonId: "lesson-1",
        readTextEnabled: true,
        watchVideoEnabled: false,
        quizEnabled: true,
        quizPassThresholdPercent: 70,
        quizMaxAttempts: 3,
        activityEnabled: false,
        updatedAt: new Date(),
      },
    });
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-1", data: { blocks: "blocks-sentinel" } } });

    const { exportCourseBundle } = await import("./service");
    const result = await exportCourseBundle({ courseId: "course-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { manifest, files } = result.data;

    expect(manifest.course.slug).toBe("curso-teste");
    expect(manifest.course.coverMediaRef).toBe("chk-course");
    expect(manifest.mediaAssets.map((asset) => asset.ref).sort()).toEqual(
      ["chk-audio", "chk-course", "chk-lesson", "chk-material", "chk-section-media", "chk-sheet"].sort(),
    );
    expect(files).toHaveLength(6);

    const lesson = manifest.course.lessons[0];
    expect(lesson.coverMediaRef).toBe("chk-lesson");
    expect(lesson.materials).toEqual([{ label: "Slides", mediaRef: "chk-material" }]);
    expect(lesson.examples).toEqual([{ title: "Exemplo", audioMediaRef: "chk-audio", sheetMediaRef: "chk-sheet", notationData: null, captionText: "caption" }]);
    expect(lesson.activities).toEqual([{ title: "Atividade", instructionsText: "faça isso", deliverableFormat: "text" }]);
    expect(lesson.quizQuestions).toEqual([
      { text: "Pergunta?", options: ["A", "B"], correctOptionIndex: 0 },
      {
        text: "Ouça e escolha:",
        options: ["Terça", "Quinta"],
        correctOptionIndex: 1,
        questionKind: "audio",
        promptNotation: "X:1\nK:C\nC E |",
      },
    ]);
    expect(lesson.requirements).toEqual({
      readTextEnabled: true,
      watchVideoEnabled: false,
      quizEnabled: true,
      quizPassThresholdPercent: 70,
      quizMaxAttempts: 3,
      activityEnabled: false,
    });
    expect(lesson.sections).toEqual([{ title: "Texto", textData: { blocks: { remapped: "blocks-sentinel" } }, videoUrl: null }]);
  });

  it("returns a not_found error when the course does not exist", async () => {
    getCourse.mockResolvedValue({ success: true, data: null });

    const { exportCourseBundle } = await import("./service");
    const result = await exportCourseBundle({ courseId: "missing" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("academy.export-course-bundle.not_found");
  });
});
