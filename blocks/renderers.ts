import type { BlockRendererComponent } from "@venore/plugin-sdk";
import { AcademyCourseCardBlock } from "./course-card-block";
import { AcademyCourseListBlock } from "./course-list-block";
import { AcademyEnrollCtaBlock } from "./enroll-cta-block";
import { AcademyCourseProgressBlock } from "./course-progress-block";
import { AcademyLessonTrailBlock } from "./lesson-trail-block";
import { AcademyCourseDashboardChartBlock } from "./course-dashboard-chart-block";
import { AcademyNotationSheetBlock } from "./notation-sheet-block";
import { AcademyProgressionBlock } from "./progression-block";
import { AcademyEarTrainerBlock } from "./ear-trainer-block";
import { AcademyDrumGridBlock } from "./drum-grid-block";
import { AcademyVideoBlock } from "./video-block";

export const blockRenderers: Record<string, BlockRendererComponent> = {
  "academy.course.list": AcademyCourseListBlock,
  "academy.course.card": AcademyCourseCardBlock,
  "academy.enroll.cta": AcademyEnrollCtaBlock,
  "academy.course.progress": AcademyCourseProgressBlock,
  "academy.course.lesson-trail": AcademyLessonTrailBlock,
  "academy.course.dashboard-chart": AcademyCourseDashboardChartBlock,
  "academy.notation.sheet": AcademyNotationSheetBlock,
  "academy.progression": AcademyProgressionBlock,
  "academy.ear-trainer": AcademyEarTrainerBlock,
  "academy.drum-grid": AcademyDrumGridBlock,
  "academy.video": AcademyVideoBlock,
};
