import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AcademyCourseBundleManifest } from "../../../shared/course-bundle-manifest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const createEntry = vi.fn();
const extractEntryComposition = vi.fn();
const getOrCreateReservedContentType = vi.fn();
vi.mock("@venore/plugin-sdk/cms", () => ({
  createEntry: (...args: unknown[]) => createEntry(...args),
  extractEntryComposition: (...args: unknown[]) => extractEntryComposition(...args),
  getOrCreateReservedContentType: (...args: unknown[]) => getOrCreateReservedContentType(...args),
}));

const remapCompositionMediaIds = vi.fn();
vi.mock("@venore/plugin-sdk/import-export", () => ({
  remapCompositionMediaIds: (...args: unknown[]) => remapCompositionMediaIds(...args),
}));

const listMediaCategories = vi.fn();
const listMediaAssets = vi.fn();
const uploadMediaAsset = vi.fn();
vi.mock("@venore/plugin-sdk/media", () => ({
  listCategories: (...args: unknown[]) => listMediaCategories(...args),
  listMediaAssets: (...args: unknown[]) => listMediaAssets(...args),
  uploadMediaAsset: (...args: unknown[]) => uploadMediaAsset(...args),
}));

const addLessonActivity = vi.fn();
vi.mock("../../lessons/add-lesson-activity/service", () => ({ addLessonActivity: (...args: unknown[]) => addLessonActivity(...args) }));

const addLessonExample = vi.fn();
vi.mock("../../lessons/add-lesson-example/service", () => ({ addLessonExample: (...args: unknown[]) => addLessonExample(...args) }));

const addLessonMaterial = vi.fn();
vi.mock("../../lessons/add-lesson-material/service", () => ({ addLessonMaterial: (...args: unknown[]) => addLessonMaterial(...args) }));

const addQuizQuestion = vi.fn();
vi.mock("../../lessons/add-quiz-question/service", () => ({ addQuizQuestion: (...args: unknown[]) => addQuizQuestion(...args) }));

const configureLessonRequirements = vi.fn();
vi.mock("../../lessons/configure-lesson-requirements/service", () => ({
  configureLessonRequirements: (...args: unknown[]) => configureLessonRequirements(...args),
}));

const createLesson = vi.fn();
vi.mock("../../lessons/create-lesson/service", () => ({ createLesson: (...args: unknown[]) => createLesson(...args) }));

const createLessonSectionService = vi.fn();
vi.mock("../../lessons/sections/create-lesson-section/service", () => ({
  createLessonSectionService: (...args: unknown[]) => createLessonSectionService(...args),
}));

const setLessonStatus = vi.fn();
vi.mock("../../lessons/set-lesson-status/service", () => ({ setLessonStatus: (...args: unknown[]) => setLessonStatus(...args) }));

const createCourse = vi.fn();
vi.mock("../create-course/service", () => ({ createCourse: (...args: unknown[]) => createCourse(...args) }));

const listCourses = vi.fn();
vi.mock("../list-courses/service", () => ({ listCourses: (...args: unknown[]) => listCourses(...args) }));

const publishCourse = vi.fn();
vi.mock("../publish-course/service", () => ({ publishCourse: (...args: unknown[]) => publishCourse(...args) }));

function baseManifest(overrides: Partial<AcademyCourseBundleManifest["course"]> = {}, mediaAssets: AcademyCourseBundleManifest["mediaAssets"] = []): AcademyCourseBundleManifest {
  return {
    format: "venore-academy-course",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    course: {
      title: "Curso",
      description: null,
      slug: "novo-curso",
      status: "restricted",
      publiclyListed: true,
      coverMediaRef: null,
      lessons: [],
      ...overrides,
    },
    mediaAssets,
  };
}

