import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@venore/plugin-sdk/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

const getUserContext = vi.fn();
vi.mock("@venore/plugin-sdk/rbac", () => ({
  getUserContext: (...args: unknown[]) => getUserContext(...args),
}));

const getCourseForStudent = vi.fn();
const getCachedCourseForStudent = vi.fn();
const isEnrolled = vi.fn();
vi.mock("../index", () => ({
  getCourseForStudent: (...args: unknown[]) => getCourseForStudent(...args),
  // Mock separado do handler cru: get-academy-course-access.ts chama este pro caminho por slug
  // (é o loader cacheado que plugins/academy/breadcrumbs.ts também usa — reuso de verdade, não só
  // documentado, ver comentário no próprio arquivo). Aqui só precisa delegar pro handler mockado
  // pra manter as asserções de resultado de curso funcionando.
  getCachedCourseForStudent: (slug: string) => getCachedCourseForStudent(slug),
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const isPluginActive = vi.fn();
vi.mock("@venore/plugin-sdk", () => ({
  isPluginActive: (...args: unknown[]) => isPluginActive(...args),
}));

const actorUser = { id: "actor-1", email: "actor@example.com", name: "Actor" };
const course = {
  id: "course-1",
  slug: "curso",
  title: "Curso",
  description: "desc",
  status: "public",
  createdBy: "teacher-1",
  publiclyListed: true,
};

describe("getAcademyCourseAccess", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getUserContext.mockReset();
    getCourseForStudent.mockReset();
    getCachedCourseForStudent.mockReset();
    isEnrolled.mockReset();
    isPluginActive.mockReset();
    isPluginActive.mockResolvedValue(true);
  });

  it("is not-found when the academy plugin is disabled, without even checking the session", async () => {
    isPluginActive.mockResolvedValue(false);

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result).toEqual({ mode: "not-found" });
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("is unauthenticated when there is no session", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result).toEqual({ mode: "unauthenticated" });
    expect(getCachedCourseForStudent).not.toHaveBeenCalled();
  });

  it("is not-found when the course does not exist or is not published", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: null });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result).toEqual({ mode: "not-found" });
    expect(getCachedCourseForStudent).toHaveBeenCalledWith("curso");
  });

  it("redirects to the slug when the legacy uuid still resolves to a course", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    const legacyId = "11111111-2222-3333-4444-555555555555";
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: null });
    getCourseForStudent.mockResolvedValue({ success: true, data: course });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess(legacyId);

    expect(result).toEqual({ mode: "redirect", slug: "curso" });
    expect(getCachedCourseForStudent).toHaveBeenCalledWith(legacyId);
    expect(getCourseForStudent).toHaveBeenCalledWith({ id: legacyId });
  });

  it("is not-found when the slug looks like a uuid but resolves nowhere", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    const legacyId = "11111111-2222-3333-4444-555555555555";
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: null });
    getCourseForStudent.mockResolvedValue({ success: true, data: null });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess(legacyId);

    expect(result).toEqual({ mode: "not-found" });
  });

  it("is full when the actor is enrolled", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: true });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result.mode).toBe("full");
    expect(getUserContext).not.toHaveBeenCalled();
  });

  it("is preview for a superadmin who is not enrolled and not the course creator", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: [], isSuperadmin: true },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result.mode).toBe("preview");
  });

  it("is preview for the course creator with academy.courses.manage", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { ...actorUser, id: "teacher-1" } });
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "teacher-1", roles: [], permissions: ["academy.courses.manage"], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result.mode).toBe("preview");
  });

  it("is NOT preview for an actor with academy.courses.manage who did not create the course", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: ["academy.courses.manage"], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result.mode).toBe("enroll-available");
  });

  it("is enroll-available when not enrolled, no preview access, and self-enrollment is on", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: [], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result.mode).toBe("enroll-available");
  });

  it("is restricted when not enrolled, no preview access, and the course status is restricted", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCachedCourseForStudent.mockResolvedValue({ success: true, data: { ...course, status: "restricted" } });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: [], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess("curso");

    expect(result.mode).toBe("restricted");
  });
});
