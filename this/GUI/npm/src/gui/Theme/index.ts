// src/themes/index.ts
// Global tokens shared by all themes (radius, spacing, zIndex, etc.)
export type { Theme } from '@mui/material/styles';
// Theme persistence utilities
export { getInitialThemeId, usePersistentThemeId } from './utils/persistence';
// Theme context and provider
export { ThemeContext, useThemeContext } from '@/gui/contexts/ThemeContext';
export { default as GuiProvider } from './GuiProvider';
// Theme catalog access
export {
  GuiThemes,
  FlatGuiThemes,
  getGuiThemes,
  getFlatGuiThemes,
  getGuiTheme,
  getFlatGuiTheme,
} from './utils/catalog';