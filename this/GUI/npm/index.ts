// =========================================
// this.gui public entry (root)
// Goal:
// - Provide *tree-shakeable* named exports for app bundlers.
// - Provide a *small* runtime aggregate for UMD/introspection (no default export).
//
// Rule 0 (API stability):
// - ❌ Do NOT use `export *` in the root entrypoint.
//   Root exports must be explicit so we control the public surface, avoid accidental leaks,
//   and prevent name collisions.
//
// Pattern:
//  1) constants
//  2) explicit named exports (tree-shakeable)
//  3) runtime aggregates (UMD/global convenience)
//
// Usage examples:
//   // ✅ Recommended (tree-shakeable)
//   import { Theme, ThemeModeToggle, Icon } from 'this.gui';
//
//   // ✅ UMD/global usage (browser)
//   // window.GUI.Button, window.GUI.mount, etc.
//
//   // ✅ Subpath imports (more explicit boundaries)
//   // import { Button } from 'this.gui/atoms';
//   // import { useThemeContext } from 'this.gui/contexts';
//   // import { Hero } from 'this.gui/molecules';
//
// Notes:
// - Keep the *root exports* SMALL (core primitives + a few top-level components) to protect tree-shaking.
// - Large aggregates (GUI.atoms / GUI.molecules / GUI.Components) should live in a separate
//   entrypoint (e.g. `this.gui/full`) if you decide to offer that convenience.
// =========================================
// 1) constants
declare const __GUI_VERSION__: string;
const injectedVersion = typeof __GUI_VERSION__ !== 'undefined' ? __GUI_VERSION__ : undefined;
export const version = injectedVersion || '0.0.0-dev';
export type { Theme as MuiTheme } from '@mui/material/styles';
// 2) named exports (tree-shakeable)
// Core primitives (ergonomic root exports)
// NOTE: Export from concrete modules (not barrels) to preserve tree-shaking and avoid pulling in the whole atoms surface.
export { default as Box } from '@/gui/atoms/Box/Box';
export { default as Button } from '@/gui/atoms/Button/Button';
export { default as Link } from '@/gui/atoms/Link/Link';
export { default as Paper } from '@/gui/atoms/Paper/Paper';
export { default as TextField } from '@/gui/atoms/TextField/TextField';
export { default as Typography } from '@/gui/atoms/Typography/Typography';
// Friendly aliases (optional ergonomics)
export { default as Text } from '@/gui/atoms/Typography/Typography';
export { default as Input } from '@/gui/atoms/TextField/TextField';
export { default as Theme } from '@/gui/Theme/Theme';
export { default as Layout } from '@/gui/Layout/Layout';
export { default as Icon } from '@/gui/Theme/Icon/Icon';
export { default as ThemeModeToggle } from '@/gui/Theme/ToggleMode/ToggleMode';
export { default as Blockchain } from '@/gui/components/Blockchain/blockchain';
export { default as HighLighter } from '@/gui/widgets/HighLighter/HighLighter';
export { default as CodeBlock } from '@/gui/molecules/CodeBlock/CodeBlock';
export { default as Modal } from '@/gui/molecules/Modal/Modal';
export { ThemesCatalog, Catalog } from '@/gui/Theme';
export {
  default as GUITools,
  guiToolsElements,
  guiToolsLeftSidebarConfig,
} from '@/gui/molecules/menus/GUI-Tools/GUI-Tools';
// 3) runtime aggregates (UMD/global convenience)
// These are *named exports* so in UMD builds you can do:
//   window.GUI.mount(...)
//   window.GUI.Button
//   window.GUI.Atoms.Button
// without any `window.GUI.default` wrapper.
// NOTE: We still import concrete modules (not barrels) to preserve tree-shaking.
import ThemeComponent from '@/gui/Theme/Theme';
import Box from '@/gui/atoms/Box/Box';
import Button from '@/gui/atoms/Button/Button';
import Link from '@/gui/atoms/Link/Link';
import Paper from '@/gui/atoms/Paper/Paper';
import TextField from '@/gui/atoms/TextField/TextField';
import Typography from '@/gui/atoms/Typography/Typography';
import Layout from '@/gui/Layout/Layout';
import Icon from '@/gui/Theme/Icon/Icon';
import ThemeModeToggle from '@/gui/Theme/ToggleMode/ToggleMode';
import Blockchain from '@/gui/components/Blockchain/blockchain';
import HighLighter from '@/gui/widgets/HighLighter/HighLighter';
import HighLightsDrawer from '@/gui/widgets/HighLighter/HighLightsDrawer';
import CodeBlock from '@/gui/molecules/CodeBlock/CodeBlock';
import Dialog from '@/gui/molecules/Dialog/Dialog';
import { Hero } from '@/gui/molecules/Hero/Hero';
import Modal from '@/gui/molecules/Modal/Modal';
import Page from '@/gui/molecules/Page/Page';
import { ThemesCatalog } from '@/gui/Theme';
import GUITools, {
  guiToolsElements,
  guiToolsLeftSidebarConfig,
} from '@/gui/molecules/menus/GUI-Tools/GUI-Tools';
import IdentityNoise from '@/gui/components/IdentityNoise/IdentityNoise';

export const Atoms = {
  Box,
  Button,
  Link,
  Paper,
  TextField,
  Typography,
} as const;

export const Molecules = {
  Dialog,
  Hero,
  Modal,
  Page,
  CodeBlock,
} as const;

export const Widgets = {
  HighLighter,
  HighLightsDrawer,
} as const;

export const Components = {
  Blockchain,
  IdentityNoise,
  Icon,
  ThemeModeToggle,
} as const;
export const ThemeRuntime = {
  Theme: ThemeComponent,
  Layout,
  Icon,
  ThemeModeToggle,
} as const;

// Lowercase aliases for explorer/runtime conventions
export const atoms = Atoms;
export const molecules = Molecules;
export const widgets = Widgets;
export const components = Components;
export const theme = ThemeRuntime;
// Menus registry (kept explicit to avoid accidental surface growth)
export const menus = {
  'GUI-Tools': {
    GUITools,
    elements: guiToolsElements,
    leftSidebarConfig: guiToolsLeftSidebarConfig,
  },
} as const;
// Mount API (React runtime)
// GuiNode → renderer → ReactDOM, expects React/ReactDOM globals in UMD usage.
export { mount } from '@/runtime/mount';
export type { MountTarget } from '@/runtime/mount';
