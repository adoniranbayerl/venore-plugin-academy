import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

// Curso público + a contagem de aulas visíveis (não-draft), pra vitrine/home mostrarem "N aulas"
// sem uma segunda query por curso.
export type PublicCourseView = CourseRecord & { lessonCount: number };

// Sem query — usado pela vitrine pública (pedido desta sessão: "landing page pra vender os
// cursos"), acessível a visitante anônimo, então não recebe nem depende de actorId.
export type ListPublicCoursesResult = OperationResult<PublicCourseView[]>;
