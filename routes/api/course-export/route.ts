import { NextResponse } from "next/server";
import { exportCourseBundle, toCourseBundleZip } from "../../../index";
import { isPluginActive } from "@venore/plugin-sdk";

function statusForErrorCode(code: string): number {
  if (code === "rbac.authorization.unauthenticated") return 401;
  if (code === "rbac.authorization.forbidden") return 403;
  if (code === "academy.export-course-bundle.not_found") return 404;
  return 400;
}

// Download binário não cabe no contrato de Server Action (retorno serializável) — mesmo motivo
// de app/api/import-export/export/route.ts. Checagem de plugin ativo antes de tudo (Fase 6): esta
// rota é invocável direto por URL, sem passar pela página/gate que a lista.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  if (!(await isPluginActive("academy"))) {
    return NextResponse.json({ error: "O plugin Academy está desabilitado." }, { status: 404 });
  }

  const { id } = await params;
  const result = await exportCourseBundle({ courseId: id });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: statusForErrorCode(result.error.code) });
  }

  const zip = toCourseBundleZip(result.data);
  const filename = `academy-${result.data.manifest.course.slug}-${new Date().toISOString().slice(0, 10)}.zip`;

  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zip.byteLength),
    },
  });
}
