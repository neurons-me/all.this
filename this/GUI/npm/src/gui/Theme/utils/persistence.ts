//src/themes/utils/persistence.ts
// Utility to persist user's themeId using localStorage.
import { useState, useEffect } from 'react';
/**
 * Retrieves the initial themeId from localStorage.
 * Falls back to the provided default if not found or on error.
 *
 * @param fallback - The fallback themeId to use if none is stored.
 * @returns The stored themeId or the fallback value.
 */
export function getInitialThemeId(fallback: string): string {
  try {
    return localStorage.getItem('this.gui:themeId') || fallback;
  } catch {
    return fallback;
  }
}
/**
 * React hook to persist and manage the themeId using localStorage.
 * Returns a [themeId, setThemeId] tuple just like useState.
 *
 * @param fallback - The fallback themeId if no previous value is stored.
 * @returns A tuple [themeId, setThemeId] that syncs with localStorage.
 */
export function usePersistentThemeId(
  fallback: string
): [string, React.Dispatch<React.SetStateAction<string>>] {
  const [themeId, setThemeId] = useState<string>(() => getInitialThemeId(fallback));
  useEffect(() => {
    try {
      localStorage.setItem('this.gui:themeId', themeId);
    } catch {
      // fail silently
    }
  }, [themeId]);
  return [themeId, setThemeId];
}

/**
 * React hook to persist and manage the theme mode (light/dark) using localStorage.
 * Returns a [mode, setMode] tuple just like useState.
 *
 * @param fallback - The fallback mode if no previous value is stored.
 * @returns A tuple [mode, setMode] that syncs with localStorage.
 */
export function usePersistentThemeMode(
  fallback: 'light' | 'dark'
): ['light' | 'dark', React.Dispatch<React.SetStateAction<'light' | 'dark'>>] {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('this.gui:themeMode');
      if (stored === 'dark' || stored === 'light') return stored;
      return fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('this.gui:themeMode', mode);
    } catch {
      // fail silently
    }
  }, [mode]);
  return [mode, setMode];
}