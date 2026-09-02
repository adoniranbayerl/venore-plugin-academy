import type { BlockDefinition } from "@venore/plugin-sdk/cms";
import { courseCardBlockDefinition } from "./course-card";
import { courseListBlockDefinition } from "./course-list";
import { enrollCtaBlockDefinition } from "./enroll-cta";
import { courseProgressBlockDefinition } from "./course-progress";
import { lessonTrailBlockDefinition } from "./lesson-trail";
import { courseDashboardChartBlockDefinition } from "./course-dashboard-chart";
import { notationSheetBlockDefinition } from "./notation-sheet";
import { progressionBlockDefinition } from "./progression";
import { earTrainerBlockDefinition } from "./ear-trainer";
import { drumGridBlockDefinition } from "./drum-grid";
import { videoBlockDefinition } from "./video";

export const blockDefinitions: BlockDefinition[] = [
  courseListBlockDefinition,
  courseCardBlockDefinition,
  enrollCtaBlockDefinition,
  courseProgressBlockDefinition,
  lessonTrailBlockDefinition,
  courseDashboardChartBlockDefinition,
  notationSheetBlockDefinition,
  progressionBlockDefinition,
  earTrainerBlockDefinition,
  drumGridBlockDefinition,
  videoBlockDefinition,
];
