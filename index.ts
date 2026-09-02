export { createCourseHandler as createCourse } from "./features/courses/create-course/handler";
export { listCoursesHandler as listCourses } from "./features/courses/list-courses/handler";
export { getCourseHandler as getCourse } from "./features/courses/get-course/handler";
export { publishCourseHandler as publishCourse } from "./features/courses/publish-course/handler";
export { unpublishCourseHandler as unpublishCourse } from "./features/courses/unpublish-course/handler";
export { deleteCourseHandler as deleteCourse } from "./features/courses/delete-course/handler";
export {
  updateCourseSettingsHandler as updateCourseSettings,
} from "./features/courses/update-course-settings/handler";
export {
  listCoursesForStudentHandler as listCoursesForStudent,
} from "./features/courses/list-courses-for-student/handler";
export {
  getCourseForStudentHandler as getCourseForStudent,
} from "./features/courses/get-course-for-student/handler";
export {
  exportCourseBundleHandler as exportCourseBundle,
} from "./features/courses/export-course-bundle/handler";
export { toExportZip as toCourseBundleZip } from "./features/courses/export-course-bundle/view";
export {
  importCourseBundleHandler as importCourseBundle,
} from "./features/courses/import-course-bundle/handler";
export { createLessonHandler as createLesson } from "./features/lessons/create-lesson/handler";
export { updateLessonHandler as updateLesson } from "./features/lessons/update-lesson/handler";
export { deleteLessonHandler as deleteLesson } from "./features/lessons/delete-lesson/handler";
export { reorderLessonsHandler as reorderLessons } from "./features/lessons/reorder-lessons/handler";
export { listLessonsByCourseHandler as listLessonsByCourse } from "./features/lessons/list-lessons-by-course/handler";
export { getLessonHandler as getLesson } from "./features/lessons/get-lesson/handler";
export { setLessonStatusHandler as setLessonStatus } from "./features/lessons/set-lesson-status/handler";
export { configureLessonRequirementsHandler as configureLessonRequirements } from "./features/lessons/configure-lesson-requirements/handler";
export { getLessonRequirementsHandler as getLessonRequirements } from "./features/lessons/get-lesson-requirements/handler";
export { addQuizQuestionHandler as addQuizQuestion } from "./features/lessons/add-quiz-question/handler";
export { updateQuizQuestionHandler as updateQuizQuestion } from "./features/lessons/update-quiz-question/handler";
export { deleteQuizQuestionHandler as deleteQuizQuestion } from "./features/lessons/delete-quiz-question/handler";
export {
  listQuizQuestionsByLessonHandler as listQuizQuestionsByLesson,
} from "./features/lessons/list-quiz-questions-by-lesson/handler";
export {
  listQuizQuestionsForStudentHandler as listQuizQuestionsForStudent,
} from "./features/lessons/list-quiz-questions-for-student/handler";
export {
  addLessonMaterialHandler as addLessonMaterial,
} from "./features/lessons/add-lesson-material/handler";
export {
  listLessonMaterialsByLessonHandler as listLessonMaterialsByLesson,
} from "./features/lessons/list-lesson-materials-by-lesson/handler";
export {
  listLessonMaterialsForStudentHandler as listLessonMaterialsForStudent,
} from "./features/lessons/list-lesson-materials-for-student/handler";
export {
  deleteLessonMaterialHandler as deleteLessonMaterial,
} from "./features/lessons/delete-lesson-material/handler";
export {
  addLessonExampleHandler as addLessonExample,
} from "./features/lessons/add-lesson-example/handler";
export {
  listLessonExamplesByLessonHandler as listLessonExamplesByLesson,
} from "./features/lessons/list-lesson-examples-by-lesson/handler";
export {
  listLessonExamplesForStudentHandler as listLessonExamplesForStudent,
} from "./features/lessons/list-lesson-examples-for-student/handler";
export {
  deleteLessonExampleHandler as deleteLessonExample,
} from "./features/lessons/delete-lesson-example/handler";
export {
  addLessonActivityHandler as addLessonActivity,
} from "./features/lessons/add-lesson-activity/handler";
export {
  updateLessonActivityHandler as updateLessonActivity,
} from "./features/lessons/update-lesson-activity/handler";
export {
  deleteLessonActivityHandler as deleteLessonActivity,
} from "./features/lessons/delete-lesson-activity/handler";
export {
  listLessonActivitiesByLessonHandler as listLessonActivitiesByLesson,
} from "./features/lessons/list-lesson-activities-by-lesson/handler";
export {
  listLessonActivitiesForStudentHandler as listLessonActivitiesForStudent,
} from "./features/lessons/list-lesson-activities-for-student/handler";
export {
  createLessonSectionHandler as createLessonSection,
} from "./features/lessons/sections/create-lesson-section/handler";
export {
  createLessonTextSectionHandler as createLessonTextSection,
} from "./features/lessons/sections/create-lesson-text-section/handler";
export {
  updateLessonSectionHandler as updateLessonSection,
} from "./features/lessons/sections/update-lesson-section/handler";
export {
  deleteLessonSectionHandler as deleteLessonSection,
} from "./features/lessons/sections/delete-lesson-section/handler";
export {
  reorderLessonSectionsHandler as reorderLessonSections,
} from "./features/lessons/sections/reorder-lesson-sections/handler";
export {
  listLessonSectionsByLessonHandler as listLessonSectionsByLesson,
} from "./features/lessons/sections/list-lesson-sections-by-lesson/handler";
export {
  listLessonSectionsForStudentHandler as listLessonSectionsForStudent,
} from "./features/lessons/sections/list-lesson-sections-for-student/handler";
export {
  getLessonSectionHandler as getLessonSection,
} from "./features/lessons/sections/get-lesson-section/handler";
export { markTextReadHandler as markTextRead } from "./features/progress/mark-text-read/handler";
export { markVideoWatchedHandler as markVideoWatched } from "./features/progress/mark-video-watched/handler";
export {
  markLessonSectionReadHandler as markLessonSectionRead,
} from "./features/progress/mark-lesson-section-read/handler";
export {
  markLessonMaterialReadHandler as markLessonMaterialRead,
} from "./features/progress/mark-lesson-material-read/handler";
export { submitQuizAttemptHandler as submitQuizAttempt } from "./features/progress/submit-quiz-attempt/handler";
export { getCourseProgressHandler as getCourseProgress } from "./features/progress/get-course-progress/handler";
export { getPracticeStreakHandler as getPracticeStreak } from "./features/progress/get-practice-streak/handler";
export { recordExercisePracticeHandler as recordExercisePractice } from "./features/progress/record-exercise-practice/handler";
export { getExercisePracticeStatsHandler as getExercisePracticeStats } from "./features/progress/get-exercise-practice-stats/handler";
export { resetQuizAttemptsHandler as resetQuizAttempts } from "./features/progress/reset-quiz-attempts/handler";
export {
  listQuizProgressForCourseHandler as listQuizProgressForCourse,
} from "./features/progress/list-quiz-progress-for-course/handler";
export {
  submitLessonActivityHandler as submitLessonActivity,
} from "./features/progress/submit-lesson-activity/handler";
export {
  reviewLessonActivitySubmissionHandler as reviewLessonActivitySubmission,
} from "./features/progress/review-lesson-activity-submission/handler";
export {
  getActivityReviewAlertHandler as getActivityReviewAlert,
} from "./features/progress/get-activity-review-alert/handler";
export {
  markActivityReviewSeenHandler as markActivityReviewSeen,
} from "./features/progress/mark-activity-review-seen/handler";
export {
  listLessonActivitySubmissionsForActivityHandler as listLessonActivitySubmissionsForActivity,
} from "./features/progress/list-lesson-activity-submissions-for-activity/handler";
export {
  getCourseProgressForStudentHandler as getCourseProgressForStudent,
} from "./features/progress/get-course-progress-for-student/handler";
export {
  listLessonActivitySubmissionsForStudentInCourseHandler as listLessonActivitySubmissionsForStudentInCourse,
} from "./features/progress/list-lesson-activity-submissions-for-student-in-course/handler";
export {
  listActivitySubmissionMediaForCourseHandler as listActivitySubmissionMediaForCourse,
} from "./features/courses/list-activity-submission-media-for-course/handler";
export { listPublicCoursesHandler as listPublicCourses } from "./features/courses/list-public-courses/handler";
export { getAcademyOverviewHandler as getAcademyOverview } from "./features/courses/get-academy-overview/handler";
export type { PublicCourseView, ListPublicCoursesResult } from "./features/courses/list-public-courses/types";
export type {
  AcademyOverview,
  AcademyOverviewCourse,
  AcademyOverviewSubmission,
  GetAcademyOverviewResult,
} from "./features/courses/get-academy-overview/types";

