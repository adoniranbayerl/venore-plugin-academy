import { asc, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@venore/plugin-sdk";
import { lessons } from "../../../database/schema";
import { seedCourse, seedLessons, seedUser } from "../../../test-support/academy-seed";
import { reorderLessonsService } from "./service";

// Prova o que o teste unitário (store mockada) não prova: as duas fases de reorderLessons
// (posição negativa temporária, depois final) realmente evitam violar o unique index
// (courseId, position) do Postgres — ver comentário em store.ts.
describe("reorderLessonsService (integração)", () => {
  it("inverte a ordem completa e depois embaralha de novo sem violar o unique de posição", async () => {
    const user = await seedUser();
    const course = await seedCourse(user.id);
    const seeded = await seedLessons(course.id, 5, user.id);
    const originalIds = seeded.map((lesson) => lesson.id);

    const inverted = [...originalIds].reverse();
    const invertedResult = await reorderLessonsService({ courseId: course.id, lessonIds: inverted, actorId: user.id });
    expect(invertedResult.success).toBe(true);

    const rowsAfterInvert = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, course.id))
      .orderBy(asc(lessons.position));
    expect(rowsAfterInvert.map((row) => row.position)).toEqual([1, 2, 3, 4, 5]);
    expect(rowsAfterInvert.map((row) => row.id)).toEqual(inverted);

    const shuffled = [originalIds[2], originalIds[0], originalIds[4], originalIds[1], originalIds[3]];
    const shuffledResult = await reorderLessonsService({ courseId: course.id, lessonIds: shuffled, actorId: user.id });
    expect(shuffledResult.success).toBe(true);

    const rowsAfterShuffle = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, course.id))
      .orderBy(asc(lessons.position));
    const positions = rowsAfterShuffle.map((row) => row.position);
    expect(positions).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(positions).size).toBe(5);
    expect(rowsAfterShuffle.map((row) => row.id)).toEqual(shuffled);
  });
});
