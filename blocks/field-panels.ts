import type { BlockFieldPanelComponent } from "@venore/plugin-sdk/ui";
import { NotationSheetFieldPanel } from "./notation-sheet-field-panel";

export const blockFieldPanels: Record<string, BlockFieldPanelComponent> = {
  "academy.notation.sheet": NotationSheetFieldPanel,
};