export { enrollSelfHandler as enrollSelf } from "./features/enrollments/enroll-self/handler";
export { enrollStudentHandler as enrollStudent } from "./features/enrollments/enroll-student/handler";
export { unenrollStudentHandler as unenrollStudent } from "./features/enrollments/unenroll-student/handler";
export {
  listEnrollmentsForCourseHandler as listEnrollmentsForCourse,
} from "./features/enrollments/list-enrollments-for-course/handler";
export { isEnrolledHandler as isEnrolled } from "./features/enrollments/is-enrolled/handler";

export { sendStudentMessageHandler as sendStudentMessage } from "./features/messages/send-student-message/handler";
export { sendTeacherMessageHandler as sendTeacherMessage } from "./features/messages/send-teacher-message/handler";
export { getMessageThreadHandler as getMessageThread } from "./features/messages/get-message-thread/handler";
export {
  getMessageThreadForStudentHandler as getMessageThreadForStudent,
} from "./features/messages/get-message-thread-for-student/handler";
export { listMessageThreadsHandler as listMessageThreads } from "./features/messages/list-message-threads/handler";
export {
  listMessageThreadsForCourseHandler as listMessageThreadsForCourse,
} from "./features/messages/list-message-threads-for-course/handler";
export {
  listAllMessageThreadsHandler as listAllMessageThreads,
} from "./features/messages/list-all-message-threads/handler";
export { getMessageAlertHandler as getMessageAlert } from "./features/messages/get-message-alert/handler";
export { getMessageNavLinkHandler as getMessageNavLink } from "./features/messages/get-message-nav-link/handler";
export { markThreadReadHandler as markThreadRead } from "./features/messages/mark-thread-read/handler";
export {
  markThreadReadForStudentHandler as markThreadReadForStudent,
} from "./features/messages/mark-thread-read-for-student/handler";

