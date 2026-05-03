export { default as me } from "this.me";
export { default as cleaker } from "cleaker";
export * as monad from "monad.ai";
export { default as netget, NetGet } from "netget";
export * as boot from "./src/boot/index";

export type { NetGetConfig } from "netget";

export type GUINamespace = typeof import("this.gui");
export type GUIReactNamespace = typeof import("this.gui/react");
export type GUIRuntimeNamespace = typeof import("this.gui/runtime");
export type GUIAtomsNamespace = typeof import("this.gui/atoms");
export type GUIMoleculesNamespace = typeof import("this.gui/molecules");
export type GUICompoundsNamespace = typeof import("this.gui/compounds");
export type GUIComponentsNamespace = typeof import("this.gui/components");
export type GUIDevtoolsNamespace = typeof import("this.gui/devtools");
export type GUILegacyNamespace = typeof import("this.gui/legacy");

export const GUI = {
  load: (): Promise<GUINamespace> => import("this.gui"),
  react: (): Promise<GUIReactNamespace> => import("this.gui/react"),
  runtime: (): Promise<GUIRuntimeNamespace> => import("this.gui/runtime"),
  atoms: (): Promise<GUIAtomsNamespace> => import("this.gui/atoms"),
  molecules: (): Promise<GUIMoleculesNamespace> => import("this.gui/molecules"),
  compounds: (): Promise<GUICompoundsNamespace> => import("this.gui/compounds"),
  components: (): Promise<GUIComponentsNamespace> => import("this.gui/components"),
  devtools: (): Promise<GUIDevtoolsNamespace> => import("this.gui/devtools"),
  legacy: (): Promise<GUILegacyNamespace> => import("this.gui/legacy"),
} as const;
