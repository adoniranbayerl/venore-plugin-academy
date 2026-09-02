// Modelo próprio da Academy — não reaproveita EntryStatus do CMS (draft/scheduled/published/
// archived, com agendamento, ver contexts/cms/contracts/types.ts). Sem agendamento aqui, e o eixo
// semântico é diferente: quem pode acessar, não "quando fica visível".
// - draft: curso/aula visível só pra autor, editores, moderadores e admin (nunca pro aluno).
// - restricted: aluno vê e mantém progresso se já matriculado; matrícula só por admin/moderador
//   (enroll-self recusa — ver features/enrollments/enroll-self/service.ts).
// - public: qualquer aluno pode se matricular sozinho (enroll-self liberado).
export type AcademyStatus = "draft" | "restricted" | "public";

export type CourseStatus = AcademyStatus;
export type LessonStatus = AcademyStatus;

export type CourseRecord = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: CourseStatus;
  createdBy: string;
  publiclyListed: boolean;
  coverMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonRecord = {
  id: string;
  courseId: string;
  title: string;
  // DEPRECATED — texto da aula vive em LessonSectionRecord (page builder do CMS) desde esta
  // sessão, ver database/schema/index.ts. Sem novo consumidor.
  body: string | null;
  videoUrl: string | null;
  position: number;
  coverMediaId: string | null;
  // Independente do status do curso: uma aula "draft" fica fora da trilha/progresso mesmo num
  // curso restricted/public (ainda sendo escrita); "public" é a única aula visível sem matrícula
  // (amostra grátis) — ver AcademyLessonPage. "restricted" é o padrão de aula normal.
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
};

// Material digital anexo à aula (pedido desta sessão) — ver comentário em database/schema/
// index.ts. mediaId validado via contexts/media.getMediaAsset() na aplicação, sem FK cross-schema.
export type LessonMaterialRecord = {
  id: string;
  lessonId: string;
  mediaId: string;
  label: string;
  position: number;
  createdAt: Date;
};

