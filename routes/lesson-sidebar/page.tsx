import {
  LessonTrail,
  getCourseProgress,
  listLessonsByCourse,
  type LessonTrailItem,
} from "../../index";
import { getAcademyCourseAccess } from "../../student/get-academy-course-access";
import { loadDonations } from "../../shared/donations-bridge";

export const dynamic = "force-dynamic";

// Slot paralelo @sidebarContextual (item 5 do pedido da sessão) — mesma checagem de acesso da
// página de aula (getAcademyCourseAccess), só que aqui a trilha nunca bloqueia nada: se o acesso
// não permite ver a aula, o slot só não renderiza (a página principal já cuida do redirect).
export default async function LessonTrailSlot({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const access = await getAcademyCourseAccess(courseSlug);

  if (access.mode !== "full" && access.mode !== "preview") {
    return null;
  }

  const { course } = access;

  // Doação por baixo da trilha — companheiro quieto e sempre no mesmo lugar na coluna contextual,
  // nunca bloqueia nem aparece como checkpoint de conclusão. Complementar à etapa de doação dentro
  // do próprio LessonStepFlow (academy/[courseSlug]/[lessonId]/page.tsx, buildDonationStep): aquela
  // é uma etapa que o aluno folheia como as outras; esta é visível o tempo todo, sem precisar
  // navegar até lá. Entra tanto no modo "full" (aluno matriculado) quanto "preview" (professor
  // revisando o próprio curso) — mesmo critério das outras duas superfícies de doação do academy.
  const donations = await loadDonations();
  const donationSettingsResult = donations ? await donations.getDonationSettings() : null;
  const donationSettings = donationSettingsResult?.success ? donationSettingsResult.data : null;
  const showDonationTeaser = Boolean(donationSettings?.pixKey && donationSettings?.recipientName && donationSettings?.recipientCity);
  const DonationTeaser = donations?.DonationTeaser;
  const donationTeaser = showDonationTeaser && donationSettings && DonationTeaser && (
    <DonationTeaser
      title={donationSettings.academySidebarTitle}
      ctaLabel={donationSettings.academyCtaLabel}
      message={donationSettings.message}
      suggestedAmounts={donationSettings.suggestedAmounts}
      subtitleWithAmount={donationSettings.academyTeaserSubtitleWithAmount}
      subtitleNoAmount={donationSettings.academyTeaserSubtitleNoAmount}
      copy={donationSettings}
    />
  );

  if (access.mode === "preview") {
    const lessonsResult = await listLessonsByCourse({ courseId: course.id });
    if (!lessonsResult.success) return null;

    const items: LessonTrailItem[] = lessonsResult.data.map((lesson) => ({
      id: lesson.id,
      position: lesson.position,
      title: lesson.title,
      state: lesson.id === lessonId ? "current" : "unlocked",
    }));

    return (
      <div className="flex flex-col gap-4 lg:sticky lg:top-8">
        <LessonTrail courseSlug={course.slug} items={items} />
        {donationTeaser}
      </div>
    );
  }

  const progressResult = await getCourseProgress({ courseId: course.id });
  if (!progressResult.success) return null;

  const items: LessonTrailItem[] = progressResult.data.lessons.map((lesson) => {
    const state: LessonTrailItem["state"] = lesson.locked
      ? "locked"
      : lesson.completed
        ? "completed"
        : lesson.lessonId === lessonId
          ? "current"
          : "unlocked";
    return { id: lesson.lessonId, position: lesson.position, title: lesson.title, state };
  });

  // sticky no wrapper, não só no <nav> interno da LessonTrail (que já é sticky top-8 sozinho) —
  // bug reportado nesta sessão: com os dois em fluxo normal dentro do mesmo pai, o <nav> colado
  // tinha espaço pra "andar" até o fundo do pai (que é mais alto que ele, por causa do card de
  // doação embaixo) e deslizava por cima do card ao rolar. Com o wrapper também sticky no mesmo
  // top-8, ele gruda primeiro — a partir daí a posição do <nav> filho já bate exatamente com onde
  // ele grudaria sozinho, então a colagem dele vira um no-op e os dois se movem juntos, sem
  // sobrepor nada. Não mexe em LessonTrail (componente do plugin academy, reaproveitado em outros
  // lugares) — o ajuste fica só aqui, na composição desta página.
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-8">
      <LessonTrail courseSlug={course.slug} items={items} />
      {donationTeaser}
    </div>
  );
}
