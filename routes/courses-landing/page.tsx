import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { CourseCover, listPublicCourses } from "../../index";
import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { Button } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";

// Vitrine pública de cursos (pedido desta sessão: "landing page pra vender os cursos, onde o
// aluno possa se matricular") — rota nova e separada de /academy de propósito: /academy já é o
// dashboard do aluno logado (redireciona pra login se anônimo, ver AGENTS.md/get-academy-student-
// page-data.ts), então não dava pra virar catálogo público sem misturar os dois papéis. Esta
// página nunca exige sessão — lista só o que list-public-courses/store.ts já filtra como
// intencionalmente público (status "public" + publiclyListed). Vive no plugin (routes/route-
// table.ts registra o padrão "cursos" — fora do namespace "academy/**") porque academy é dono
// dessa URL, mesmo não começando pelo seu próprio nome.
//
// Cards seguem a MESMA anatomia do blogroll (app/(platform)/[...slug]/page.tsx —
// renderCategoryBlogroll): capa fixa 16:9, rótulo pequeno em caixa alta, título, resumo em até 3
// linhas, CTA fixado no rodapé do card via mt-auto — pedido desta sessão ("courseroll similar ao
// blogroll"), pra vitrine de curso e de post lerem como parte do mesmo sistema visual, não duas
// telas desenhadas em momentos diferentes.
export default async function CoursesLandingPage() {
  const [coursesResult, currentUser] = await Promise.all([listPublicCourses(), getCurrentUser()]);
  const isAuthenticated = currentUser.success && Boolean(currentUser.data);
  const courses = coursesResult.success ? coursesResult.data : [];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-panel border border-primary/20 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/60 px-2.5 py-1 text-[11px] font-medium tracking-caps text-primary uppercase">
          <Sparkles className="size-3" aria-hidden="true" /> Cursos
        </span>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Aprenda no seu ritmo, com acompanhamento de verdade.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Aulas em trilha, exemplos interativos, atividades práticas com correção do professor e progresso sempre
          visível. Matricule-se e comece quando quiser.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/academy">
                Ver meus cursos <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/api/auth/signin">
                Entrar para se matricular <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
          {courses.length > 0 && (
            <Button asChild size="lg" variant="outline">
              <a href="#catalogo">Ver cursos disponíveis</a>
            </Button>
          )}
        </div>
      </section>

      <section id="catalogo" className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Cursos disponíveis</h2>
        </div>

        {!coursesResult.success && (
          <p className="text-sm text-destructive">Erro ao carregar cursos: {coursesResult.error.message}</p>
        )}

        {coursesResult.success && courses.length === 0 && (
          <EmptyState
            icon={<BookOpen className="size-8" strokeWidth={1.5} />}
            title="Nenhum curso disponível no momento"
            description="Volte mais tarde — novos cursos aparecem aqui assim que forem publicados."
          />
        )}

        {courses.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5">
            {courses.map((course) => (
              <Link key={course.id} href={`/academy/${course.slug}`} className="group block">
                <article className="flex h-full flex-col overflow-hidden rounded-panel border border-border bg-card ui-motion-base group-hover:shadow-float">
                  <CourseCover
                    coverMediaId={course.coverMediaId}
                    className="w-full rounded-none object-cover ui-motion-emphasis group-hover:scale-105"
                  />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="flex w-fit items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
                      <GraduationCap className="size-3" aria-hidden="true" /> Curso
                    </p>
                    <h3 className="text-base font-semibold text-foreground">{course.title}</h3>
                    {course.description && <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>}
                    <p className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-primary">
                      Matricule-se <ArrowRight className="size-3.5" aria-hidden="true" />
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
