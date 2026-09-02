import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { createCourse } from "./service";
import type { CreateCourseInput, CreateCourseResult } from "./types";

export async function createCourseHandler(input: CreateCourseInput): Promise<CreateCourseResult> {
  if (input.title.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_title", message: "O título do curso não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createCourse({ ...input, actorId: authz.actorId });
}
