import type { PluginContributions } from "@venore/plugin-sdk";
import { academyBreadcrumbSegments } from "./breadcrumbs";
import { blockDefinitions } from "./blocks/definitions";
import { findAcademyMediaUsage } from "./features/media-usage/find-academy-media-usage/service";
import { academySeeds } from "./seeds";

// O que o academy contribui pro core. Campos "diretos" são dado/query simples;
// notificationAlert/userNavItems/blockRenderers/adminDashboardPanel/publicHomeShowcase usam
// handlers/componentes que sobem até auth/db, então são `import()` PREGUIÇOSO — não arrastam essa
// cadeia pro grafo de quem só lê breadcrumbs ou seeds.
export const academyContributions: PluginContributions = {
  breadcrumbSegments: academyBreadcrumbSegments,
  mediaUsageResolver: findAcademyMediaUsage,
  seeds: academySeeds,
  blockDefinitions,
  blockRenderers: async () => (await import("./blocks/renderers")).blockRenderers,
  notificationAlert: async () => {
    const [{ getActivityReviewAlertHandler }, { getMessageAlertHandler }] = await Promise.all([
      import("./features/progress/get-activity-review-alert/handler"),
      import("./features/messages/get-message-alert/handler"),
    ]);
    const activityAlert = await getActivityReviewAlertHandler();
    if (activityAlert.success && activityAlert.data) return activityAlert.data;
    const messageAlert = await getMessageAlertHandler();
    return messageAlert.success ? messageAlert.data : null;
  },
  userNavItems: async () => {
    const { getMessageNavLinkHandler } = await import("./features/messages/get-message-nav-link/handler");
    const link = await getMessageNavLinkHandler();
    if (!link.success || !link.data) return [];
    return [{ key: "academy.messages", label: link.data.label, href: link.data.href, icon: "message-circle" }];
  },
  adminDashboardPanel: async () => {
    const { renderAcademyAdminDashboardPanel } = await import("./content-slots/admin-dashboard-panel");
    return renderAcademyAdminDashboardPanel();
  },
  publicHomeShowcase: async () => {
    const { renderAcademyPublicHomeShowcase } = await import("./content-slots/public-home-showcase");
    return renderAcademyPublicHomeShowcase();
  },
};
