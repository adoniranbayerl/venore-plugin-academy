import { describe, expect, it } from "vitest";
import { DRUM_PATTERNS } from "../blocks/drum-grid-patterns";
import { parseAbcToComposition } from "../components/notation-abc-parse";
import { validateQuizAudioShape } from "../shared/quiz-audio";
import type { SeedLesson } from "./shared/course-builder";
import { TEORIA_LESSONS } from "./teoria-musical.lessons";

// Seeds são conteúdo, mas um ABC inválido vira bloco quebrado silenciosamente e um correctIndex
// fora do range faz addQuizQuestion recusar a pergunta inteira. Esta suíte pega os dois antes do
// install.

function collectAbc(lessons: SeedLesson[]): { label: string; abc: string }[] {
  const out: { label: string; abc: string }[] = [];
  lessons.forEach((lesson) => {
    lesson.examples?.forEach((example, index) => out.push({ label: `${lesson.title} — exemplo ${index + 1}`, abc: example.abc }));
    lesson.sections.forEach((section) =>
      section.blocks?.forEach((block, index) => {
        if (block.kind === "notation") out.push({ label: `${lesson.title} — bloco ${index + 1}`, abc: block.abc });
      }),
    );
    lesson.quiz?.forEach((quiz, index) => {
      if (quiz.promptAbc) out.push({ label: `${lesson.title} — quiz ${index + 1} (enunciado)`, abc: quiz.promptAbc });
      quiz.optionAbcs?.forEach((abc, optionIndex) => {
        if (abc) out.push({ label: `${lesson.title} — quiz ${index + 1} opção ${optionIndex + 1}`, abc });
      });
    });
  });
  return out;
}

describe.each([
  ["Teoria Musical", TEORIA_LESSONS],
])("seed %s", (_name, lessons) => {
  it("toda notação ABC dos exemplos, blocos e quizzes é válida", () => {
    for (const { label, abc } of collectAbc(lessons)) {
      const result = parseAbcToComposition(abc);
      expect(result, `ABC inválido em: ${label}`).not.toHaveProperty("error");
    }
  });

  it("todo quiz tem correctIndex dentro do range e forma de áudio consistente", () => {
    lessons.forEach((lesson) => {
      lesson.quiz?.forEach((quiz, index) => {
        const where = `${lesson.title} — quiz ${index + 1}`;
        expect(quiz.options.length, `${where}: precisa de ao menos 2 opções`).toBeGreaterThanOrEqual(2);
        expect(quiz.correctIndex, `${where}: correctIndex fora do range`).toBeGreaterThanOrEqual(0);
        expect(quiz.correctIndex, `${where}: correctIndex fora do range`).toBeLessThan(quiz.options.length);
        if (quiz.promptAbc || quiz.optionAbcs) {
          const error = validateQuizAudioShape({
            questionKind: "audio",
            options: quiz.options,
            optionNotations: quiz.optionAbcs ?? null,
            promptNotation: quiz.promptAbc ?? null,
          });
          expect(error, `${where}: ${error?.message ?? ""}`).toBeNull();
        }
      });
    });
  });

  it("toda aula tem pelo menos 2 atividades, com instruções não vazias", () => {
    lessons.forEach((lesson) => {
      expect(lesson.activities?.length ?? 0, `${lesson.title}: menos de 2 atividades`).toBeGreaterThanOrEqual(2);
      lesson.activities?.forEach((activity, index) => {
        expect(activity.instructions.trim().length, `${lesson.title} — atividade ${index + 1}`).toBeGreaterThan(0);
        expect(activity.title.trim().length, `${lesson.title} — atividade ${index + 1}`).toBeGreaterThan(0);
      });
    });
  });

  it("todo bloco drum-grid aponta pra um preset de levada existente", () => {
    lessons.forEach((lesson) => {
      lesson.sections.forEach((section) =>
        section.blocks?.forEach((block, index) => {
          if (block.kind !== "drum-grid") return;
          expect(DRUM_PATTERNS[block.style], `${lesson.title} — bloco ${index + 1}: preset "${block.style}" não existe`).toBeDefined();
          expect(block.bpm, `${lesson.title} — bloco ${index + 1}: bpm fora da faixa`).toBeGreaterThanOrEqual(40);
          expect(block.bpm).toBeLessThanOrEqual(200);
        }),
      );
    });
  });

  it("toda aula tem uma avaliação de 10 perguntas", () => {
    lessons.forEach((lesson) => {
      expect(lesson.quiz?.length ?? 0, `${lesson.title}: a avaliação não tem 10 perguntas`).toBe(10);
    });
  });
});

it("o curso de seed tem a contagem de aulas esperada", () => {
  expect(TEORIA_LESSONS).toHaveLength(19);
});
