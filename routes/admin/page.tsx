import { GraduationCap } from "lucide-react";
import { AdminCourseCard, listCourses, listLessonsByCourse } from "../../index";
import { getPluginAdminPageData } from "@venore/plugin-sdk";
import { AdminAccessDenied } from "@venore/plugin-sdk/ui";
import { AdminPageHeader } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { CreateCourseDialog } from "./_components/create-course-dialog";
import { ImportCourseDialog } from "./_components/import-course-dialog";

export default async function AcademyAdminPage() {
  const gate = await getPluginAdminPageData("academy");

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para gerenciar a Academy." />;
  }

  const coursesResult = await listCourses();

  if (!coursesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar cursos: {coursesResult.error.message}</p>;
  }

  const courses = coursesResult.data;
  const lessonCounts = await Promise.all(courses.map((course) => listLessonsByCourse({ courseId: course.id })));
  const lessonCountByCourse = new Map(
    courses.map((course, index) => {
      const result = lessonCounts[index];
      return [course.id, result.success ? result.data.length : 0];
    }),
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Academy"
        description="Gerencie cursos, aulas e requisitos de conclusão."
        actions={
          courses.length > 0 && (
            <>
              <ImportCourseDialog />
              <CreateCourseDialog />
            </>
          )
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-8" strokeWidth={1.5} />}
          title="Nenhum curso cadastrado"
          description="Crie o primeiro curso para começar a montar a trilha de aulas, ou importe um curso exportado de outra instalação."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ImportCourseDialog />
              <CreateCourseDialog />
            </div>
          }
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
          {courses.map((course) => (
            <AdminCourseCard key={course.id} course={course} lessonCount={lessonCountByCourse.get(course.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
