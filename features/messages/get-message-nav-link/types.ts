import type { OperationResult } from "@venore/plugin-sdk";

export type GetMessageNavLinkInput = Record<string, never>;
// null = visitante anônimo (nada pra mostrar no user-nav).
export type MessageNavLink = { label: string; href: string };
export type GetMessageNavLinkResult = OperationResult<MessageNavLink | null>;
