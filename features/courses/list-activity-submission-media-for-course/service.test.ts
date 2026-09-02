import { beforeEach, describe, expect, it, vi } from "vitest";

const findActivitySubmissionMediaForCourse = vi.fn();
vi.mock("./store", () => ({
  findActivitySubmissionMediaForCourse: (...args: unknown[]) => findActivitySubmissionMediaForCourse(...args),
}));

describe("listActivitySubmissionMediaForCourse", () => {
  beforeEach(() => {
    findActivitySubmissionMediaForCourse.mockReset();
  });

  it("returns the media items found for the course", async () => {
    const items = [
      { mediaId: "media-1", submissionId: "submission-1", lessonId: "lesson-1", lessonPosition: 1, lessonTitle: "Aula 1" },
    ];
    findActivitySubmissionMediaForCourse.mockResolvedValue(items);

    const { listActivitySubmissionMediaForCourse } = await import("./service");
    const result = await listActivitySubmissionMediaForCourse({ courseId: "course-1" });

    expect(result).toEqual({ success: true, data: items });
    expect(findActivitySubmissionMediaForCourse).toHaveBeenCalledWith("course-1");
  });

  it("returns an empty list when no submissions have media", async () => {
    findActivitySubmissionMediaForCourse.mockResolvedValue([]);

    const { listActivitySubmissionMediaForCourse } = await import("./service");
    const result = await listActivitySubmissionMediaForCourse({ courseId: "course-1" });

    expect(result).toEqual({ success: true, data: [] });
  });
});
