import { listPublicCourses as listPublicCoursesService } from "./service";
import type { ListPublicCoursesResult } from "./types";

// Sem authorizeActor de propósito: esta é a vitrine pública (pedido desta sessão: "landing page
// pra vender os cursos, onde o aluno possa se matricular"), precisa funcionar pra visitante
// anônimo, antes de qualquer login. Só devolve o que já é intencionalmente público (status
// "public" + publiclyListed, filtrado em list-public-courses/store.ts) — nada de dado de aluno,
// matrícula ou progresso passa por aqui.
export async function listPublicCoursesHandler(): Promise<ListPublicCoursesResult> {
  return listPublicCoursesService();
}
