import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities, lessonActivitySubmissions, lessons } from "../../../database/schema";
import type { ActivitySubmissionMediaItem } from "./types";

export async function findActivitySubmissionMediaForCourse(courseId: string): Promise<ActivitySubmissionMediaItem[]> {
  const rows = await db
    .select({
      mediaId: lessonActivitySubmissions.mediaId,
      submissionId: lessonActivitySubmissions.id,
      lessonId: lessons.id,
      lessonPosition: lessons.position,
      lessonTitle: lessons.title,
    })
    .from(lessonActivitySubmissions)
    .innerJoin(lessonActivities, eq(lessonActivities.id, lessonActivitySubmissions.activityId))
    .innerJoin(lessons, eq(lessons.id, lessonActivities.lessonId))
    .where(and(eq(lessons.courseId, courseId), isNotNull(lessonActivitySubmissions.mediaId)));

  return rows as ActivitySubmissionMediaItem[];
}
