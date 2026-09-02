import type { OperationResult } from "@venore/plugin-sdk";

export type GetCourseProgressQuery = { courseId: string; actorId: string };
export type GetCourseProgressInput = Omit<GetCourseProgressQuery, "actorId">;

export type LessonProgressView = {
  lessonId: string;
  position: number;
  title: string;
  body: string | null;
  videoUrl: string | null;
  locked: boolean;
  completed: boolean;
  requirements: {
    readTextEnabled: boolean;
    textRead: boolean;
    watchVideoEnabled: boolean;
    videoWatched: boolean;
    quizEnabled: boolean;
    quizPassed: boolean;
    quizAttemptsUsed: number;
    quizMaxAttempts: number | null;
    quizBestScore: number | null;
    // Nota de 0 a 10 derivada de quizBestScore (deriveQuizGrade), só para exibição no histórico do aluno.
    quizBestGrade: number | null;
    activityEnabled: boolean;
    activitiesTotal: number;
    activitiesSubmittedCount: number;
    activitiesSubmitted: boolean;
  };
};

export type CourseProgressView = {
  courseId: string;
  lessons: LessonProgressView[];
  completedLessons: number;
  totalLessons: number;
  courseCompleted: boolean;
  // Marco sticky "trilha concluída": o aluno já passou pela trilha inteira uma vez, então todas
  // as aulas ficam destravadas de forma permanente ("material livre"). Diferente de
  // `courseCompleted`, que é o estado ao vivo e pode voltar a ser false (ex.: atividade devolvida).
  trailFreed: boolean;
};

export type GetCourseProgressResult = OperationResult<CourseProgressView>;
