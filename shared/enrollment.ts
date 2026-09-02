import { findEnrollment } from "./enrollment-store";

export { findEnrollment, findEnrollmentsByActor, findEnrollmentsByCourse, insertEnrollment } from "./enrollment-store";

export async function isEnrolled(courseId: string, actorId: string): Promise<boolean> {
  return (await findEnrollment(courseId, actorId)) !== null;
}
