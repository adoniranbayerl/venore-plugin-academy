import { desc } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findAllCourses(): Promise<CourseRecord[]> {
  const rows = await db.select().from(courses).orderBy(desc(courses.createdAt));
  return rows as CourseRecord[];
}
