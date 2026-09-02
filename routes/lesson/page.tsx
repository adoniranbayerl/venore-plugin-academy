import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import {
  getCachedLesson,
  getCourseProgress,
  getLessonRequirements,
  listLessonActivitiesByLesson,
  listLessonActivitiesForStudent,
  listLessonExamplesByLesson,
  listLessonExamplesForStudent,
  listLessonMaterialsByLesson,
  listLessonMaterialsForStudent,
  listLessonSectionsByLesson,
  listLessonSectionsForStudent,
  listMessageThreads,
  listQuizQuestionsByLesson,
  listQuizQuestionsForStudent,
} from "../../index";
import type {
  LessonActivityRecord,
  LessonExampleRecord,
  LessonMaterialRecord,
  LessonRecord,
  LessonSectionRecord,
  StudentLessonActivityRecord,
  StudentQuizQuestionRecord,
} from "../../index";
import { getEntryComposition, type Composition } from "@venore/plugin-sdk/cms";
import { getMediaAsset } from "@venore/plugin-sdk/media";
import { getAcademyCourseAccess } from "../../student/get-academy-course-access";
import { loadDonations, type DonationsBarrel, type DonationPixCode, type DonationSettings } from "../../shared/donations-bridge";
import { BlockRenderer } from "@venore/plugin-sdk/page-builder";
import { LessonVideoEmbed } from "./_components/lesson-video-embed";
import { QuizForm } from "./_components/quiz-form";
import { PreviewQuizForm } from "./_components/preview-quiz-form";
import { DoneBadge, LessonMaterialsList, type LessonMaterialStepItem } from "./_components/lesson-materials";
import { LessonExamplesList, type LessonExampleStepItem } from "./_components/lesson-examples-list";
import { ActivitiesList, type ActivityStepItem } from "./_components/activity-form";
import { LessonStepFlow, type LessonFlowStep, type LessonStepReadMark } from "./_components/lesson-step-flow";
import { SpeakableSection } from "./_components/speakable-section";
import { markLessonSectionReadAction, markTextReadAction, markVideoWatchedAction } from "./actions";

type SectionItem = { id: string; title: string; composition: Composition; completed: boolean };
type ProgressMode = "live" | "preview" | "none";

// materials/sections vêm de dois caminhos diferentes conforme o modo da página: as versões
// "for-student" já anotam `completed` (progresso do próprio ator); as versões admin-only
// (list-lesson-*-by-lesson, usadas só no preview de professor) não têm esse conceito — por isso
// completed é opcional aqui e sempre cai pra false (preview nunca lê esse valor real mesmo,
// simula localmente no client — ver lesson-step-flow.tsx, ReadMarkAction "local").
async function resolveMaterialLinks(
  materials: (LessonMaterialRecord & { completed?: boolean })[],
): Promise<LessonMaterialStepItem[]> {
  const resolved = await Promise.all(
    materials.map(async (material) => {
      const mediaResult = await getMediaAsset({ id: material.mediaId });
      if (!mediaResult.success || !mediaResult.data) return null;
      return { id: material.id, label: material.label, url: mediaResult.data.url, completed: material.completed ?? false };
    }),
  );
  return resolved.filter((material) => material !== null);
}

// Texto da aula é composto por seções — cada uma uma entry oculta do CMS editada no page builder
// (/admin/cms/entries/{cmsEntryId}/builder). Seção sem cmsEntryId (só videoUrl, campo que o
// schema permite mas esta sessão não usa na autoria) não entra aqui.
async function resolveSectionContents(sections: (LessonSectionRecord & { completed?: boolean })[]): Promise<SectionItem[]> {
  const resolved = await Promise.all(
    sections.map(async (section) => {
      if (!section.cmsEntryId) return null;
      const compositionResult = await getEntryComposition({ id: section.cmsEntryId });
      if (!compositionResult.success || !compositionResult.data) return null;
      return { id: section.id, title: section.title, composition: compositionResult.data, completed: section.completed ?? false };
    }),
  );
  return resolved.filter((section) => section !== null);
}

