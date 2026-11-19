// all.this — one import point for the neurons.me stack.
//
// The root carries what runs anywhere (browser or Node):
//   import { me, cleaker, GUI } from "all.this";
// Each package also has its own subpath, with its default export:
//   import me from "all.this/me";   import cleaker from "all.this/cleaker";   import * as GUI from "all.this/gui";
// The servers are subpath-only and optional (install them yourself when you need them):
//   import { createMonadApp } from "all.this/monad";   // needs `monad.ai`
//   import NetGet from "all.this/netget";             // needs `netget`
export { default as me } from "this.me";
export { default as cleaker } from "cleaker";

export type GUINamespace = typeof import("this.gui");
export type GUIReactNamespace = typeof import("this.gui/react");
export type GUIRuntimeNamespace = typeof import("this.gui/runtime");
export type GUIAtomsNamespace = typeof import("this.gui/atoms");
export type GUIMoleculesNamespace = typeof import("this.gui/molecules");
export type GUICompoundsNamespace = typeof import("this.gui/compounds");
export type GUIComponentsNamespace = typeof import("this.gui/components");
export type GUIDevtoolsNamespace = typeof import("this.gui/devtools");
export type GUILegacyNamespace = typeof import("this.gui/legacy");

// .GUI is loaded lazily, so importing all.this stays safe in Node and does not pull React until asked.
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