export type LessonSectionRecord = {
  id: string;
  lessonId: string;
  position: number;
  title: string;
  cmsEntryId: string | null;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Exemplo sonoro/visual embutido no conteúdo da aula — ver comentário em database/schema/
// index.ts. audioMediaId/sheetMediaId validados via contexts/media.getMediaAsset() na aplicação,
// sem FK cross-schema; notationData é notação ABC renderizada via abcjs. Pelo menos um dos três é
// garantido não-nulo pelo check do banco.
export type LessonExampleRecord = {
  id: string;
  lessonId: string;
  title: string;
  audioMediaId: string | null;
  sheetMediaId: string | null;
  notationData: string | null;
  captionText: string;
  position: number;
  createdAt: Date;
};

export type LessonRequirementsRecord = {
  lessonId: string;
  readTextEnabled: boolean;
  watchVideoEnabled: boolean;
  quizEnabled: boolean;
  quizPassThresholdPercent: number | null;
  quizMaxAttempts: number | null;
  activityEnabled: boolean;
  updatedAt: Date;
};

// "text" | "audio" | "image" | "pdf" — formato de entrega esperado da atividade. "none": sem
// entrega nenhuma, o professor deixou a atividade como "faça e marque como concluída" (pedido
// desta sessão) — submitLessonActivity grava contentText/mediaId nulos os dois, sem exigir nada.
export type DeliverableFormat = "text" | "audio" | "image" | "pdf" | "none";

// Atividade prática da aula — ver comentário em database/schema/index.ts.
export type LessonActivityRecord = {
  id: string;
  lessonId: string;
  title: string;
  instructionsText: string;
  deliverableFormat: DeliverableFormat;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

// "pending": entregue, ainda sem revisão. "approved": professor aceitou. "needs_revision":
// professor pediu reenvio — reviewFeedback carrega o motivo. "rejected": professor reprovou a
// entrega (pedido desta sessão: "preciso de um botão para reprovado") — trava o requisito da
// aula exatamente como "needs_revision" (aluno pode reenviar e ser reavaliado), diferindo só no
// rótulo/registro pro professor: reprovação é uma avaliação negativa explícita, não um simples
// pedido de ajuste. Nenhuma revisão é definitiva — o professor sempre pode reavaliar uma entrega
// já revisada (reportado nesta sessão como "não consigo alterar minha decisão": não havia bloqueio
// real no service, só falta de clareza na UI de que reavaliar é possível).
export type SubmissionReviewStatus = "pending" | "approved" | "needs_revision" | "rejected";

// Entrega do aluno pra uma LessonActivityRecord — ver comentário em database/schema/index.ts.
// contentText só quando deliverableFormat = "text"; mediaId (contexts/media) pros outros
// formatos, sem FK cross-schema, validado na aplicação.
export type LessonActivitySubmissionRecord = {
  id: string;
  activityId: string;
  actorId: string;
  contentText: string | null;
  mediaId: string | null;
  reviewStatus: SubmissionReviewStatus;
  reviewFeedback: string | null;
  // Nota de 0 a 10 dada pelo professor — independente de reviewStatus, nunca preenchida em
  // deliverableFormat "none".
  reviewScore: number | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  // Aluno já viu a revisão atual — ver comentário em database/schema/index.ts.
  reviewSeenAt: Date | null;
  submittedAt: Date;
};

// "text": múltipla escolha comum. "audio": treino de ouvido — a pergunta e/ou as opções têm
// notação ABC tocável, e o aluno responde pelo que ouviu (ver database/schema/index.ts,
// docs/academy-recursos-musicais.md #2).
export type QuizQuestionKind = "text" | "audio";

export type QuizQuestionRecord = {
  id: string;
  lessonId: string;
  text: string;
  options: string[];
  // Array paralelo a `options` (mesmo comprimento) quando presente: entrada i = notação ABC
  // tocável da opção i, ou null pra opção só-texto. null no lugar do array inteiro = pergunta sem
  // áudio nas opções.
  optionNotations: (string | null)[] | null;
  correctOptionIndex: number;
  questionKind: QuizQuestionKind;
  // Notação ABC do enunciado ("ouça isto") — só em questionKind "audio", e nem sempre (a pergunta
  // pode ter o áudio só nas opções).
  promptNotation: string | null;
  createdAt: Date;
};

// Mesma forma de QuizQuestionRecord, sem correctOptionIndex — leitura de aluno respondendo o
// quiz, que não pode saber a resposta certa antes de responder (ver
// list-quiz-questions-for-student/service.ts). Mantém optionNotations/promptNotation: o aluno
// precisa deles pra tocar o áudio, e nenhum revela a resposta.
export type StudentQuizQuestionRecord = Omit<QuizQuestionRecord, "correctOptionIndex">;

export type QuizAnswer = { questionId: string; selectedOptionIndex: number };

export type QuizAttemptRecord = {
  id: string;
  lessonId: string;
  actorId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  answers: QuizAnswer[];
  createdAt: Date;
  invalidatedAt: Date | null;
};

export type EnrollmentRecord = {
  id: string;
  courseId: string;
  actorId: string;
  enrolledAt: Date;
  // "self" ou o actorId de quem matriculou manualmente.
  enrolledBy: string;
};

// "question" (dúvida) | "correction" (viu algo errado) — ver database/schema/index.ts
// (lessonMessageThreads) pra por que isso nunca muda depois de criado.
export type LessonMessageThreadType = "question" | "correction";
export type LessonMessageSenderRole = "student" | "teacher";

export type LessonMessageThreadRecord = {
  id: string;
  lessonId: string;
  stepKey: string;
  studentActorId: string;
  type: LessonMessageThreadType;
  createdAt: Date;
  lastMessageAt: Date;
};

export type LessonMessageRecord = {
  id: string;
  threadId: string;
  senderRole: LessonMessageSenderRole;
  senderActorId: string;
  body: string;
  createdAt: Date;
  readAt: Date | null;
};