async function resolveExampleLinks(examples: LessonExampleRecord[]): Promise<LessonExampleStepItem[]> {
  return Promise.all(
    examples.map(async (example) => {
      const [audioResult, sheetResult] = await Promise.all([
        example.audioMediaId ? getMediaAsset({ id: example.audioMediaId }) : null,
        example.sheetMediaId ? getMediaAsset({ id: example.sheetMediaId }) : null,
      ]);
      const audio = audioResult?.success ? audioResult.data : null;
      const sheet = sheetResult?.success ? sheetResult.data : null;
      return {
        id: example.id,
        title: example.title,
        captionText: example.captionText,
        audioUrl: audio?.url ?? null,
        sheetUrl: sheet?.url ?? null,
        sheetFilename: sheet?.filename ?? null,
        notationData: example.notationData,
      };
    }),
  );
}

// Preview de professor usa lessonActivities cru (sem submission — ninguém entregou nada em nome
// dele) — mesma ideia de resolveMaterialLinks/resolveSectionContents acima, completed/submission
// opcional cai pro estado vazio. mediaUrl resolvido via getMediaAsset (escopado) — funciona
// porque quem está vendo a própria entrega é sempre o dono do arquivo (uploadedBy === actorId).
async function resolveActivityItems(
  activities: (LessonActivityRecord & { submission?: StudentLessonActivityRecord["submission"] })[],
): Promise<ActivityStepItem[]> {
  return Promise.all(
    activities.map(async (activity) => {
      const media = activity.submission?.mediaId ? await getMediaAsset({ id: activity.submission.mediaId }) : null;
      return {
        id: activity.id,
        title: activity.title,
        instructionsText: activity.instructionsText,
        deliverableFormat: activity.deliverableFormat,
        submission: activity.submission
          ? {
              reviewStatus: activity.submission.reviewStatus,
              reviewFeedback: activity.submission.reviewFeedback,
              reviewScore: activity.submission.reviewScore,
              contentText: activity.submission.contentText,
              mediaUrl: media?.success && media.data ? media.data.url : null,
              mediaFilename: media?.success && media.data ? media.data.filename : null,
            }
          : null,
      };
    }),
  );
}

function buildVideoStep(url: string, readMark?: LessonStepReadMark): LessonFlowStep {
  return {
    id: "video",
    kicker: "Vídeo",
    readMark,
    content: (
      <div key="video" className="overflow-hidden rounded-lg border border-border">
        <LessonVideoEmbed url={url} />
      </div>
    ),
  };
}

function buildSectionStep(section: SectionItem, readMark?: LessonStepReadMark): LessonFlowStep {
  return {
    id: section.id,
    kicker: "Leitura",
    readMark,
    content: (
      <SpeakableSection key={section.id} title={section.title}>
        <BlockRenderer blocks={section.composition} mode="published" />
      </SpeakableSection>
    ),
  };
}

function buildTextFallbackStep(readMark: LessonStepReadMark): LessonFlowStep {
  return {
    id: "text-fallback",
    kicker: "Leitura",
    readMark,
    // "text-fallback" nunca é um stepKey válido pro sistema de mensagens (shared/lesson-messages-
    // store.ts) — é um caso legado (aula com readTextEnabled mas zero seções autoradas), não vale
    // dar um ponto de contato a uma etapa que tende a ser substituída por seções de verdade.
    allowMessages: false,
    content: (
      <p key="text-fallback" className="text-center text-sm text-muted-foreground">
        Marque esta aula como lida para acompanhar seu progresso.
      </p>
    ),
  };
}

function buildMaterialsStep(
  courseSlug: string,
  lessonId: string,
  materials: LessonMaterialStepItem[],
  progressMode: ProgressMode,
): LessonFlowStep {
  return {
    id: "materials",
    kicker: "Material complementar",
    content: (
      <LessonMaterialsList key="materials" courseSlug={courseSlug} lessonId={lessonId} materials={materials} progressMode={progressMode} />
    ),
  };
}

function buildExamplesStep(examples: LessonExampleStepItem[]): LessonFlowStep {
  return {
    id: "examples",
    kicker: "Exemplo sonoro",
    content: <LessonExamplesList key="examples" examples={examples} />,
  };
}

