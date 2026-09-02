import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, jsonb, pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const academySchema = pgSchema("academy");

// createdBy é texto solto, sem FK pra auth.users: um plugin não pode importar
// contexts/auth/database/schema (regra 7 — "nunca de store, schema, database/client... vale
// tanto pra leitura quanto escrita"). Vale pra toda coluna actorId/createdBy deste schema.
export const courses = academySchema.table(
  "courses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    // Gerado do título na criação (slugify), editável depois — usado nas rotas públicas de aluno
    // em vez do id (item 2 do pedido da sessão de publish-course/slug/embed).
    slug: text("slug").notNull(),
    // "draft" | "restricted" | "public" — ver contracts/types.ts (CourseStatus/AcademyStatus).
    // Substitui o antigo "draft" | "published" + coluna self_enrollment_enabled (sessão A3):
    // restricted/public já carregam a regra de auto-matrícula, então o boolean separado virou
    // redundante — publiclyListed continua sendo o único eixo independente (visibilidade na
    // listagem, não quem pode acessar).
    status: text("status").notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    // Controla só a listagem (list-courses-for-student) — acesso direto por URL não depende
    // disso, só do status (draft nunca resolve via getCourseForStudent).
    publiclyListed: boolean("publicly_listed").notNull().default(true),
    // Aponta pro id de media.files (contexts/media) — nunca uma URL gravada aqui, sem FK
    // cross-schema pelo mesmo motivo de createdBy (comentário acima): validado via
    // contexts/media.getMedia() na aplicação, não no banco.
    coverMediaId: text("cover_media_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("courses_slug_idx").on(table.slug)],
);

export const lessons = academySchema.table(
  "lessons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    // title/videoUrl continuam flat (form simples, sem page builder) — "body" abaixo é
    // DEPRECATED de novo: o texto da aula passou a viver em lessonSections (ver abaixo), cada
    // seção uma entry oculta do CMS editada no page builder (pedido desta sessão — "cada seção
    // pode ser tratada como um conteúdo, só não aparece no CMS"). body fica sem novo consumidor,
    // mantido só pra não quebrar leituras antigas até uma sessão futura decidir dropar a coluna.
    title: text("title").notNull(),
    body: text("body"),
    videoUrl: text("video_url"),
    position: integer("position").notNull(),
    // Mesma regra de courses.coverMediaId acima: id de media.files, validado via getMedia() na
    // aplicação, sem FK cross-schema.
    coverMediaId: text("cover_media_id"),
    // "draft" | "restricted" | "public" — ver contracts/types.ts (LessonStatus). Default
    // "restricted" (não "draft"): diferente de curso, aula sempre nasceu imediatamente visível
    // dentro do curso que a contém — introduzir esconder-por-padrão aqui quebraria esse hábito e
    // criaria curso "publicado" sem nenhuma aula visível (publish-course não filtra por status de
    // aula ao validar "pelo menos uma aula"). "draft" continua existindo como estado explícito
    // (professor reescrevendo uma aula já publicada sem tirar o curso do ar).
    status: text("status").notNull().default("restricted"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (lesson) => [uniqueIndex("lessons_course_position_idx").on(lesson.courseId, lesson.position)],
);

// Seção da aula: texto (via cms entry, sempre oculta de /admin/cms/entries — internalOwner
// "academy" em contexts/cms/database/schema/index.ts), vídeo, ou os dois — nunca os dois nulos
// (check abaixo). Sem enum de "tipo" de propósito: nullable + check já exclui o estado inválido
// sem precisar de um terceiro campo redundante com os outros dois. Pedido desta sessão: "cada
// seção pode ser tratada como um conteúdo" — a entry por trás de cmsEntryId é uma entry de
// verdade (page builder funciona normal), só invisível na listagem editorial.
export const lessonSections = academySchema.table(
  "lesson_sections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    // Sem FK pra cms.entries (schema separado por domínio) — validado via
    // contexts/cms.getEntry()/createEntry() na aplicação (create-lesson-text-section/service.ts).
    cmsEntryId: text("cms_entry_id"),
    videoUrl: text("video_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (section) => [
    uniqueIndex("lesson_sections_lesson_position_idx").on(section.lessonId, section.position),
    check("lesson_sections_content_check", sql`${section.cmsEntryId} is not null or ${section.videoUrl} is not null`),
  ],
);

// 1:1 com lessons — lessonId é a própria PK, upsert em configure-lesson-requirements.
// Material digital anexo à aula (slides, apostila, planilha etc.) — pedido desta sessão: a aula
// precisava de um jeito de disponibilizar arquivo baixável além do texto (lessons.body) e vídeo
// (lessons.videoUrl). mediaId sem FK cross-schema pelo mesmo motivo de lessons.coverMediaId acima
// (validado via contexts/media.getMediaAsset() na aplicação). Múltiplos materiais por aula, cada
// um com rótulo próprio (ex: "Slides da aula 3") e posição pra ordenar a lista.
export const lessonMaterials = academySchema.table(
  "lesson_materials",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    mediaId: text("media_id").notNull(),
    label: text("label").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_materials_lesson_position_idx").on(table.lessonId, table.position)],
);

// Exemplo sonoro/visual embutido no conteúdo da aula, em uma de duas formas — nunca as duas ao
// mesmo tempo, ver check abaixo: (1) audioMediaId/sheetMediaId, um par de arquivo estático
// enviado por upload (áudio + imagem de partitura), sempre como um par numa única linha — nunca
// duas tabelas separadas — pra impedir o áudio e a partitura de um mesmo exemplo dessincronizarem
// (pedido do curso de teoria musical: as notas do áudio e da partitura têm que ser exatamente as
// mesmas); (2) notationData, notação ABC (string, ver https://abcnotation.com) renderizada e
// tocada no client via abcjs — aqui o sincronismo é estrutural por natureza (um source de verdade
// gera visual E áudio), então nem faz sentido guardar mediaId nenhum junto. Diferente de
// lessonMaterials (anexo pra download, lista solta no fim da aula): lessonExamples é renderizado
// inline, perto do trecho de texto que ele ilustra, por isso tem captionText obrigatório
// (descrição textual do que se ouve/vê — acessibilidade, ex: "sequência C4, D4, E4 em
// semínimas") em vez de um label curto. audioMediaId/sheetMediaId apontam pra media.files
// (contexts/media), sem FK cross-schema pelo mesmo motivo de lessons.coverMediaId acima —
// validado via contexts/media.getMediaAsset() na aplicação.
export const lessonExamples = academySchema.table(
  "lesson_examples",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    audioMediaId: text("audio_media_id"),
    sheetMediaId: text("sheet_media_id"),
    // Notação ABC (pedido desta sessão: "escrever partitura e mostrar pro aluno, que ele possa
    // clicar na nota e ouvir ela") — texto plano gerado pelo NotationEditor (admin, editor visual
    // nota-a-nota) e consumido pelo InteractiveNotation (aluno) via abcjs, a mesma lib nos dois
    // lados. Formato fixo: L:1/8 sempre no header (ver notation-abc.ts), então os tokens de
    // duração são sempre relativos a colcheia.
    notationData: text("notation_data"),
    captionText: text("caption_text").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("lesson_examples_lesson_position_idx").on(table.lessonId, table.position),
    check(
      "lesson_examples_media_check",
      sql`${table.audioMediaId} is not null or ${table.sheetMediaId} is not null or ${table.notationData} is not null`,
    ),
  ],
);

export const lessonRequirements = academySchema.table("lesson_requirements", {
  lessonId: text("lesson_id")
    .primaryKey()
    .references(() => lessons.id, { onDelete: "cascade" }),
  readTextEnabled: boolean("read_text_enabled").notNull().default(false),
  watchVideoEnabled: boolean("watch_video_enabled").notNull().default(false),
  quizEnabled: boolean("quiz_enabled").notNull().default(false),
  quizPassThresholdPercent: integer("quiz_pass_threshold_percent"),
  quizMaxAttempts: integer("quiz_max_attempts"),
  // Trilha só considera concluída quando toda lessonActivity da aula tem submissão com
  // reviewStatus != "needs_revision" (regra fica no service de progresso, não aqui) — mesmo
  // padrão de quizEnabled: o flag liga o gate, a tabela de submissão carrega o estado.
  activityEnabled: boolean("activity_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// questionKind = "text" (múltipla escolha comum) | "audio" (treino de ouvido: o aluno ouve algo
// e escolhe — ver docs/academy-recursos-musicais.md #2). options continua sendo só os RÓTULOS
// (string) — nenhuma migração de dado; promptNotation e optionNotations são colunas novas,
// nuláveis, que só a pergunta "audio" preenche. optionNotations, quando presente, é um array
// paralelo a options (mesmo comprimento): a entrada i é a notação ABC tocável da opção i, ou null
// pra opção que é só texto. promptNotation é o "ouça isto" da própria pergunta. A consistência
// ("audio" exige promptNotation OU ao menos uma optionNotation) é validada no handler/service, não
// no banco — depende de comparar colunas entre si de um jeito que um check() não expressa bem.
export const quizQuestions = academySchema.table("quiz_questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  optionNotations: jsonb("option_notations").$type<(string | null)[]>(),
  correctOptionIndex: integer("correct_option_index").notNull(),
  questionKind: text("question_kind").notNull().default("text"),
  promptNotation: text("prompt_notation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonTextCompletions = academySchema.table(
  "lesson_text_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_text_completions_lesson_actor_idx").on(table.lessonId, table.actorId)],
);

export const lessonVideoCompletions = academySchema.table(
  "lesson_video_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_video_completions_lesson_actor_idx").on(table.lessonId, table.actorId)],
);

// Progresso granular por seção (pedido desta sessão: acordion com "marcar como lida" por
// seção, não mais um único botão pra aula inteira). Quando readTextEnabled está ligado e todas
// as seções da aula ficam marcadas, mark-lesson-section-read também grava em
// lessonTextCompletions (cascata) — lesson-chain.ts/loadLessonChain continuam lendo só essa
// tabela, sem precisar saber que o "texto" agora é composto de seções.
export const lessonSectionCompletions = academySchema.table(
  "lesson_section_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectionId: text("section_id")
      .notNull()
      .references(() => lessonSections.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_section_completions_section_actor_idx").on(table.sectionId, table.actorId)],
);

// Progresso granular por material (pedido desta sessão) — "marcar como lido" por item de
// material complementar. Diferente de lessonSectionCompletions, não faz cascata pra nenhum
// requirement da aula: material é complementar/opcional por definição, nunca bloqueou a trilha
// (lesson-chain.ts não tem noção de "material"), então isso é só registro de leitura do aluno.
export const lessonMaterialCompletions = academySchema.table(
  "lesson_material_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    materialId: text("material_id")
      .notNull()
      .references(() => lessonMaterials.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_material_completions_material_actor_idx").on(table.materialId, table.actorId)],
);

export const quizAttempts = academySchema.table(
  "quiz_attempts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    score: integer("score").notNull(),
    passed: boolean("passed").notNull(),
    answers: jsonb("answers").$type<{ questionId: string; selectedOptionIndex: number }[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Reset de professor invalida em vez de apagar (auditoria — plano da sessão de reset de
    // tentativas). null = tentativa ativa, conta pro limite de quizMaxAttempts.
    invalidatedAt: timestamp("invalidated_at", { withTimezone: true }),
  },
  (table) => [
    // Parcial (só linhas ativas): permite a numeração de tentativa reiniciar em 1 depois de
    // um reset sem colidir com attempt_number de linhas antigas já invalidadas.
    uniqueIndex("quiz_attempts_lesson_actor_attempt_idx")
      .on(table.lessonId, table.actorId, table.attemptNumber)
      .where(sql`${table.invalidatedAt} is null`),
  ],
);

// Atividade prática da aula (tarefa que o aluno executa e entrega — ex: gravar um trecho
// cantado, fotografar uma partitura manuscrita). Metadado da tarefa em si; a entrega do aluno
// vive em lessonActivitySubmissions, mesma separação definição/execução de quizQuestions vs
// quizAttempts. deliverableFormat é texto solto (não enum de banco), mesma escolha já feita em
// courses.status/lessons.status acima — validado na camada de aplicação via
// contracts/types.ts (DeliverableFormat).
export const lessonActivities = academySchema.table(
  "lesson_activities",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    instructionsText: text("instructions_text").notNull(),
    deliverableFormat: text("deliverable_format").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_activities_lesson_position_idx").on(table.lessonId, table.position)],
);

// Entrega do aluno pra uma lessonActivity. contentText só quando deliverableFormat = "text";
// mediaId (media.files) pros outros formatos; os dois nulos quando deliverableFormat = "none"
// (pedido desta sessão: professor pode deixar a atividade sem exigir entrega nenhuma, aluno só
// marca como concluída). Essa regra depende de uma coluna de OUTRA tabela (lessonActivities.
// deliverableFormat), então não dá pra expressar como check() aqui — validado em
// submit-lesson-activity/service.ts, não no banco (mesma regra de "sem FK cross-schema" das
// colunas *MediaId acima). Reenvio SOBRESCREVE a entrega anterior em vez de acumular histórico
// (unique index em activityId+actorId) — diferente de quizAttempts, que guarda toda tentativa com
// nota: aqui não existe pontuação por tentativa, só "a entrega atual e seu status de revisão",
// então não há motivo pra manter versões antigas. reviewStatus/reviewFeedback/reviewScore/
// reviewedBy/reviewedAt cobrem o professor aprovar ou pedir revisão (com nota e apontamentos) —
// nullable porque toda entrega nasce "pending" sem nenhuma revisão ainda, EXCETO
// deliverableFormat "none": aí o próprio submit-lesson-activity/service.ts já grava "approved"
// na hora (pedido desta sessão — "marcar como concluída" não deveria depender de aprovação do
// professor, é auto-suficiente).
export const lessonActivitySubmissions = academySchema.table(
  "lesson_activity_submissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    activityId: text("activity_id")
      .notNull()
      .references(() => lessonActivities.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    contentText: text("content_text"),
    mediaId: text("media_id"),
    reviewStatus: text("review_status").notNull().default("pending"),
    reviewFeedback: text("review_feedback"),
    // Nota de 0 a 10 dada pelo professor na revisão (pedido desta sessão: "como professor eu
    // devo poder dar nota e apontar correções") — independente de reviewStatus, um approved pode
    // ou não ter nota, um needs_revision idem. Nunca preenchida em deliverableFormat "none" (não
    // há o que notar numa atividade sem entrega). Reseta pra null a cada reenvio (upsert), igual
    // reviewFeedback — nota velha não pode sobreviver a um conteúdo novo ainda não revisado.
    reviewScore: integer("review_score"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    // Aluno "viu" a revisão atual — null enquanto reviewedAt é null (nada pra ver ainda) e sempre
    // que o professor revisa de novo (pedido desta sessão: "aluno recebe atualização de nota e
    // comentário, precisa receber notificação" — reviewedAt IS NOT NULL AND reviewSeenAt IS NULL é
    // a condição de "alerta não visto" em shared/activity-review-store.ts). Marcado quando a etapa
    // de atividade mostra a entrega já revisada (activity-form.tsx via markActivityReviewSeenAction),
    // mesmo raciocínio de lessonMessages.readAt, só que uma coluna em vez de linha própria porque
    // aqui não há histórico de revisões, só a atual (reenvio já reseta review inteiro, ver acima).
    reviewSeenAt: timestamp("review_seen_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_activity_submissions_activity_actor_idx").on(table.activityId, table.actorId)],
);

export const enrollments = academySchema.table(
  "enrollments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
    // "self" (enroll-self) ou o actorId de quem matriculou manualmente (enroll-student).
    enrolledBy: text("enrolled_by").notNull(),
  },
  (table) => [uniqueIndex("enrollments_course_actor_idx").on(table.courseId, table.actorId)],
);

// Conversa entre aluno e professor por (aula, etapa, aluno) — pedido de sessão: "tirar dúvida" e
// "viu algo errado" no aluno, "corrigir trabalhos... enviar mensagens dentro dos trabalhos" no
// professor, unificados no mesmo sistema (uma conversa por etapa, a correção de atividade é só
// mais uma resposta nela). stepKey espelha LessonFlowStep.id do client (lesson-step-flow.tsx):
// "video" | "materials" | "examples" | "activity" | "quiz" | um lessonSections.id real — nunca
// "text-fallback"/"donation" (excluídos de propósito, ver contracts/types.ts). Sem FK pra
// stepKey: metade do espaço de valores não é linha nenhuma (são chaves sintéticas do client, não
// registros no banco), mesma razão de actorId/createdBy não terem FK no resto deste schema, só
// que por "nem sempre existe uma linha" em vez de "é de outro schema". type é fixado na criação
// (não muda depois): os dois botões do aluno abrem/reaproveitam a MESMA conversa se ela já
// existir, nunca duas conversas concorrentes por etapa.
export const lessonMessageThreads = academySchema.table(
  "lesson_message_threads",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    stepKey: text("step_key").notNull(),
    studentActorId: text("student_actor_id").notNull(),
    // "question" (dúvida) | "correction" (viu algo errado).
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Denormalizado a partir de lessonMessages.createdAt, mantido na mesma transação do insert de
    // mensagem (shared/lesson-messages-store.ts) — evita MAX()/GROUP BY em toda listagem de
    // inbox só pra ordenar por "conversa mais recente".
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_message_threads_lesson_step_student_idx").on(table.lessonId, table.stepKey, table.studentActorId)],
);

// Mensagem dentro de uma conversa — bidirecional (senderRole distingue quem escreveu). readAt é
// um carimbo só, não dois: marcado por quem NÃO enviou (o professor lê mensagem do aluno, o
// aluno lê mensagem do professor), então uma coluna cobre os dois sentidos porque cada linha já
// sabe o remetente.
export const lessonMessages = academySchema.table("lesson_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  threadId: text("thread_id")
    .notNull()
    .references(() => lessonMessageThreads.id, { onDelete: "cascade" }),
  // "student" | "teacher".
  senderRole: text("sender_role").notNull(),
  senderActorId: text("sender_actor_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

// Marco "trilha concluída" — pedido do dono: o curso fica com a cadeia de bloqueio até o aluno
// passar por TODAS as aulas uma vez; a partir daí vira "material livre" (qualquer aula, qualquer
// hora). É STICKY: uma vez gravada esta linha, loadLessonChain destrava tudo mesmo que uma aula
// volte a ficar incompleta depois (ex.: professor pede reenvio de atividade). Gravada por
// shared/progress-hooks.ts quando a cadeia inteira fica completa.
export const courseCompletions = academySchema.table(
  "course_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("course_completions_course_actor_idx").on(table.courseId, table.actorId)],
);

// Ofensiva de prática (gamificação leve). Uma linha por aluno por DIA de calendário em que ele
// fez algo relevante na Academy (marcou leitura, tentou quiz, entregou atividade). `day` é a
// data local do aluno (YYYY-MM-DD), calculada no cliente e enviada — a ofensiva conta dias, não
// timestamps. shared/practice-streak-store.ts lê/escreve; get-practice-streak calcula o número.
export const practiceDays = academySchema.table(
  "practice_days",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorId: text("actor_id").notNull(),
    day: date("day").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("practice_days_actor_day_idx").on(table.actorId, table.day)],
);

// Contador de repetições por exercício (gamificação — "exercitar todo dia"). Uma linha por
// tentativa concluída de um exercício repetível (hoje: "Cantar junto"). `exerciseKey` é estável
// POR CONTEÚDO (hash da melodia, sem o andamento) — sobrevive à reimportação do curso, que gera
// ids de bloco novos, e faz o mesmo trecho a 70 e a 80 BPM contar como o MESMO exercício.
// `score` é 0..100 (afinação certa %) ou null pra exercício sem nota. shared/exercise-practice-
// store.ts lê/escreve; a contagem e o recorde aparecem no próprio exercício e vão alimentar os
// rankings por exercício (fase seguinte).
export const exercisePractice = academySchema.table(
  "exercise_practice",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorId: text("actor_id").notNull(),
    exerciseKey: text("exercise_key").notNull(),
    score: integer("score"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("exercise_practice_actor_key_idx").on(table.actorId, table.exerciseKey)],
);
