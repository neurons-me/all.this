/*
 * This.GUI — Molecules registry
 * Mid-level components composed from atoms and basic primitives.
 *
 * Export rules (consistency + ergonomics):
 *  - Keep a `Theme` namespace for theme-related molecules.
 *  - Theme molecules are exported only under `Theme` (no top-level named exports).
 *  - Avoid `export *` patterns here; be explicit to keep the public API stable.
 *
 * Ordering convention:
 *  1) component imports
 *  2) type imports
 *  3) nested namespaces (e.g. Theme)
 *  4) registry object
 *  5) named exports
 *  6) type exports
 *  7) default export
 */

// Components
import Dialog from './Dialog/Dialog';
import { Hero } from './Hero/Hero';
import Modal from './Modal/Modal';
import Page from './Page/Page';
import ThemeModeToggle from '../Theme/ToggleMode/ToggleMode';
import ThemesCatalog from '../Theme/Catalog/Catalog';

// Types
import type { ComponentType } from 'react';
import type { DialogProps } from './Dialog/Dialog';
import type { HeroProps } from './Hero/Hero.types';
import type PageProps from './Page/Page';

const Theme = {
  ThemeModeToggle,
  ThemesCatalog,
} as const;

type MoleculesRegistry = {
  Dialog: typeof Dialog;
  Hero: typeof Hero;
  // NOTE: We intentionally widen Modal here to avoid TS4023 (`ModalProps` cannot be named)
  // when generating .d.ts for the registry object.
  Modal: ComponentType<any>;
  Page: typeof Page;
  Theme: typeof Theme;
};

const Molecules: MoleculesRegistry = {
  Dialog,
  Hero,
  Modal,
  Page,
  Theme,
};

export {
  Dialog,
  Hero,
  Modal,
  Page,
  Theme,
};

export type {
  DialogProps,
  PageProps,
  HeroProps
};

export default Molecules;