function buildActivityStep(courseSlug: string, lessonId: string, activities: ActivityStepItem[], interactive: boolean): LessonFlowStep {
  return {
    id: "activity",
    kicker: "Atividade prática",
    // Só em modo interativo (aluno matriculado) — preview de professor não tem "Avançar" travado
    // por nada, é só uma leitura das instruções (ver ramo `interactive ? ... : ...` do content).
    activityGate: interactive
      ? { totalCount: activities.length, initiallyCompleteIds: activities.filter((activity) => activity.submission !== null).map((activity) => activity.id) }
      : undefined,
    content: interactive ? (
      <ActivitiesList key="activity" courseSlug={courseSlug} lessonId={lessonId} activities={activities} />
    ) : (
      <div key="activity" className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="rounded-md border border-border px-3.5 py-3">
            <p className="text-sm font-medium text-foreground">{activity.title}</p>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{activity.instructionsText}</p>
          </div>
        ))}
        <p className="text-xs text-muted-foreground/56">
          Modo de visualização (professor) — nenhuma entrega é salva aqui.
        </p>
      </div>
    ),
  };
}

// Etapa dedicada à doação, ao final da sequência — pedido explícito desta sessão ("entre as
// etapas da lesson, crie uma etapa sobre a doação... com um pequeno texto falando que o material é
// gratuito"). Sem `readMark`: nunca bloqueia avançar, é só mais uma etapa que o aluno folheia como
// as outras (Anterior/Avançar). Isso reverte, de propósito e a pedido do usuário, a decisão da
// sessão anterior de nunca colocar doação "ao final de uma aula" (comentário em
// academy/[courseSlug]/page.tsx) — mantida como estava lá porque descreve por que aquele
// texto ficou daquele jeito, não porque ainda vale aqui.
// Compartilhado entre o modo "full" (aluno matriculado) e "preview" (professor revisando o
// próprio curso) — pedido desta sessão: professor também deve ver a etapa ao conferir a aula,
// não só quem está matriculado de verdade. Segue sem aparecer pra "amostra grátis"
// (FreeSampleLessonView), que nem chama esta função.
async function resolveDonationStep(): Promise<LessonFlowStep | null> {
  const donations = await loadDonations();
  const donationSettingsResult = donations ? await donations.getDonationSettings() : null;
  const donationSettings = donationSettingsResult?.success ? donationSettingsResult.data : null;
  const donationsConfigured = Boolean(
    donationSettings?.pixKey && donationSettings?.recipientName && donationSettings?.recipientCity,
  );
  if (!donations || !donationsConfigured || !donationSettings) {
    return null;
  }

  const donationCodeResult = await donations.buildDonationPixCode({ amount: donationSettings.suggestedAmounts[0] ?? null });
  return donationCodeResult.success
    ? buildDonationStep(donations.DonationWidget, donationSettings, donationCodeResult.data)
    : null;
}

function buildDonationStep(
  DonationWidget: DonationsBarrel["DonationWidget"],
  settings: DonationSettings,
  code: DonationPixCode,
): LessonFlowStep {
  return {
    id: "donation",
    kicker: "Apoie",
    allowMessages: false,
    // Pedido desta sessão: "Voltar ao curso"/"Próxima aula" acima do "Faça uma doação", não
    // abaixo (ver LessonFlowStep.navBeforeContent em lesson-step-flow.tsx).
    navBeforeContent: true,
    content: (
      <div key="donation" className="space-y-4">
        <p className="text-sm text-muted-foreground">{settings.academyLessonIntro}</p>
        <DonationWidget
          title={settings.title}
          message={settings.message}
          suggestedAmounts={settings.suggestedAmounts}
          initialCode={code}
          copy={settings}
        />
      </div>
    ),
  };
}

function buildQuizStep(content: ReactNode, badge: ReactNode): LessonFlowStep {
  return {
    // id continua "quiz" (não "avaliacao") — é a chave usada pelo sistema de mensagens
    // (lesson_message_threads.stepKey) e não deve mudar só porque o rótulo visível mudou (pedido
    // desta sessão: "quiz" → "Avaliação" na UI, sem tocar em dado já gravado).
    id: "quiz",
    kicker: "Avaliação",
    content: (
      <div key="quiz" className="space-y-3">
        {badge}
        {content}
      </div>
    ),
  };
}

