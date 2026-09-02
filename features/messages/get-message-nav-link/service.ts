import type { GetMessageNavLinkResult } from "./types";

// Link fixo "Mensagens" do user-nav. O href depende do papel: professor (academy.courses.manage)
// abre a caixa administrativa de todos os cursos; aluno abre a própria lista de threads. Sem
// store — é só a decisão de rota.
export function getMessageNavLink(input: { isTeacher: boolean }): GetMessageNavLinkResult {
  return {
    success: true,
    data: {
      label: "Mensagens",
      href: input.isTeacher ? "/admin/academy/messages" : "/academy/messages",
    },
  };
}
