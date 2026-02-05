import type * as React from "react";
export type RegistryEntry = {
  type: string;
  resolve: (spec: any, ctx?: ResolveCtx) => React.ReactElement | null;};
export type GuiRegistry = Record<string, RegistryEntry>;
export type ResolveCtx = { theme?: any; [key: string]: any };
