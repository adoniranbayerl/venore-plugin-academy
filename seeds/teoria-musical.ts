import type { OperationResult } from "@venore/plugin-sdk";
import { runCourseSeed } from "./shared/course-builder";
import { TEORIA_LESSONS } from "./teoria-musical.lessons";

// Curso real de teoria musical — conteúdo completo em docs/curso-teoria-musical.md. Monta uma
// versão navegável (curso + 19 aulas com seção de texto, exemplos de partitura, perguntas de
// treino de ouvido e uma atividade por aula) que o dono expande a partir do documento.

export function seedAcademyTeoriaMusical(): Promise<OperationResult<void>> {
  return runCourseSeed(
    {
      slug: "teoria-musical-na-pratica",
      title: "Teoria Musical na Prática — para quem já toca de ouvido",
      description:
        "Um caminho sem pressa da pulsação ao acorde de dominante. Você vai ouvir, cantar, bater o tempo " +
        "e reconhecer o que já toca — agora com nome. Sem partitura difícil: tudo por som, por dó-móvel " +
        "e por músicas que você conhece.",
      actorId: "system-seed",
    },
    TEORIA_LESSONS,
  );
}
