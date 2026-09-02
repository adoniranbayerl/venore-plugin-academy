import type { UserRef } from "@venore/plugin-sdk/auth";
import type { EnrollmentRecord } from "../../../contracts/types";
import type { EnrollmentView } from "./types";

export function toEnrollmentView(enrollment: EnrollmentRecord, user: UserRef | undefined): EnrollmentView {
  return {
    actorId: enrollment.actorId,
    name: user?.name ?? null,
    email: user?.email ?? null,
    enrolledAt: enrollment.enrolledAt,
    enrolledBy: enrollment.enrolledBy,
  };
}
