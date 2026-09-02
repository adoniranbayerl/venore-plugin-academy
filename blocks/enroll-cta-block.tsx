import Link from "next/link";
import type { Block } from "@venore/plugin-sdk/cms";
import { getCourseForStudentHandler as getCourseForStudent } from "../features/courses/get-course-for-student/handler";
import { isEnrolledHandler as isEnrolled } from "../features/enrollments/is-enrolled/handler";
import { Button } from "@venore/plugin-sdk/ui";
import type { BlockRendererProps } from "@venore/plugin-sdk";
import { AcademyEnrollButton } from "./enroll-button";

function readString(data: Block["data"], key: string, fallback = ""): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

export async function AcademyEnrollCtaBlock({ block }: BlockRendererProps) {
  const slug = readString(block.data, "slug").trim();
  if (!slug) {
    return null;
  }
  const label = readString(block.data, "label", "Matricular-se");

  const courseResult = await getCourseForStudent({ slug });
  if (!courseResult.success || !courseResult.data) {
    return null;
  }
  const course = courseResult.data;

  const enrolledResult = await isEnrolled({ courseId: course.id });
  if (!enrolledResult.success) {
    // Visitante anônimo: manda pra página do curso, que já sabe pedir login (gracioso, sem
    // duplicar a lógica de auth aqui).
    return (
      <Button asChild>
        <Link href={`/academy/${course.slug}`}>{label}</Link>
      </Button>
    );
  }

  if (enrolledResult.data) {
    return (
      <Button asChild>
        <Link href={`/academy/${course.slug}`}>Continuar curso</Link>
      </Button>
    );
  }

  if (course.status !== "public") {
    return (
      <Button asChild variant="outline">
        <Link href={`/academy/${course.slug}`}>Ver curso</Link>
      </Button>
    );
  }

  return <AcademyEnrollButton courseId={course.id} slug={course.slug} label={label} />;
}
