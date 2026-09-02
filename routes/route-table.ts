import { asPluginApiHandler, asPluginPage, type PluginRouteTable } from "@venore/plugin-sdk";
import AdminPage from "./admin/page";
import AdminMessagesPage from "./admin-messages/page";
import AdminCoursePage from "./admin-course/page";
import AdminCourseEnrolledPage from "./admin-course-enrolled/page";
import AdminCourseEnrolledStudentPage from "./admin-course-enrolled-student/page";
import AdminLessonPage from "./admin-lesson/page";
import CatalogPage from "./catalog/page";
import MessagesPage from "./messages/page";
import CoursePage from "./course/page";
import LessonPage from "./lesson/page";
import CoursesLandingPage from "./courses-landing/page";
import LessonTrailSlot from "./lesson-sidebar/page";
import { GET as courseExportGET } from "./api/course-export/route";
import { POST as courseImportPOST } from "./api/course-import/route";

export const academyRouteTable: PluginRouteTable = {
  admin: [
    { pattern: "", Component: asPluginPage(AdminPage) },
    { pattern: "messages", Component: asPluginPage(AdminMessagesPage) },
    { pattern: "courses/:id", Component: asPluginPage(AdminCoursePage) },
    { pattern: "courses/:id/enrolled", Component: asPluginPage(AdminCourseEnrolledPage) },
    { pattern: "courses/:id/enrolled/:studentActorId", Component: asPluginPage(AdminCourseEnrolledStudentPage) },
    { pattern: "lessons/:id", Component: asPluginPage(AdminLessonPage) },
  ],
  // Padrões são caminhos completos (ver comentário em resolve-public-route.ts) — academy é dono
  // de "academy/**" E de "cursos" (vitrine pública separada, courses-landing/page.tsx), por isso
  // "cursos" aparece aqui mesmo não começando pelo nome do plugin.
  public: [
    { pattern: "academy", Component: asPluginPage(CatalogPage) },
    { pattern: "academy/messages", Component: asPluginPage(MessagesPage) },
    { pattern: "cursos", Component: asPluginPage(CoursesLandingPage) },
    { pattern: "academy/:courseSlug", Component: asPluginPage(CoursePage) },
    { pattern: "academy/:courseSlug/:lessonId", Component: asPluginPage(LessonPage) },
  ],
  // Coluna contextual da página de aula — casada pelo dispatcher único do slot
  // @sidebarContextual do core (src/app/(platform)/@sidebarContextual/[...slug]/).
  sidebarContextual: [
    { pattern: "academy/:courseSlug/:lessonId", Component: asPluginPage(LessonTrailSlot) },
  ],
  api: [
    { pattern: "courses/:id/export", handlers: { GET: asPluginApiHandler(courseExportGET) } },
    { pattern: "courses/import", handlers: { POST: asPluginApiHandler(courseImportPOST) } },
  ],
};