// Provider de uso de mídia (docs/venore-docks.md — regra 12/14, "Sistema de plugins"): consumido
// só por platform/media-usage/media-usage-registry.ts, e só quando o plugin está ativo (a checagem
// de enabled/disabled é feita lá, via registerPlugins() — academy nunca sabe se está sendo
// consultado ou não). Sem handler/RBAC próprio: quem autoriza chegar até aqui é quem tem
// media.manage, checado antes de coletar uso (mesmo raciocínio de findCmsMediaUsage).
export { findAcademyMediaUsage } from "./features/media-usage/find-academy-media-usage/service";

// Ponto de extensão "blocks" do plugin engine (docs/venore-docks.md — "Sistema de plugins"): o
// registry de page-builder (platform/page-builder/block-registry.ts) importa blockDefinitions
// (dado, serializável) e block-renderers.tsx importa blockRenderers (componente) — dois
// registries paralelos, nunca misturados. Os renderers consomem só os handlers públicos
// abaixo — nenhuma query nova.
export { blockDefinitions, blockRenderers } from "./blocks";

// Ponto de extensão "seeds" do plugin engine (platform/plugin-engine/plugin-seed-registry.ts) —
// dados de exemplo populados via /admin/plugins.
export { academySeeds } from "./seeds";
export {
  academyBreadcrumbSegments,
  getCachedCourseForStudent,
  getCachedCourse,
  getCachedLesson,
} from "./breadcrumbs";

// Componentes de apresentação academy-specific (cards de curso, trilha de aulas) — moram no
// plugin porque consomem tipos do plugin (CourseRecord, CourseForStudentView); src/components
// não pode importar de src/plugins/* (regra de boundary desta sessão).
export { AdminCourseCard } from "./components/admin-course-card";
export { StudentCourseCard } from "./components/student-course-card";
export { CourseCover } from "./components/course-cover";
export { LessonTrail, type LessonTrailItem } from "./components/lesson-trail";

