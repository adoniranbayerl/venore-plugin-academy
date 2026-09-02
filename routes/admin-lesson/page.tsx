import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, FileText, HelpCircle, ListChecks, Music } from "lucide-react";
import { getMediaAsset } from "@venore/plugin-sdk/media";
import {
  getCachedLesson,
  getLessonRequirements,
  listLessonActivitiesByLesson,
  listLessonExamplesByLesson,
  listLessonMaterialsByLesson,
  listLessonSectionsByLesson,
  listQuizQuestionsByLesson,
} from "../../index";
import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import { AdminAccessDenied } from "@venore/plugin-sdk/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@venore/plugin-sdk/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { LessonRequirementsForm } from "./_components/lesson-requirements-form";
import { AddQuizQuestionForm } from "./_components/add-quiz-question-form";
import { LessonCoverForm } from "./_components/lesson-cover-form";
import { LessonStatusForm } from "./_components/lesson-status-form";
import { LessonContentForm } from "./_components/lesson-content-form";
import { LessonMaterialsSection, type LessonMaterialView } from "./_components/lesson-materials-section";
import { LessonSectionsManager } from "./_components/lesson-sections-manager";
import { LessonActivitiesSection } from "./_components/lesson-activities-section";
import { LessonExamplesSection } from "./_components/lesson-examples-section";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getPluginAdminPageData("academy");

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para gerenciar a Academy." />;
  }

  const lessonResult = await getCachedLesson(id);
  if (!lessonResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar esta aula agora. Tente recarregar a página.</p>;
  }

  const lesson = lessonResult.data;
  if (!lesson) {
    notFound();
  }

  const [requirementsResult, questionsResult, materialsResult, sectionsResult, activitiesResult, examplesResult] = await Promise.all([
    getLessonRequirements({ lessonId: id }),
    listQuizQuestionsByLesson({ lessonId: id }),
    listLessonMaterialsByLesson({ lessonId: id }),
    listLessonSectionsByLesson({ lessonId: id }),
    listLessonActivitiesByLesson({ lessonId: id }),
    listLessonExamplesByLesson({ lessonId: id }),
  ]);

  if (!requirementsResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar os requisitos desta aula agora. Tente recarregar a página.</p>;
  }
  if (!questionsResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as perguntas da avaliação agora. Tente recarregar a página.</p>;
  }
  if (!materialsResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar os materiais desta aula agora. Tente recarregar a página.</p>;
  }
  if (!sectionsResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as seções desta aula agora. Tente recarregar a página.</p>;
  }
  if (!activitiesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as atividades desta aula agora. Tente recarregar a página.</p>;
  }
  if (!examplesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar os exemplos desta aula agora. Tente recarregar a página.</p>;
  }

  const requirements = requirementsResult.data;
  const questions = questionsResult.data;
  const activities = activitiesResult.data;

  const coverMediaResult = lesson.coverMediaId ? await getMediaAsset({ id: lesson.coverMediaId }) : null;
  const coverMedia =
    coverMediaResult?.success && coverMediaResult.data
      ? {
          id: coverMediaResult.data.id,
          filename: coverMediaResult.data.filename,
          url: coverMediaResult.data.url,
          contentType: coverMediaResult.data.contentType,
        }
      : null;

  const materials: LessonMaterialView[] = await Promise.all(
    materialsResult.data.map(async (material) => {
      const mediaResult = await getMediaAsset({ id: material.mediaId });
      const media = mediaResult.success ? mediaResult.data : null;
      return {
        id: material.id,
        label: material.label,
        mediaUrl: media?.url ?? null,
        mediaFilename: media?.filename ?? null,
      };
    }),
  );

  const examples = await Promise.all(
    examplesResult.data.map(async (example) => {
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

  const statPills: { label: string; count: number }[] = [
    { label: "seções", count: sectionsResult.data.length },
    { label: "materiais", count: materials.length },
    { label: "exemplos", count: examples.length },
    { label: "atividades", count: activities.length },
    { label: "perguntas", count: questions.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/academy/courses/${lesson.courseId}`}
          className="rounded-sm text-xs font-medium text-muted-foreground/56 outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Curso
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">
          Aula {lesson.position}: {lesson.title}
        </h1>
        {lesson.videoUrl && (
          <p className="mt-2 text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">Com vídeo</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <LessonStatusForm lessonId={lesson.id} courseId={lesson.courseId} status={lesson.status} />
          <div className="flex flex-wrap items-center gap-1.5">
            {statPills.map((pill) => (
              <span
                key={pill.label}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground tabular-nums"
              >
                {pill.count} {pill.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="conteudo">
        <div className="overflow-x-auto">
          <TabsList className="w-fit">
            <TabsTrigger value="conteudo" className="shrink-0">
              <FileText aria-hidden="true" /> Conteúdo
            </TabsTrigger>
            <TabsTrigger value="midia" className="shrink-0">
              <Music aria-hidden="true" /> Mídia
            </TabsTrigger>
            <TabsTrigger value="atividade" className="shrink-0">
              <ClipboardCheck aria-hidden="true" /> Atividade
            </TabsTrigger>
            <TabsTrigger value="requisitos" className="shrink-0">
              <ListChecks aria-hidden="true" /> Requisitos &amp; avaliação
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="conteudo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conteúdo da aula</CardTitle>
            </CardHeader>
            <CardContent>
              <LessonContentForm lessonId={id} title={lesson.title} videoUrl={lesson.videoUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Seções de texto</CardTitle>
            </CardHeader>
            <CardContent>
              <LessonSectionsManager lessonId={id} sections={sectionsResult.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Capa da aula</CardTitle>
            </CardHeader>
            <CardContent>
              <LessonCoverForm key={lesson.coverMediaId ?? "none"} lessonId={id} coverMedia={coverMedia} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="midia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Material digital</CardTitle>
            </CardHeader>
            <CardContent>
              <LessonMaterialsSection lessonId={id} materials={materials} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exemplos sonoros/partitura</CardTitle>
            </CardHeader>
            <CardContent>
              <LessonExamplesSection lessonId={id} examples={examples} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividade">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Atividade prática</CardTitle>
            </CardHeader>
            <CardContent>
              <LessonActivitiesSection lessonId={id} activities={activities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requisitos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Requisitos de conclusão</CardTitle>
            </CardHeader>
            <CardContent>
              {/* key força remount quando requirements muda (após revalidatePath do submit) — o
                  formulário guarda estado local (checkbox de quiz controlado, defaultChecked/
                  defaultValue dos demais campos) que só é inicializado a partir da prop no mount;
                  sem essa key, ele nunca resincroniza com o banco até um reload manual (bug corrigido
                  nesta sessão — docs/venore-docks.md). */}
              <LessonRequirementsForm
                key={JSON.stringify(requirements)}
                lessonId={id}
                hasVideoUrl={lesson.videoUrl !== null}
                hasLessonActivity={activities.length > 0}
                requirements={requirements}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Perguntas da avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions.length === 0 ? (
                <EmptyState
                  icon={<HelpCircle className="size-8" strokeWidth={1.5} />}
                  title="Nenhuma pergunta cadastrada"
                  description="Adicione a primeira pergunta da avaliação abaixo."
                />
              ) : (
                <ul className="space-y-2">
                  {questions.map((question) => (
                    <li key={question.id} className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{question.text}</p>
                      <ul className="mt-1 ml-4 list-disc">
                        {question.options.map((option, index) => (
                          <li key={index} className={index === question.correctOptionIndex ? "font-medium text-success" : ""}>
                            {option}
                            {index === question.correctOptionIndex && " (correta)"}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
              <AddQuizQuestionForm lessonId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
