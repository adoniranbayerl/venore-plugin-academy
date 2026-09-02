export type AcademyStudentActor = {
  id: string;
  name: string | null;
  email: string | null;
};

export type AcademyStudentPageGate =
  | { granted: true; actor: AcademyStudentActor }
  | { granted: false; reason: "unauthenticated" | "plugin_disabled" };

export type AcademyCourseAccessCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: "restricted" | "public";
  coverMediaId: string | null;
};

// Camada de acesso por curso, além do gate de seção (AcademyStudentPageGate): matrícula,
// self-enrollment e preview de professor (docs/venore-docks.md, plano da sessão de matrícula).
export type AcademyCourseAccess =
  | { mode: "unauthenticated" }
  | { mode: "not-found" }
  // Curso resolvido pelo antigo id (UUID) usado antes das rotas por slug — página deve
  // redirecionar pra `/academy/<slug>` (ou `/academy/<slug>/<lessonId>`), nunca renderizar aqui.
  | { mode: "redirect"; slug: string }
  | { mode: "restricted"; course: AcademyCourseAccessCourse }
  | { mode: "enroll-available"; actor: AcademyStudentActor; course: AcademyCourseAccessCourse }
  | { mode: "preview"; actor: AcademyStudentActor; course: AcademyCourseAccessCourse }
  | { mode: "full"; actor: AcademyStudentActor; course: AcademyCourseAccessCourse };
