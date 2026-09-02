import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, BookOpen, Flame, GraduationCap, MessageCircle, Sparkles, Target, TrendingUp } from "lucide-react";
import {
  StudentCourseCard,
  calculateProgressPercent,
  getCourseProgress,
  getPracticeStreak,
  listCoursesForStudent,
  listLessonsByCourse,
  listMessageThreads,
  type CourseForStudentView,
  type GetCourseProgressResult,
} from "../../index";
import { getAcademyStudentPageData } from "../../student/get-academy-student-page-data";
import { loadDonations } from "../../shared/donations-bridge";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { PushToggle } from "@venore/plugin-sdk/ui";
import { Card, CardContent } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";

export const dynamic = "force-dynamic";

type ContinueTarget = { courseSlug: string; courseTitle: string; lessonId: string; lessonPosition: number; lessonTitle: string };

export default async function AcademyCoursesPage() {
  const gate = await getAcademyStudentPageData();

  if (!gate.granted && gate.reason === "plugin_disabled") {
    notFound();
  }
  if (!gate.granted) {
    redirect("/api/auth/signin");
  }

  const coursesResult = await listCoursesForStudent();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Cursos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cursos disponíveis para você.</p>
      </div>

      {!coursesResult.success && (
        <p className="text-sm text-destructive">Erro ao carregar cursos: {coursesResult.error.message}</p>
      )}

      {coursesResult.success && coursesResult.data.length === 0 && (
        <EmptyState
          icon={<BookOpen className="size-8" strokeWidth={1.5} />}
          title="Nenhum curso disponível no momento"
          description="Volte mais tarde — novos cursos aparecem aqui assim que forem publicados."
        />
      )}

      {coursesResult.success && coursesResult.data.length > 0 && <Dashboard courses={coursesResult.data} />}
    </div>
  );
}

async function Dashboard({ courses }: { courses: CourseForStudentView[] }) {
  const enrolledCourses = courses.filter((course) => course.enrolled);

  const [lessonCounts, progresses, donationSettings, unreadMessageCount, streakResult] = await Promise.all([
    Promise.all(courses.map((course) => listLessonsByCourse({ courseId: course.id }))),
    Promise.all(
      courses.map((course) => (course.enrolled ? getCourseProgress({ courseId: course.id }) : Promise.resolve(null))),
    ),
    resolveDonationSettings(),
    resolveUnreadMessageCount(),
    getPracticeStreak(),
  ]);

  const streakDays = streakResult.success ? streakResult.data.current : 0;

  return (
    <div className="space-y-8">
      {/* Alerta de mensagem nova (pedido desta sessão) — no topo, antes de tudo o mais: é a coisa
          mais sensível ao tempo da página (resposta do professor esperando o aluno). */}
      {unreadMessageCount > 0 && (
        <Link
          href="/academy/messages"
          className="flex items-center gap-3 rounded-panel border border-warning-border bg-warning-soft p-3 text-sm text-warning outline-none ui-motion-base hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
          Você tem {unreadMessageCount} {unreadMessageCount === 1 ? "mensagem nova" : "mensagens novas"} do professor.
          <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
        </Link>
      )}

      {/* Opt-in de notificações push (PWA) — só renderiza algo em navegador com suporte e some se
          o usuário já ativou ou o navegador não suporta. */}
      <PushToggle />

      {/* Ofensiva de prática (pedido desta sessão: "gamificação cria engajamento, ofensiva/streak
          também"). Só aparece com sequência viva (>= 1 dia) — nada de nagar aluno novo. Regra
          perdoadora: faltar um dia não zera (ver shared/practice-streak.ts). */}
      {streakDays >= 1 && (
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/14 px-3 py-1.5 text-sm font-medium text-primary">
          <Flame className="size-4" aria-hidden="true" />
          {streakDays} {streakDays === 1 ? "dia de prática" : "dias seguidos de prática"}
        </span>
      )}

      {enrolledCourses.length > 0 && <PerformanceSummary courses={courses} progresses={progresses} />}
      <RecommendedCourses courses={courses} />

      <div>
        <h2 className="text-lg font-semibold text-foreground">Todos os cursos</h2>
        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-3 sm:gap-4">
          {courses.map((course, index) => {
            const lessonCountResult = lessonCounts[index];
            const lessonCount = lessonCountResult.success ? lessonCountResult.data.length : 0;
            const progressResult = progresses[index];
            const progressPercent =
              progressResult && progressResult.success && progressResult.data.totalLessons > 0
                ? calculateProgressPercent(progressResult.data.completedLessons, progressResult.data.totalLessons)
                : null;

            return (
              <StudentCourseCard key={course.id} course={course} lessonCount={lessonCount} progressPercent={progressPercent} />
            );
          })}
        </div>
      </div>

      {/* Pedido desta sessão: "inclua nas páginas do Academy... seja estratégico" — fica depois do
          catálogo inteiro, nunca acima (quem chega na página quer ver os cursos primeiro, não uma
          pedido de doação antes de qualquer conteúdo). Só alcança quem rolou a página inteira. */}
      {donationSettings && (
        <donationSettings.Teaser
title={donationSettings.settings.academyCatalogTitle}
          ctaLabel={donationSettings.settings.academyCtaLabel}
          message={donationSettings.settings.message}
          suggestedAmounts={donationSettings.settings.suggestedAmounts}
          subtitleWithAmount={donationSettings.settings.academyTeaserSubtitleWithAmount}
          subtitleNoAmount={donationSettings.settings.academyTeaserSubtitleNoAmount}
          copy={donationSettings.settings}
        />
      )}
    </div>
  );
}

