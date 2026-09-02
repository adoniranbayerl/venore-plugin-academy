// Regra única de bloqueio de aula, extraída de shared/lesson-progress.ts (autorização) e
// features/progress/get-course-progress/service.ts (tela), que mantinham a mesma regra em
// paralelo — ver docs/venore-docks.md, plano da sessão que unificou as duas.
//
// Pura e síncrona: recebe fatos já carregados (ver lesson-chain-store.ts) e não toca banco, então
// autorizar uma aula custa O(1) consultas independente da posição dela na cadeia.

export type LessonChainFacts = {
  lessonId: string;
  readTextEnabled: boolean;
  textRead: boolean;
  watchVideoEnabled: boolean;
  videoWatched: boolean;
  quizEnabled: boolean;
  quizPassed: boolean;
  activityEnabled: boolean;
  activitiesSubmitted: boolean;
};

export type LessonChainState = {
  lessonId: string;
  completed: boolean;
  locked: boolean;
};

function isComplete(facts: LessonChainFacts): boolean {
  if (facts.readTextEnabled && !facts.textRead) return false;
  if (facts.watchVideoEnabled && !facts.videoWatched) return false;
  if (facts.quizEnabled && !facts.quizPassed) return false;
  if (facts.activityEnabled && !facts.activitiesSubmitted) return false;
  return true;
}

// orderedFacts precisa vir ordenado por position ascendente (responsabilidade de quem chama —
// ver lesson-chain-store.ts). "satisfeita" carrega completed E não-locked da aula anterior: uma
// aula sem lesson_requirements é trivialmente completa mesmo estando ela própria bloqueada (sua
// predecessora incompleta), e essa aula não pode sozinha liberar a próxima — precisa ser
// transitivo até a primeira aula da cadeia, não só o predecessor imediato.
export function computeLessonChain(orderedFacts: LessonChainFacts[]): LessonChainState[] {
  const result: LessonChainState[] = [];
  let previousSatisfied: boolean = true;

  for (const facts of orderedFacts) {
    const completed: boolean = isComplete(facts);
    const locked: boolean = !previousSatisfied;

    result.push({ lessonId: facts.lessonId, completed, locked });

    previousSatisfied = completed && !locked;
  }

  return result;
}
