import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";

export type ListLessonActivitySubmissionsForActivityQuery = { activityId: string };

// name/email resolvidos do diretório de usuários (contexts/auth) — mesmo padrão de
// EnrollmentView (features/enrollments/list-enrollments-for-course/types.ts), pra tela de
// professor não precisar mostrar só o actorId cru.
export type LessonActivitySubmissionView = LessonActivitySubmissionRecord & {
  actorName: string | null;
  actorEmail: string | null;
};

export type ListLessonActivitySubmissionsForActivityResult = OperationResult<LessonActivitySubmissionView[]>;
