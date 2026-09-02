import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Eye, Lock, Unlock } from "lucide-react";
import { calculateProgressPercent, getCourseProgress, listLessonsByCourse } from "../../index";
import { getAcademyCourseAccess } from "../../student/get-academy-course-access";
import { CourseAgendaCard, type CourseAgendaActivity } from "../../components/course-agenda-card";
import { CourseEffectivenessChart, type LessonScoreDatum } from "../../components/course-effectiveness-chart";
import { CourseLessonList } from "../../components/course-lesson-list";
import { CourseHero } from "../../components/course-hero";
import { loadDonations } from "../../shared/donations-bridge";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { OfflineCourseToggle } from "../../shared/offline-course-toggle";
import { EnrollSelfButton } from "./_components/enroll-self-button";

export const dynamic = "force-dynamic";

export default async function AcademyCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ blocked?: string }>;
}) {
  const { courseSlug } = await params;
  const { blocked } = await searchParams;
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
    redirect(`/academy/${access.slug}`);
  }

  const { course } = access;

  // Pedido de uma sessão anterior: "veja onde ele [Doações] cabe nas nossas páginas... pelo menos
  // na página de curso" — só a partir daqui (curso já visível de verdade: matriculado ou professor
  // revisando), não em enroll-available/restricted (chamada de doação não faz sentido antes do
  // aluno sequer ter acesso ao curso). Mesmo critério de "configurado" que o block usa
  // (donations-pix-teaser-block.tsx) — replicado aqui porque esta página é JSX fixo, não
  // composição de CMS, então não dá pra simplesmente soltar o block.
  const donations = await loadDonations();
  const donationSettingsResult = donations ? await donations.getDonationSettings() : null;
  const donationSettings = donationSettingsResult?.success ? donationSettingsResult.data : null;
  const showDonationTeaser = Boolean(donationSettings?.pixKey && donationSettings?.recipientName && donationSettings?.recipientCity);
  const DonationTeaser = donations?.DonationTeaser;
  const donationTeaser = showDonationTeaser && donationSettings && DonationTeaser && (
    <DonationTeaser
      title={donationSettings.academyCourseTitle}
      ctaLabel={donationSettings.academyCtaLabel}
      message={donationSettings.message}
      suggestedAmounts={donationSettings.suggestedAmounts}
      subtitleWithAmount={donationSettings.academyTeaserSubtitleWithAmount}
      subtitleNoAmount={donationSettings.academyTeaserSubtitleNoAmount}
      copy={donationSettings}
    />
  );

  if (access.mode === "restricted") {
    return (
      <div className="space-y-4">
        <CourseHero
          coverMediaId={course.coverMediaId}
          title={course.title}
          description={course.description}
          backHref="/academy"
          backLabel="Cursos"
          badge={{ icon: <Lock className="size-3" aria-hidden="true" />, label: "Acesso restrito" }}
        />
        <p className="rounded-panel border border-border bg-muted p-4 text-sm text-muted-foreground">
          Acesso restrito. Este curso não permite matrícula automática — fale com um administrador para ser
          matriculado.
        </p>
      </div>
    );
  }

  if (access.mode === "enroll-available") {
    return (
      <div className="space-y-4">
        <CourseHero
          coverMediaId={course.coverMediaId}
          title={course.title}
          description={course.description}
          backHref="/academy"
          backLabel="Cursos"
          badge={{ icon: <Unlock className="size-3" aria-hidden="true" />, label: "Matrícula disponível" }}
        />
        <EnrollSelfButton courseId={course.id} courseSlug={course.slug} />
      </div>
    );
  }

  if (access.mode === "preview") {
    const lessonsResult = await listLessonsByCourse({ courseId: course.id });
    if (!lessonsResult.success) {
      return <p className="text-sm text-destructive">Erro ao carregar aulas: {lessonsResult.error.message}</p>;
    }
    const lessons = lessonsResult.data;

    return (
      <div className="space-y-4">
        <CourseHero
          coverMediaId={course.coverMediaId}
          title={course.title}
          description={course.description}
          backHref="/academy"
          backLabel="Cursos"
          badge={{ icon: <Eye className="size-3" aria-hidden="true" />, label: "Pré-visualização" }}
        />
        <p className="rounded-panel border border-border bg-secondary p-3 text-sm text-secondary-foreground">
          Modo de visualização (professor) — todas as aulas aparecem liberadas, sem acompanhamento de progresso.
        </p>
        <section className="rounded-panel border border-border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">Aulas</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sua trilha, em ordem</p>
          {lessons.length === 0 ? (
            <EmptyState className="mt-3" title="Nenhuma aula cadastrada" />
          ) : (
            <div className="mt-4 overflow-hidden rounded-panel border border-border">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3.5 border-b border-border px-4 py-3.5 last:border-b-0 ui-motion-base hover:bg-muted/60"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground tabular-nums">
                    {lesson.position}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{lesson.title}</span>
                  <Link
                    href={`/academy/${course.slug}/${lesson.id}`}
                    className="shrink-0 rounded-sm text-sm font-medium text-primary outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Visualizar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
        {donationTeaser}
      </div>
    );
  }

  const progressResult = await getCourseProgress({ courseId: course.id });
  if (!progressResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar progresso: {progressResult.error.message}</p>;
  }

  const progress = progressResult.data;
  const progressPercent = calculateProgressPercent(progress.completedLessons, progress.totalLessons);

  // Cadeia é estritamente linear (computeLessonChain em shared/lesson-chain.ts): no máximo uma
  // aula fica "unlocked && !completed" por vez — é sempre a próxima ação do aluno.
  const currentLesson = progress.lessons.find((lesson) => !lesson.locked && !lesson.completed) ?? null;

  const agendaActivities: CourseAgendaActivity[] = [];
  if (currentLesson) {
    const { requirements } = currentLesson;
    if (requirements.readTextEnabled) {
      agendaActivities.push({ key: "text", label: "Ler o conteúdo da aula", done: requirements.textRead });
    }
    if (requirements.watchVideoEnabled) {
      agendaActivities.push({ key: "video", label: "Assistir o vídeo da aula", done: requirements.videoWatched });
    }
    if (requirements.quizEnabled) {
      agendaActivities.push({ key: "quiz", label: "Responder a avaliação da aula", done: requirements.quizPassed });
    }
  }

  // "Aproveitamento" só entra aulas com quiz — leitura/vídeo são feito/não-feito, sem nota real
  // pra plotar (decisão da sessão A4, ver AskUserQuestion). Progresso dessas aulas já aparece na
  // trilha abaixo.
  const quizScores: LessonScoreDatum[] = progress.lessons
    .filter((lesson) => lesson.requirements.quizEnabled)
    .map((lesson) => ({
      position: lesson.position,
      label: `Aula ${lesson.position}`,
      score: lesson.requirements.quizBestScore ?? 0,
      status: lesson.requirements.quizBestScore === null ? "not_attempted" : lesson.requirements.quizPassed ? "passed" : "failed",
    }));

  const gradedLessons = progress.lessons.filter((lesson) => lesson.requirements.quizBestGrade !== null);
  const averageGrade =
    gradedLessons.length > 0
      ? gradedLessons.reduce((sum, lesson) => sum + (lesson.requirements.quizBestGrade ?? 0), 0) / gradedLessons.length
      : null;

  const stats: string[] =
    progress.totalLessons > 0
      ? [
          `${progress.completedLessons}/${progress.totalLessons} concluídas`,
          ...(averageGrade !== null ? [`Nota média ${averageGrade.toFixed(1)}`] : []),
        ]
      : [];

  return (
    <div className="space-y-6">
      {blocked && (
        <p className="rounded-panel border border-warning-border bg-warning-soft p-3 text-sm text-warning">
          A aula que você tentou acessar está bloqueada. Complete as aulas anteriores para liberá-la.
        </p>
      )}

      <CourseHero
        coverMediaId={course.coverMediaId}
        title={course.title}
        description={course.description}
        backHref="/academy"
        backLabel="Cursos"
        stats={stats}
        badge={{ icon: <CheckCircle2 className="size-3" aria-hidden="true" />, label: "Matriculado" }}
      />

      {progress.totalLessons > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso do curso</span>
            <span className="font-medium text-foreground tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* PWA: baixar o curso pra ler offline. Só renderiza algo com o SW ativo (produção). */}
      {progress.lessons.length > 0 && (
        <OfflineCourseToggle
          courseId={course.id}
          paths={[`/academy/${course.slug}`, ...progress.lessons.map((lesson) => `/academy/${course.slug}/${lesson.lessonId}`)]}
        />
      )}

      {progress.lessons.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CourseAgendaCard
            courseSlug={course.slug}
            currentLesson={currentLesson ? { lessonId: currentLesson.lessonId, position: currentLesson.position, title: currentLesson.title } : null}
            activities={agendaActivities}
            className={quizScores.length === 0 ? "lg:col-span-2" : undefined}
          />

          {quizScores.length > 0 && (
            <div className="rounded-panel border border-border bg-card p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground">Aproveitamento</h3>
              <p className="mt-1 text-sm text-muted-foreground">Nota da avaliação por aula</p>
              <div className="mt-4">
                <CourseEffectivenessChart data={quizScores} />
              </div>
            </div>
          )}
        </div>
      )}

      <section className="rounded-panel border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Aulas</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sua trilha, em ordem</p>
        {progress.lessons.length === 0 ? (
          <EmptyState className="mt-3" title="Nenhuma aula cadastrada" />
        ) : (
          <div className="mt-4">
            <CourseLessonList courseSlug={course.slug} lessons={progress.lessons} />
          </div>
        )}
      </section>

      {donationTeaser}
    </div>
  );
}
