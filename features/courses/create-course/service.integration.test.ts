import { describe, expect, it } from "vitest";
import { seedUser } from "../../../test-support/academy-seed";
import { createCourse } from "./service";

// Documenta o comportamento atual (não corrigir nesta sessão — instrução explícita): a colisão
// de slug já é evitada na aplicação por generateUniqueSlug (findCourseBySlug + sufixo numérico)
// antes do insert, então dois cursos com o mesmo título não estouram erro cru de constraint do
// unique index courses_slug_idx. A race condition entre o SELECT de generateUniqueSlug e o
// INSERT (dois requests concorrentes checando o mesmo slug livre ao mesmo tempo) continua
// existindo e fica fora de escopo — não reproduzida aqui, exigiria dois processos concorrentes de
// verdade contra o mesmo banco.
describe("createCourse (integração) — colisão de slug", () => {
  it("dá ao segundo curso com o mesmo título um slug com sufixo numérico, sem erro de constraint", async () => {
    const teacher = await seedUser();

    const first = await createCourse({ title: "Introdução ao Postgres", actorId: teacher.id });
    const second = await createCourse({ title: "Introdução ao Postgres", actorId: teacher.id });
    const third = await createCourse({ title: "Introdução ao Postgres", actorId: teacher.id });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(third.success).toBe(true);
    if (first.success && second.success && third.success) {
      expect(first.data.slug).toBe("introducao-ao-postgres");
      expect(second.data.slug).toBe("introducao-ao-postgres-2");
      expect(third.data.slug).toBe("introducao-ao-postgres-3");
    }
  });
});
