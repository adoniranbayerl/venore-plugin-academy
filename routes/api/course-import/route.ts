import { NextResponse } from "next/server";
import { importCourseBundle } from "../../../index";
import { isPluginActive } from "@venore/plugin-sdk";

function statusForErrorCode(code: string): number {
  if (code === "rbac.authorization.unauthenticated") return 401;
  if (code === "rbac.authorization.forbidden") return 403;
  return 400;
}

// Rota própria (não Server Action) pelo mesmo motivo de app/api/import-export/import/route.ts: um
// .zip de curso com mídia (vídeo de capa, áudio de exemplo) passa fácil do limite de body de
// Server Action.
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isPluginActive("academy"))) {
    return NextResponse.json({ error: "O plugin Academy está desabilitado." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecione um arquivo .zip para importar." }, { status: 400 });
  }

  const zipData = Buffer.from(await file.arrayBuffer());
  const result = await importCourseBundle({ zipData });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: statusForErrorCode(result.error.code) });
  }

  return NextResponse.json({ report: result.data });
}