// Mesmo critério "configurado" de academy/[courseSlug]/page.tsx (chave PIX + destinatário
// preenchidos), replicado aqui pelo mesmo motivo: página JSX fixa, não composição de CMS, não dá
// pra soltar o block donations.pix-teaser.
async function resolveDonationSettings() {
  const donations = await loadDonations();
  if (!donations) return null;
  const result = await donations.getDonationSettings();
  const settings = result.success ? result.data : null;
  const configured = Boolean(settings?.pixKey && settings?.recipientName && settings?.recipientCity);
  return configured && settings ? { Teaser: donations.DonationTeaser, settings } : null;
}

// Inbox inteira (todos os cursos) só pra somar o total — a lista de verdade fica em
// /academy/messages, este banner é só o alerta.
async function resolveUnreadMessageCount(): Promise<number> {
  const result = await listMessageThreads({});
  if (!result.success) return 0;
  return result.data.reduce((sum, thread) => sum + thread.unreadCount, 0);
}

// "Aproveitamento" (pedido desta sessão: dashboard com "lista de todos os cursos matriculados,
// aproveitamento, indicações") agrega o que já existe por curso (ver [courseSlug]/page.tsx) em vez
// de recalcular do zero: soma completedLessons/totalLessons de getCourseProgress por curso
// matriculado, e a nota média vem das mesmas lessons com quizBestGrade que a página de curso já
// usa. "Continuar de onde parou" pega a primeira lesson "unlocked && !completed" do primeiro curso
// matriculado ainda não concluído — mesmo critério de "próxima ação do aluno" da página de curso,
// só que escolhendo entre múltiplos cursos em vez de um só.
function PerformanceSummary({
  courses,
  progresses,
}: {
  courses: CourseForStudentView[];
  progresses: (GetCourseProgressResult | null)[];
}) {
  let totalLessons = 0;
  let completedLessons = 0;
  let gradeSum = 0;
  let gradeCount = 0;
  let target: ContinueTarget | null = null;

  for (let index = 0; index < courses.length; index++) {
    const result = progresses[index];
    if (!result || !result.success) continue;

    totalLessons += result.data.totalLessons;
    completedLessons += result.data.completedLessons;

    for (const lesson of result.data.lessons) {
      if (lesson.requirements.quizBestGrade !== null) {
        gradeSum += lesson.requirements.quizBestGrade;
        gradeCount++;
      }
    }

    if (!target) {
      const currentLesson = result.data.lessons.find((lesson) => !lesson.locked && !lesson.completed);
      if (currentLesson) {
        target = {
          courseSlug: courses[index].slug,
          courseTitle: courses[index].title,
          lessonId: currentLesson.lessonId,
          lessonPosition: currentLesson.position,
          lessonTitle: currentLesson.title,
        };
      }
    }
  }

  const overallPercent = totalLessons > 0 ? calculateProgressPercent(completedLessons, totalLessons) : null;
  const averageGrade = gradeCount > 0 ? gradeSum / gradeCount : null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      <Card>
        <CardContent className="flex items-center gap-3.5 pt-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/14 text-primary">
            <TrendingUp className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-foreground tabular-nums">{overallPercent ?? 0}%</p>
            <p className="text-xs text-muted-foreground">Aproveitamento geral</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3.5 pt-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/14 text-primary">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-foreground tabular-nums">{completedLessons}/{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Aulas concluídas</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3.5 pt-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/14 text-primary">
            <Target className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-foreground tabular-nums">{averageGrade !== null ? averageGrade.toFixed(1) : "—"}</p>
            <p className="text-xs text-muted-foreground">Nota média nas avaliações</p>
          </div>
        </CardContent>
      </Card>

      {target && (
        <Card className="border-primary/30 bg-primary/5 lg:col-span-3">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-caps text-primary uppercase">Continuar de onde parou</p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {target.courseTitle} — Aula {target.lessonPosition}: {target.lessonTitle}
              </p>
            </div>
            <Button asChild size="sm">
              <Link href={`/academy/${target.courseSlug}/${target.lessonId}`}>
                Continuar <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// "Indicações" (esclarecido nesta sessão como recomendações de próximo passo, não convite/
// referral entre alunos — não existe esse sistema no projeto): cursos públicos em que o aluno
// ainda não está matriculado, um convite simples a explorar mais do catálogo.
function RecommendedCourses({ courses }: { courses: CourseForStudentView[] }) {
  const recommended = courses.filter((course) => !course.enrolled && course.status === "public").slice(0, 3);
  if (recommended.length === 0) return null;

  return (
    <div>
      <h2 className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
        <Sparkles className="size-4 text-primary" aria-hidden="true" /> Recomendado pra você
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommended.map((course) => (
          <Link key={course.id} href={`/academy/${course.slug}`} className="group block">
            <Card className="h-full transition-shadow group-hover:shadow-float">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-foreground">{course.title}</p>
                {course.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{course.description}</p>}
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                  Conhecer <ArrowRight className="size-3" aria-hidden="true" />
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