describe("importCourseBundle", () => {
  beforeEach(() => {
    createEntry.mockReset();
    extractEntryComposition.mockReset();
    getOrCreateReservedContentType.mockReset();
    remapCompositionMediaIds.mockReset();
    listMediaCategories.mockReset();
    listMediaAssets.mockReset();
    uploadMediaAsset.mockReset();
    addLessonActivity.mockReset();
    addLessonExample.mockReset();
    addLessonMaterial.mockReset();
    addQuizQuestion.mockReset();
    configureLessonRequirements.mockReset();
    createLesson.mockReset();
    createLessonSectionService.mockReset();
    setLessonStatus.mockReset();
    createCourse.mockReset();
    listCourses.mockReset();
    publishCourse.mockReset();

    listMediaCategories.mockResolvedValue({ success: true, data: [] });
    listMediaAssets.mockResolvedValue({ success: true, data: [] });
  });

  it("skips the whole course when a course with the same slug already exists", async () => {
    listCourses.mockResolvedValue({ success: true, data: [{ id: "existing", slug: "novo-curso" }] });

    const { importCourseBundle } = await import("./service");
    const result = await importCourseBundle({ manifest: baseManifest(), files: new Map(), actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.lines).toEqual([
      { kind: "course", ref: "novo-curso", outcome: "skipped", message: "Já existe um curso com este slug no destino — nenhuma aula foi importada." },
    ]);
    expect(createCourse).not.toHaveBeenCalled();
  });

  it("creates a new course, dedupes media by checksum, and reports best-effort per lesson", async () => {
    listCourses.mockResolvedValue({ success: true, data: [] });
    listMediaAssets.mockResolvedValue({ success: true, data: [{ id: "media-existing-dst", checksum: "chk-existing" }] });
    uploadMediaAsset.mockResolvedValue({ success: true, data: { id: "media-new-dst", checksum: "chk-new" } });
    createCourse.mockResolvedValue({ success: true, data: { id: "course-dst-1", slug: "novo-curso" } });
    publishCourse.mockResolvedValue({ success: true, data: { id: "course-dst-1", slug: "novo-curso", status: "public" } });

    createLesson.mockImplementation(async ({ title }: { title: string }) =>
      title === "Aula A" ? { success: true, data: { id: "lesson-a-dst" } } : { success: false, error: { code: "academy.lessons.x", message: "boom" } },
    );

    const manifest = baseManifest(
      {
        status: "public",
        lessons: [
          {
            title: "Aula A",
            videoUrl: null,
            coverMediaRef: null,
            status: "restricted",
            sections: [],
            materials: [],
            examples: [],
            activities: [],
            quizQuestions: [],
            requirements: null,
          },
          {
            title: "Aula B",
            videoUrl: null,
            coverMediaRef: null,
            status: "restricted",
            sections: [],
            materials: [],
            examples: [],
            activities: [],
            quizQuestions: [],
            requirements: null,
          },
        ],
      },
      [
        { ref: "chk-existing", filename: "x.png", contentType: "image/png", size: 1, width: null, height: null, alt: null, checksum: "chk-existing", visibility: "public", categoryName: null, file: "assets/chk-existing-x.png" },
        { ref: "chk-new", filename: "y.png", contentType: "image/png", size: 2, width: null, height: null, alt: null, checksum: "chk-new", visibility: "public", categoryName: null, file: "assets/chk-new-y.png" },
      ],
    );

    const files = new Map<string, Buffer>([["assets/chk-new-y.png", Buffer.from("bytes")]]);

    const { importCourseBundle } = await import("./service");
    const result = await importCourseBundle({ manifest, files, actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { lines } = result.data;
    expect(lines).toEqual(
      expect.arrayContaining([
        { kind: "media-asset", ref: "chk-existing", outcome: "reused", message: "Já existe um arquivo idêntico (mesmo checksum) no destino — reaproveitado." },
        { kind: "media-asset", ref: "chk-new", outcome: "created", message: undefined },
        { kind: "lesson", ref: "Aula A", outcome: "created", message: undefined },
        { kind: "lesson", ref: "Aula B", outcome: "failed", message: "boom" },
      ]),
    );
    expect(lines[0]).toEqual({ kind: "course", ref: "novo-curso", outcome: "created", message: undefined });
    expect(uploadMediaAsset).toHaveBeenCalledTimes(1);
    expect(uploadMediaAsset).toHaveBeenCalledWith(expect.objectContaining({ filename: "y.png" }));
    expect(publishCourse).toHaveBeenCalledWith({ id: "course-dst-1", status: "public", actorId: "actor-1" });
    expect(result.data.createdCount).toBe(3); // curso + aula A + mídia nova
    expect(result.data.reusedCount).toBe(1);
    expect(result.data.failedCount).toBe(1);
  });

  it("carries audio-quiz fields through to addQuizQuestion and rejects a malformed audio question", async () => {
    listCourses.mockResolvedValue({ success: true, data: [] });
    createCourse.mockResolvedValue({ success: true, data: { id: "course-dst-2", slug: "novo-curso" } });
    publishCourse.mockResolvedValue({ success: true, data: { id: "course-dst-2", slug: "novo-curso", status: "restricted" } });
    createLesson.mockResolvedValue({ success: true, data: { id: "lesson-q-dst" } });
    addQuizQuestion.mockResolvedValue({ success: true, data: { id: "q-dst" } });

    const manifest = baseManifest({
      lessons: [
        {
          title: "Aula Quiz",
          videoUrl: null,
          coverMediaRef: null,
          status: "restricted",
          sections: [],
          materials: [],
          examples: [],
          activities: [],
          quizQuestions: [
            {
              text: "Ouça o intervalo:",
              options: ["Terça", "Quinta"],
              correctOptionIndex: 1,
              questionKind: "audio",
              promptNotation: "X:1\nK:C\nC E |",
            },
            {
              // audio sem nenhuma notação — deve ser recusada por pergunta, não travar a aula
              text: "Áudio quebrado",
              options: ["A", "B"],
              correctOptionIndex: 0,
              questionKind: "audio",
            },
            { text: "Comum", options: ["A", "B"], correctOptionIndex: 0 },
          ],
          requirements: null,
        },
      ],
    });

    const { importCourseBundle } = await import("./service");
    const result = await importCourseBundle({ manifest, files: new Map(), actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(addQuizQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "Ouça o intervalo:",
        questionKind: "audio",
        promptNotation: "X:1\nK:C\nC E |",
        optionNotations: null,
      }),
    );
    expect(addQuizQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Comum", questionKind: "text", promptNotation: null, optionNotations: null }),
    );
    // a pergunta de áudio malformada nunca chega no service
    expect(addQuizQuestion).toHaveBeenCalledTimes(2);
    const lessonLine = result.data.lines.find((line) => line.kind === "lesson");
    expect(lessonLine?.message).toContain("Áudio quebrado");
  });

  it("configura os requisitos DEPOIS de criar atividades e quiz (activityEnabled exige atividade existente)", async () => {
    listCourses.mockResolvedValue({ success: true, data: [] });
    createCourse.mockResolvedValue({ success: true, data: { id: "course-dst-1", slug: "novo-curso" } });
    createLesson.mockResolvedValue({ success: true, data: { id: "lesson-dst-1" } });
    addLessonActivity.mockResolvedValue({ success: true, data: { id: "activity-1" } });
    addQuizQuestion.mockResolvedValue({ success: true, data: { id: "question-1" } });
    configureLessonRequirements.mockResolvedValue({ success: true, data: {} });

    const manifest = baseManifest({
      status: "draft",
      lessons: [
        {
          title: "Aula A",
          videoUrl: null,
          coverMediaRef: null,
          status: "restricted",
          sections: [],
          materials: [],
          examples: [],
          activities: [{ title: "Praticar", instructionsText: "Grave.", deliverableFormat: "audio" }],
          quizQuestions: [{ text: "1+1?", options: ["1", "2"], correctOptionIndex: 1 }],
          requirements: {
            readTextEnabled: false,
            watchVideoEnabled: false,
            quizEnabled: true,
            quizPassThresholdPercent: 70,
            quizMaxAttempts: 3,
            activityEnabled: true,
          },
        },
      ],
    });

    const { importCourseBundle } = await import("./service");
    const result = await importCourseBundle({ manifest, files: new Map(), actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(configureLessonRequirements).toHaveBeenCalledWith(expect.objectContaining({ activityEnabled: true, quizEnabled: true }));

    const requirementsOrder = configureLessonRequirements.mock.invocationCallOrder[0];
    expect(requirementsOrder).toBeGreaterThan(addLessonActivity.mock.invocationCallOrder[0]);
    expect(requirementsOrder).toBeGreaterThan(addQuizQuestion.mock.invocationCallOrder[0]);

    if (!result.success) return;
    const line = result.data.lines.find((l) => l.kind === "lesson");
    expect(line?.message).toBeUndefined(); // nenhuma nota de falha
  });
});
