import { cache } from "react";
import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { getUserContext } from "@venore/plugin-sdk/rbac";
import { getCourseForStudent, getCachedCourseForStudent, isEnrolled } from "../index";
import { isPluginActive } from "@venore/plugin-sdk";
import type { AcademyCourseAccess } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Composição academy + rbac + auth (papel de platform/, docs/venore-docks.md regra 12) — decide
// o nível de acesso a UM curso específico, camada adicional sobre getAcademyStudentPageData()
// (que só checa autenticação, regra 13). Preview de professor exige academy.courses.manage E
// ser o criador do curso (ou isSuperadmin) — RBAC nesta v1 é só permission global, sem escopo por
// recurso, então comparamos createdBy diretamente em vez de introduzir RBAC por recurso.
//
// cache() + argumento primitivo (courseSlug direto, não `{ courseSlug }`) — react/cache() só
// dedupe argumento objeto por REFERÊNCIA (WeakMap), então um objeto novo por call site nunca
// deduplicava nada; com string, chamadas com o mesmo slug no mesmo request colapsam numa só. Isso
// resolve a query duplicada que já existia entre a página de aula e o slot @sidebarContextual
// (ambos chamavam isto de forma independente) e é reaproveitado por
// plugins/academy/breadcrumbs.ts:academyBreadcrumbSegments (nível "/academy/:courseSlug") — três
// consumidores, uma chamada por request quando o slug bate.
export const getAcademyCourseAccess = cache(async (courseSlug: string): Promise<AcademyCourseAccess> => {
  // Plugin desabilitado se comporta como curso inexistente pro aluno — não existe um "mode"
  // dedicado pra isso porque, do ponto de vista de quem acessa a URL, não há diferença prática
  // entre "nunca existiu" e "existe mas o subsistema está desligado" (mesmo raciocínio de
  // get-academy-page-data.ts pro admin, mas aqui reaproveitando "not-found" em vez de "forbidden"
  // porque não existe conceito de permission nesta camada).
  if (!(await isPluginActive("academy"))) {
    return { mode: "not-found" };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { mode: "unauthenticated" };
  }
  const actor = { id: currentUser.data.id, name: currentUser.data.name, email: currentUser.data.email };

  const courseResult = await getCachedCourseForStudent(courseSlug);
  // Rotas antigas usavam o id (UUID) do curso na URL — se não achar por slug e a string parecer
  // um UUID, tenta resolver pelo id legado só pra decidir o redirect (item 2 do pedido da sessão:
  // "/academy/<uuid antigo> redireciona").
  if ((!courseResult.success || !courseResult.data) && UUID_PATTERN.test(courseSlug)) {
    const byId = await getCourseForStudent({ id: courseSlug });
    if (byId.success && byId.data) {
      return { mode: "redirect", slug: byId.data.slug };
    }
  }

  if (!courseResult.success || !courseResult.data) {
    return { mode: "not-found" };
  }
  const course = {
    id: courseResult.data.id,
    slug: courseResult.data.slug,
    title: courseResult.data.title,
    description: courseResult.data.description,
    // findCourseForStudent já exclui "draft" (ver get-course-for-student/store.ts) — só
    // restricted/public chegam aqui.
    status: courseResult.data.status as "restricted" | "public",
    coverMediaId: courseResult.data.coverMediaId,
  };

  const enrolledResult = await isEnrolled({ courseId: course.id });
  if (enrolledResult.success && enrolledResult.data) {
    return { mode: "full", actor, course };
  }

  const rbacContext = await getUserContext({ userId: actor.id });
  const canPreview =
    rbacContext.success &&
    (rbacContext.data.isSuperadmin ||
      (rbacContext.data.permissions.includes("academy.courses.manage") && courseResult.data.createdBy === actor.id));
  if (canPreview) {
    return { mode: "preview", actor, course };
  }

  if (course.status === "public") {
    return { mode: "enroll-available", actor, course };
  }

  return { mode: "restricted", course };
});
