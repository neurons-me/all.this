// src/themes/index.ts
// Global tokens shared by all themes (radius, spacing, zIndex, etc.)
export type { Theme as MuiTheme } from '@mui/material/styles';
// Theme persistence utilities
export { getInitialThemeId, usePersistentThemeId } from './utils/persistence';
// Theme context and Theme component
export { ThemeContext, useThemeContext } from '@/gui/contexts/ThemeContext';
export { default as Theme } from './Theme';
// Theme catalog UI (components)
export { default as ThemesCatalog } from './Catalog/Catalog';
// Back-compat / simple docs API (some pages expect `window.GUI.Catalog`)
export { default as Catalog } from './Catalog/Catalog';
export {
  GuiThemes,
  FlatGuiThemes,
  getGuiThemes,
  getFlatGuiThemes,
  getGuiTheme,
  getFlatGuiTheme
} from './utils/catalog';