// Funções puras de exibição — única fonte de arredondamento pra percentual de progresso e nota
// de quiz, usadas tanto por páginas de app (via este barrel) quanto pelos blocks do plugin (via
// import relativo, já que blocks/ não pode importar deste index.ts sem criar ciclo).
export { calculateProgressPercent } from "./shared/progress-percent";
export { deriveQuizGrade } from "./shared/quiz-grade";

export type {
  AcademyStatus,
  CourseRecord,
  CourseStatus,
  LessonRecord,
  LessonStatus,
  LessonMaterialRecord,
  LessonSectionRecord,
  LessonRequirementsRecord,
  LessonExampleRecord,
  DeliverableFormat,
  LessonActivityRecord,
  SubmissionReviewStatus,
  LessonActivitySubmissionRecord,
  QuizAnswer,
  QuizQuestionKind,
  QuizQuestionRecord,
  StudentQuizQuestionRecord,
  QuizAttemptRecord,
  EnrollmentRecord,
  LessonMessageThreadType,
  LessonMessageSenderRole,
  LessonMessageThreadRecord,
  LessonMessageRecord,
} from "./contracts/types";

export type { CreateCourseInput, CreateCourseResult } from "./features/courses/create-course/types";
export type { ListCoursesResult } from "./features/courses/list-courses/types";
export type { GetCourseQuery, GetCourseResult } from "./features/courses/get-course/types";
export type {
  PublishCourseInput,
  PublishCourseResult,
  PublishCourseTargetStatus,
} from "./features/courses/publish-course/types";
export type { UnpublishCourseInput, UnpublishCourseResult } from "./features/courses/unpublish-course/types";
export type { DeleteCourseInput, DeleteCourseResult } from "./features/courses/delete-course/types";
export type {
  UpdateCourseSettingsInput,
  UpdateCourseSettingsResult,
} from "./features/courses/update-course-settings/types";
export type {
  ListCoursesForStudentQuery,
  CourseForStudentView,
  ListCoursesForStudentResult,
} from "./features/courses/list-courses-for-student/types";
export type {
  GetCourseForStudentQuery,
  GetCourseForStudentResult,
} from "./features/courses/get-course-for-student/types";
export type { ExportCourseBundleCommand, ExportCourseBundleResult } from "./features/courses/export-course-bundle/types";
export type {
  AcademyImportReport,
  AcademyImportReportLine,
  AcademyImportReportLineKind,
  ImportCourseBundleResult,
} from "./features/courses/import-course-bundle/types";
export type { ImportReportOutcome } from "@venore/plugin-sdk/import-export";
export type { ImportCourseBundleHandlerInput } from "./features/courses/import-course-bundle/handler";
export type { CreateLessonInput, CreateLessonResult } from "./features/lessons/create-lesson/types";
export type { UpdateLessonInput, UpdateLessonResult } from "./features/lessons/update-lesson/types";
export type { DeleteLessonInput, DeleteLessonResult } from "./features/lessons/delete-lesson/types";
export type { ReorderLessonsInput, ReorderLessonsResult } from "./features/lessons/reorder-lessons/types";
export type {
  ListLessonsByCourseQuery,
  ListLessonsByCourseResult,
} from "./features/lessons/list-lessons-by-course/types";
export type { GetLessonQuery, GetLessonResult } from "./features/lessons/get-lesson/types";
export type { SetLessonStatusInput, SetLessonStatusResult } from "./features/lessons/set-lesson-status/types";
export type {
  ConfigureLessonRequirementsInput,
  ConfigureLessonRequirementsResult,
} from "./features/lessons/configure-lesson-requirements/types";
export type {
  GetLessonRequirementsQuery,
  GetLessonRequirementsResult,
} from "./features/lessons/get-lesson-requirements/types";
export type { AddQuizQuestionInput, AddQuizQuestionResult } from "./features/lessons/add-quiz-question/types";
export type {
  UpdateQuizQuestionInput,
  UpdateQuizQuestionResult,
} from "./features/lessons/update-quiz-question/types";
export type {
  DeleteQuizQuestionInput,
  DeleteQuizQuestionResult,
} from "./features/lessons/delete-quiz-question/types";
export type {
  ListQuizQuestionsByLessonQuery,
  ListQuizQuestionsByLessonResult,
} from "./features/lessons/list-quiz-questions-by-lesson/types";
export type {
  ListQuizQuestionsForStudentQuery,
  ListQuizQuestionsForStudentResult,
} from "./features/lessons/list-quiz-questions-for-student/types";
export type {
  AddLessonMaterialInput,
  AddLessonMaterialResult,
} from "./features/lessons/add-lesson-material/types";
export type {
  ListLessonMaterialsByLessonQuery,
  ListLessonMaterialsByLessonResult,
} from "./features/lessons/list-lesson-materials-by-lesson/types";
export type {
  ListLessonMaterialsForStudentQuery,
  ListLessonMaterialsForStudentResult,
  StudentLessonMaterialRecord,
} from "./features/lessons/list-lesson-materials-for-student/types";
export type {
  DeleteLessonMaterialInput,
  DeleteLessonMaterialResult,
} from "./features/lessons/delete-lesson-material/types";
export type { AddLessonExampleInput, AddLessonExampleResult } from "./features/lessons/add-lesson-example/types";
export type {
  ListLessonExamplesByLessonQuery,
  ListLessonExamplesByLessonResult,
} from "./features/lessons/list-lesson-examples-by-lesson/types";
export type {
  ListLessonExamplesForStudentQuery,
  ListLessonExamplesForStudentResult,
} from "./features/lessons/list-lesson-examples-for-student/types";
export type {
  DeleteLessonExampleInput,
  DeleteLessonExampleResult,
} from "./features/lessons/delete-lesson-example/types";
export type { AddLessonActivityInput, AddLessonActivityResult } from "./features/lessons/add-lesson-activity/types";
export type {
  UpdateLessonActivityInput,
  UpdateLessonActivityResult,
} from "./features/lessons/update-lesson-activity/types";
export type {
  DeleteLessonActivityInput,
  DeleteLessonActivityResult,
} from "./features/lessons/delete-lesson-activity/types";
export type {
  ListLessonActivitiesByLessonQuery,
  ListLessonActivitiesByLessonResult,
} from "./features/lessons/list-lesson-activities-by-lesson/types";
export type {
  ListLessonActivitiesForStudentQuery,
  ListLessonActivitiesForStudentResult,
  StudentLessonActivityRecord,
} from "./features/lessons/list-lesson-activities-for-student/types";
export type {
  CreateLessonSectionInput,
  CreateLessonSectionResult,
} from "./features/lessons/sections/create-lesson-section/types";
export type {
  CreateLessonTextSectionInput,
  CreateLessonTextSectionResult,
} from "./features/lessons/sections/create-lesson-text-section/types";
export type {
  UpdateLessonSectionInput,
  UpdateLessonSectionResult,
} from "./features/lessons/sections/update-lesson-section/types";
export type {
  DeleteLessonSectionInput,
  DeleteLessonSectionResult,
} from "./features/lessons/sections/delete-lesson-section/types";
export type {
  ReorderLessonSectionsInput,
  ReorderLessonSectionsResult,
} from "./features/lessons/sections/reorder-lesson-sections/types";
export type {
  ListLessonSectionsByLessonQuery,
  ListLessonSectionsByLessonResult,
} from "./features/lessons/sections/list-lesson-sections-by-lesson/types";
export type {
  ListLessonSectionsForStudentQuery,
  ListLessonSectionsForStudentResult,
  StudentLessonSectionRecord,
} from "./features/lessons/sections/list-lesson-sections-for-student/types";
export type {
  GetLessonSectionQuery,
  GetLessonSectionResult,
} from "./features/lessons/sections/get-lesson-section/types";
export type { MarkTextReadInput, MarkTextReadResult } from "./features/progress/mark-text-read/types";
export type { MarkVideoWatchedInput, MarkVideoWatchedResult } from "./features/progress/mark-video-watched/types";
export type {
  MarkLessonSectionReadInput,
  MarkLessonSectionReadResult,
} from "./features/progress/mark-lesson-section-read/types";
export type {
  MarkLessonMaterialReadInput,
  MarkLessonMaterialReadResult,
} from "./features/progress/mark-lesson-material-read/types";
export type { SubmitQuizAttemptInput, SubmitQuizAttemptResult } from "./features/progress/submit-quiz-attempt/types";
export type {
  GetCourseProgressInput,
  GetCourseProgressResult,
  CourseProgressView,
  LessonProgressView,
} from "./features/progress/get-course-progress/types";
export type {
  GetPracticeStreakInput,
  GetPracticeStreakResult,
  PracticeStreakView,
} from "./features/progress/get-practice-streak/types";
export type {
  RecordExercisePracticeInput,
  RecordExercisePracticeResult,
} from "./features/progress/record-exercise-practice/types";
export type {
  GetExercisePracticeStatsInput,
  GetExercisePracticeStatsResult,
} from "./features/progress/get-exercise-practice-stats/types";
export type {
  ResetQuizAttemptsInput,
  ResetQuizAttemptsResult,
} from "./features/progress/reset-quiz-attempts/types";
export type {
  ListQuizProgressForCourseQuery,
  QuizProgressEntryView,
  ListQuizProgressForCourseResult,
} from "./features/progress/list-quiz-progress-for-course/types";
export type {
  SubmitLessonActivityInput,
  SubmitLessonActivityResult,
} from "./features/progress/submit-lesson-activity/types";
export type {
  ReviewLessonActivitySubmissionInput,
  ReviewLessonActivitySubmissionResult,
} from "./features/progress/review-lesson-activity-submission/types";
export type {
  ActivityReviewAlert,
  GetActivityReviewAlertInput,
  GetActivityReviewAlertResult,
} from "./features/progress/get-activity-review-alert/types";
export type {
  MarkActivityReviewSeenInput,
  MarkActivityReviewSeenResult,
} from "./features/progress/mark-activity-review-seen/types";
export type {
  ListLessonActivitySubmissionsForActivityQuery,
  ListLessonActivitySubmissionsForActivityResult,
  LessonActivitySubmissionView,
} from "./features/progress/list-lesson-activity-submissions-for-activity/types";
export type {
  GetCourseProgressForStudentInput,
  GetCourseProgressForStudentResult,
} from "./features/progress/get-course-progress-for-student/types";
export type {
  ListLessonActivitySubmissionsForStudentInCourseQuery,
  ListLessonActivitySubmissionsForStudentInCourseResult,
  StudentCourseActivitySubmissionView,
} from "./features/progress/list-lesson-activity-submissions-for-student-in-course/types";