export const dynamic = "force-dynamic";

// Cabeçalho compartilhado pelos três modos: só identidade da aula (voltar/título/aviso) — posição
// dentro da aula é responsabilidade só do LessonStepFlow abaixo, pra não duplicar duas barras de
// progresso com significados diferentes na mesma tela.
function LessonHeaderCard({ backHref, title, banner }: { backHref: string; title: string; banner?: ReactNode }) {
  return (
    <div className="space-y-4 rounded-panel border border-border bg-card ui-panel-padding-roomy shadow-panel">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="size-3.5" aria-hidden="true" />
        Curso
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">{title}</h1>
      {banner}
    </div>
  );
}

// Amostra grátis (visitante não matriculado, aula "public") — único modo sem interação real
// nenhuma, nem simulada: quem chega aqui ainda não decidiu se vai se matricular.
function FreeSampleLessonView({
  courseSlug,
  lesson,
  questions,
  materials,
  sections,
  examples,
}: {
  courseSlug: string;
  lesson: LessonRecord;
  questions: StudentQuizQuestionRecord[];
  materials: LessonMaterialStepItem[];
  sections: SectionItem[];
  examples: LessonExampleStepItem[];
}) {
  const steps: LessonFlowStep[] = [];
  if (lesson.videoUrl) steps.push(buildVideoStep(lesson.videoUrl));
  sections.forEach((section) => steps.push(buildSectionStep(section)));
  if (materials.length > 0) steps.push(buildMaterialsStep(courseSlug, lesson.id, materials, "none"));
  if (examples.length > 0) steps.push(buildExamplesStep(examples));
  if (questions.length > 0) {
    steps.push(
      buildQuizStep(
        <ul className="space-y-2">
          {questions.map((question) => (
            <li key={question.id} className="rounded-md border border-border px-3.5 py-2.5 text-sm">
              {question.text}
            </li>
          ))}
        </ul>,
        null,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <LessonHeaderCard
        backHref={`/academy/${courseSlug}`}
        title={lesson.title}
        banner={
          <p className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            Aula gratuita — matricule-se no curso para acompanhar o progresso e as demais aulas.
          </p>
        }
      />
      <LessonStepFlow steps={steps} courseHref={`/academy/${courseSlug}`} />
    </div>
  );
}

export default async function AcademyLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
  // openThread/openThreadType vêm do alerta de mensagem (badge no user-nav) e da inbox
  // (/academy/messages) — deep link direto pra etapa certa com o dialog já aberto (pedido desta
  // sessão: "eu preciso estar na etapa pra ver a resposta do professor").
  searchParams: Promise<{ blocked?: string; openThread?: string; openThreadType?: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const { blocked, openThread, openThreadType } = await searchParams;
  const autoOpenMessage = openThreadType === "question" || openThreadType === "correction" ? openThreadType : undefined;
  const access = await getAcademyCourseAccess(courseSlug);

  if (access.mode === "unauthenticated") {
    redirect("/api/auth/signin");
  }
  if (access.mode === "not-found") {
    notFound();
  }
  // URL antiga por id (UUID) ainda resolve o curso — redireciona pra URL canônica por slug em vez
  // de renderizar aqui (item 2 do pedido da sessão: "/academy/<uuid antigo> redireciona").
  if (access.mode === "redirect") {
    redirect(`/academy/${access.slug}/${lessonId}`);
  }
  // Sem matrícula e sem preview de professor, só uma aula "public" é acessível — amostra grátis
  // do curso (contracts/types.ts, LessonStatus). Qualquer outra aula redireciona pro curso, mesma
  // disciplina do bloqueio de lock-chain: checado no servidor, não só escondido na UI
  // (docs/venore-docks.md, item 5 do pedido desta sessão).
  if (access.mode === "restricted" || access.mode === "enroll-available") {
    const lessonResult = await getCachedLesson(lessonId);
    const lesson = lessonResult.success ? lessonResult.data : null;
    if (!lesson || lesson.courseId !== access.course.id || lesson.status !== "public") {
      redirect(`/academy/${courseSlug}`);
    }

    const quizResult = await listQuizQuestionsForStudent({ lessonId });
    const questions = quizResult.success ? quizResult.data : [];

    const materialsResult = await listLessonMaterialsForStudent({ lessonId });
    const materials = materialsResult.success ? await resolveMaterialLinks(materialsResult.data) : [];

    const sectionsResult = await listLessonSectionsForStudent({ lessonId });
    const sections = sectionsResult.success ? await resolveSectionContents(sectionsResult.data) : [];

    const examplesResult = await listLessonExamplesForStudent({ lessonId });
    const examples = examplesResult.success ? await resolveExampleLinks(examplesResult.data) : [];

    return (
      <FreeSampleLessonView
        courseSlug={courseSlug}
        lesson={lesson}
        questions={questions}
        materials={materials}
        sections={sections}
        examples={examples}
      />
    );
  }

  const { course } = access;

  // Preview de professor: precisa parecer igual ao que o aluno vê, sem gravar nada — o professor
  // normalmente não está matriculado no próprio curso, e as ações reais (mark-lesson-section-read
  // etc.) exigem matrícula como fronteira de segurança. "local" no ReadMarkAction simula a
  // interação inteira em estado do LessonStepFlow, sem round-trip ao servidor.
  if (access.mode === "preview") {
    const lessonResult = await getCachedLesson(lessonId);
    if (!lessonResult.success) {
      return <p className="text-sm text-destructive">Erro ao carregar aula: {lessonResult.error.message}</p>;
    }
    const lesson = lessonResult.data;
    if (!lesson || lesson.courseId !== course.id) {
      notFound();
    }

    const requirementsResult = await getLessonRequirements({ lessonId });
    const requirements = requirementsResult.success ? requirementsResult.data : null;

    const quizResult = requirements?.quizEnabled
      ? await listQuizQuestionsByLesson({ lessonId })
      : { success: true as const, data: [] };

    const materialsResult = await listLessonMaterialsByLesson({ lessonId });
    const materials = materialsResult.success ? await resolveMaterialLinks(materialsResult.data) : [];

    const sectionsResult = await listLessonSectionsByLesson({ lessonId });
    const sections = sectionsResult.success ? await resolveSectionContents(sectionsResult.data) : [];

    const examplesResult = await listLessonExamplesByLesson({ lessonId });
    const examples = examplesResult.success ? await resolveExampleLinks(examplesResult.data) : [];

    const activitiesResult = requirements?.activityEnabled
      ? await listLessonActivitiesByLesson({ lessonId })
      : { success: true as const, data: [] };
    const activities = activitiesResult.success ? await resolveActivityItems(activitiesResult.data) : [];

    const steps: LessonFlowStep[] = [];
    if (lesson.videoUrl) {
      steps.push(
        buildVideoStep(
          lesson.videoUrl,
          requirements?.watchVideoEnabled
            ? { mark: { kind: "local" }, completed: false, actionLabel: "Marcar vídeo como assistido", doneLabel: "Vídeo assistido" }
            : undefined,
        ),
      );
    }
    if (requirements?.readTextEnabled && sections.length === 0) {
      steps.push(
        buildTextFallbackStep({
          mark: { kind: "local" },
          completed: false,
          actionLabel: "Marcar texto como lido",
          doneLabel: "Texto lido",
          confirmBeforeAdvance: true,
        }),
      );
    }
    sections.forEach((section) =>
      steps.push(
        buildSectionStep(section, {
          mark: { kind: "local" },
          completed: section.completed,
          actionLabel: "Marcar como lida",
          doneLabel: "Lida",
          confirmBeforeAdvance: true,
        }),
      ),
    );
    if (materials.length > 0) steps.push(buildMaterialsStep(course.slug, lessonId, materials, "preview"));
    if (examples.length > 0) steps.push(buildExamplesStep(examples));
    if (activities.length > 0) steps.push(buildActivityStep(course.slug, lessonId, activities, false));
    if (requirements?.quizEnabled && quizResult.success && quizResult.data.length > 0) {
      steps.push(
        buildQuizStep(
          <PreviewQuizForm questions={quizResult.data} quizPassThresholdPercent={requirements.quizPassThresholdPercent ?? 70} />,
          null,
        ),
      );
    }
    const previewDonationStep = await resolveDonationStep();
    if (previewDonationStep) steps.push(previewDonationStep);

    return (
      <div className="space-y-6">
        <LessonHeaderCard
          backHref={`/academy/${course.slug}`}
          title={lesson.title}
          banner={
            <p className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground">
              Modo de visualização (professor) — a mesma tela do aluno, mas nada aqui é salvo na sua conta.
            </p>
          }
        />
        <LessonStepFlow steps={steps} courseHref={`/academy/${course.slug}`} />
      </div>
    );
  }

  const progressResult = await getCourseProgress({ courseId: course.id });
  if (!progressResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar progresso: {progressResult.error.message}</p>;
  }

  const progress = progressResult.data;
  const lesson = progress.lessons.find((item) => item.lessonId === lessonId);
  if (!lesson) {
    notFound();
  }

  // Bloqueio checado no servidor antes de montar qualquer conteúdo da aula — não é só a
  // listagem do curso escondendo o link (docs/venore-docks.md, item 3 do pedido desta sessão).
  if (lesson.locked) {
    const currentLesson = progress.lessons.find((item) => !item.locked && !item.completed);
    if (currentLesson) {
      redirect(`/academy/${course.slug}/${currentLesson.lessonId}?blocked=1`);
    }
    redirect(`/academy/${course.slug}?blocked=1`);
  }

  // progress.lessons já vem ordenado por position (getCourseProgress/loadLessonChain) — o próximo
  // item da lista é literalmente a próxima aula. Se ela ainda estiver bloqueada (requisitos desta
  // aula não cumpridos), a própria AcademyLessonPage redireciona de volta ao clicar (mesma lógica
  // de lock-chain acima), então não precisa checar lesson.locked aqui de novo.
  const lessonIndex = progress.lessons.findIndex((item) => item.lessonId === lessonId);
  const nextLesson = lessonIndex >= 0 ? progress.lessons[lessonIndex + 1] : undefined;
  const nextLessonHref = nextLesson ? `/academy/${course.slug}/${nextLesson.lessonId}` : null;

  const quizResult = lesson.requirements.quizEnabled
    ? await listQuizQuestionsForStudent({ lessonId })
    : { success: true as const, data: [] };

  const materialsResult = await listLessonMaterialsForStudent({ lessonId });
  const materials = materialsResult.success ? await resolveMaterialLinks(materialsResult.data) : [];

  const sectionsResult = await listLessonSectionsForStudent({ lessonId });
  const sections = sectionsResult.success ? await resolveSectionContents(sectionsResult.data) : [];

  const examplesResult = await listLessonExamplesForStudent({ lessonId });
  const examples = examplesResult.success ? await resolveExampleLinks(examplesResult.data) : [];

  const activitiesResult = lesson.requirements.activityEnabled
    ? await listLessonActivitiesForStudent({ lessonId })
    : { success: true as const, data: [] };
  const activities = activitiesResult.success ? await resolveActivityItems(activitiesResult.data) : [];

  const attemptsExhausted =
    lesson.requirements.quizMaxAttempts !== null &&
    !lesson.requirements.quizPassed &&
    lesson.requirements.quizAttemptsUsed >= lesson.requirements.quizMaxAttempts;

  const quizContent = lesson.requirements.quizPassed ? (
    <div className="space-y-0.5">
      <p className="text-sm text-muted-foreground">Você já passou nesta avaliação.</p>
      {lesson.requirements.quizBestGrade !== null && (
        <p className="text-xs text-muted-foreground/56">
          Nota: {lesson.requirements.quizBestGrade.toFixed(1)} ({lesson.requirements.quizBestScore}% de acerto)
        </p>
      )}
    </div>
  ) : !quizResult.success ? (
    <p className="text-sm text-destructive">Erro ao carregar a avaliação: {quizResult.error.message}</p>
  ) : (
    <QuizForm
      courseSlug={course.slug}
      lessonId={lessonId}
      questions={quizResult.data}
      attemptsExhausted={attemptsExhausted}
      courseHref={`/academy/${course.slug}`}
    />
  );

  const steps: LessonFlowStep[] = [];
  if (lesson.videoUrl) {
    steps.push(
      buildVideoStep(
        lesson.videoUrl,
        lesson.requirements.watchVideoEnabled
          ? {
              mark: { kind: "server", action: markVideoWatchedAction, fields: { courseSlug: course.slug, lessonId } },
              completed: lesson.requirements.videoWatched,
              actionLabel: "Marcar vídeo como assistido",
              doneLabel: "Vídeo assistido",
            }
          : undefined,
      ),
    );
  }
  // Fallback só quando a aula não tem nenhuma seção (ex: aula antiga que ainda não migrou pro
  // modelo de seções) — com seções, "ler o texto" passa a ser marcar cada seção na sua própria
  // etapa, então este passo de aula inteira sumiria como redundante. Sem isso, uma aula com
  // readTextEnabled e zero seções ficaria com o requisito impossível de cumprir.
  if (lesson.requirements.readTextEnabled && sections.length === 0) {
    steps.push(
      buildTextFallbackStep({
        mark: { kind: "server", action: markTextReadAction, fields: { courseSlug: course.slug, lessonId } },
        completed: lesson.requirements.textRead,
        actionLabel: "Marcar texto como lido",
        doneLabel: "Texto lido",
        confirmBeforeAdvance: true,
      }),
    );
  }
  sections.forEach((section) =>
    steps.push(
      buildSectionStep(section, {
        mark: {
          kind: "server",
          action: markLessonSectionReadAction,
          fields: { courseSlug: course.slug, lessonId, sectionId: section.id },
        },
        completed: section.completed,
        actionLabel: "Marcar como lida",
        doneLabel: "Lida",
        confirmBeforeAdvance: true,
      }),
    ),
  );
  if (materials.length > 0) steps.push(buildMaterialsStep(course.slug, lessonId, materials, "live"));
  if (examples.length > 0) steps.push(buildExamplesStep(examples));
  if (activities.length > 0) steps.push(buildActivityStep(course.slug, lessonId, activities, true));
  if (lesson.requirements.quizEnabled) {
    steps.push(buildQuizStep(quizContent, lesson.requirements.quizPassed ? <DoneBadge label="Concluída" /> : null));
  }

  // Mesmo critério "configurado" de academy/[courseSlug]/page.tsx (chave PIX + destinatário
  // preenchidos). Também entra no modo "preview" (ver resolveDonationStep, chamado lá em cima
  // nesta mesma função) — só a amostra grátis (FreeSampleLessonView) fica de fora. Código PIX
  // gerado uma vez aqui (primeiro valor sugerido, igual /donations) — o widget troca o próprio
  // código ao escolher outro valor, sem precisar de round-trip nesta página.
  const donationStep = await resolveDonationStep();
  if (donationStep) steps.push(donationStep);

  // Amostra grátis (FreeSampleLessonView) não chama resolveDonationStep — sem matrícula real nem
  // "pra quem" mandar a mensagem. threadsByStepKey só carrega unreadCount (LessonStepFlow só
  // precisa disso pro pontinho no botão) — histórico completo é lazy, via getLessonMessageThreadAction
  // quando o aluno abre o diálogo de uma etapa específica.
  const messageThreadsResult = await listMessageThreads({ lessonId });
  const messaging = {
    lessonId,
    threadsByStepKey: messageThreadsResult.success
      ? Object.fromEntries(messageThreadsResult.data.map((thread) => [thread.stepKey, { unreadCount: thread.unreadCount }]))
      : {},
  };

  return (
    <div className="space-y-6">
      {blocked && (
        <p className="rounded-panel border border-warning-border bg-warning-soft p-3 text-sm text-warning">
          A aula que você tentou acessar está bloqueada. Complete as aulas anteriores para liberá-la.
        </p>
      )}
      <LessonHeaderCard backHref={`/academy/${course.slug}`} title={lesson.title} />
      <LessonStepFlow
        steps={steps}
        courseHref={`/academy/${course.slug}`}
        nextLessonHref={nextLessonHref}
        messaging={messaging}
        initialStepId={openThread}
        autoOpenMessage={autoOpenMessage}
      />
    </div>
  );
}
