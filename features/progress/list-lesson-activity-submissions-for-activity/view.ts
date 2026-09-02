import type { UserRef } from "@venore/plugin-sdk/auth";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";
import type { LessonActivitySubmissionView } from "./types";

export function toLessonActivitySubmissionView(
  submission: LessonActivitySubmissionRecord,
  user: UserRef | undefined,
): LessonActivitySubmissionView {
  return {
    ...submission,
    actorName: user?.name ?? null,
    actorEmail: user?.email ?? null,
  };
}