export type { EnrollSelfInput, EnrollSelfResult } from "./features/enrollments/enroll-self/types";
export type { EnrollStudentInput, EnrollStudentResult } from "./features/enrollments/enroll-student/types";
export type { UnenrollStudentInput, UnenrollStudentResult } from "./features/enrollments/unenroll-student/types";
export type {
  ListEnrollmentsForCourseQuery,
  EnrollmentView,
  ListEnrollmentsForCourseResult,
} from "./features/enrollments/list-enrollments-for-course/types";
export type { IsEnrolledInput, IsEnrolledResult } from "./features/enrollments/is-enrolled/types";

export type { SendStudentMessageInput, SendStudentMessageResult } from "./features/messages/send-student-message/types";
export type { SendTeacherMessageInput, SendTeacherMessageResult } from "./features/messages/send-teacher-message/types";
export type {
  GetMessageThreadInput,
  GetMessageThreadResult,
  MessageThreadWithMessages,
} from "./features/messages/get-message-thread/types";
export type {
  GetMessageThreadForStudentInput,
  GetMessageThreadForStudentResult,
} from "./features/messages/get-message-thread-for-student/types";
export type { ListMessageThreadsInput, ListMessageThreadsResult } from "./features/messages/list-message-threads/types";
export type {
  ListMessageThreadsForCourseQuery,
  ListMessageThreadsForCourseResult,
} from "./features/messages/list-message-threads-for-course/types";
export type { ListAllMessageThreadsResult } from "./features/messages/list-all-message-threads/types";
export type { GetMessageAlertInput, GetMessageAlertResult, MessageAlert } from "./features/messages/get-message-alert/types";
export type { GetMessageNavLinkInput, GetMessageNavLinkResult, MessageNavLink } from "./features/messages/get-message-nav-link/types";
export type { MarkThreadReadInput, MarkThreadReadResult } from "./features/messages/mark-thread-read/types";
export type {
  MarkThreadReadForStudentInput,
  MarkThreadReadForStudentResult,
} from "./features/messages/mark-thread-read-for-student/types";
export type { LessonMessageThreadWithContext } from "./shared/lesson-messages-store";
