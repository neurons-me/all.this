//src/themes/utils/themeContext.ts
import React, { createContext, useContext } from 'react';
import type { GuiContextValue } from '@/types/theme';
/**
 * ThemeContext
 * ------------
 * Provides access to the GUI theme context (`GuiContextValue`) throughout the application.
 * 
 * This context is intended to be consumed by components that need to access or manipulate:
 *  - the current theme key (e.g., 'neurons-light')
 *  - the selected family and mode
 *  - available themes
 *  - helper actions like `toggleMode`, `setMode`, etc.
 * 
 * The context value is expected to be provided by `Theme`, which wraps the app.
 */
export const ThemeContext = createContext<GuiContextValue | undefined>(undefined);
/**
 * useThemeContext
 * ---------------
 * Custom hook to access the GUI theme context.
 * 
 * This hook ensures that it is only used within the `Theme` tree.
 * If accessed outside the provider, it throws an error to help with debugging.
 * 
 * @returns {GuiContextValue} - The full GUI theme context state and helpers.
 */
export const useThemeContext = (): GuiContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a Theme provider');
  }
  return context;
};
