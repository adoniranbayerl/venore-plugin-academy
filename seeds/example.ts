import type { OperationResult } from "@venore/plugin-sdk";
import { createCourse } from "../features/courses/create-course/service";
import { listCourses } from "../features/courses/list-courses/service";
import { createLesson } from "../features/lessons/create-lesson/service";

// Seed de dados de exemplo do plugin (platform/plugin-engine/plugin-seed-registry.ts) — rodado
// via /admin/plugins. Chama service.ts direto: não há sessão/ator neste caminho (mesmo racional
// de scripts/seed-enrollment-dashboard.ts). actorId é só rótulo de auditoria.
const SEED_ACTOR_ID = "system-seed";
const EXAMPLE_COURSE_TITLE = "Curso de exemplo";

const EXAMPLE_LESSONS = [
  {
    title: "Aula 1 — Boas-vindas",
    body: "Esta é uma aula de exemplo criada automaticamente. Edite ou remova pelo painel da Academy.",
  },
  {
    title: "Aula 2 — Primeiros passos",
    body: "Conteúdo de exemplo. Use o construtor de aulas para adicionar texto, vídeo, materiais e quiz.",
  },
  {
    title: "Aula 3 — Próximos passos",
    body: "Conteúdo de exemplo. Configure os requisitos de conclusão para controlar o avanço do aluno.",
  },
];

// Idempotente: se já existe um curso com o título de exemplo, não faz nada — rodar 2x não duplica.
export async function seedAcademyExample(): Promise<OperationResult<void>> {
  const existing = await listCourses();
  if (!existing.success) {
    return { success: false, error: existing.error };
  }
  if (existing.data.some((course) => course.title === EXAMPLE_COURSE_TITLE)) {
    return { success: true, data: undefined };
  }

  const course = await createCourse({
    title: EXAMPLE_COURSE_TITLE,
    description: "Curso gerado automaticamente para demonstrar a Academy.",
    publiclyListed: true,
    actorId: SEED_ACTOR_ID,
  });
  if (!course.success) {
    return { success: false, error: course.error };
  }

  for (const lesson of EXAMPLE_LESSONS) {
    const created = await createLesson({
      courseId: course.data.id,
      title: lesson.title,
      body: lesson.body,
      actorId: SEED_ACTOR_ID,
    });
    if (!created.success) {
      return { success: false, error: created.error };
    }
  }

  return { success: true, data: undefined };
}
