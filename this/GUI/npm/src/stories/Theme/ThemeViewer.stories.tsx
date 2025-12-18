/**
 * ## Theme Viewer Story
 *
 * This story provides a live JSON visualization of your theme context and MUI theme.
 *
 * ### What you will see:
 * - `mode`: Comes from your `ThemeContext`, shows if your theme is in `light` or `dark` mode.
 * - `palette`: Full palette details from MUI's `createTheme`, including all primary/secondary colors, actions, background, etc.
 * - `insets`: Comes from `InsetsContext`, gives layout-safe-area insets for notch-aware designs (top, right, bottom, left).
 *
 * ### Why use this?
 * It’s useful for debugging:
 * - If your theme is being applied correctly
 * - How your layout adjusts with different inset values
 * - How palettes resolve across modes
 *
 * Great for verifying dynamic theme changes or testing new color tokens.
 */
import type { Meta } from '@storybook/react';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '@/gui/contexts/ThemeContext';
import { useInsets } from '@/gui/hooks';

/**
 * Story: CurrentThemeState
 *
 * This Storybook story displays the current theme state injected via MUI's ThemeProvider
 * along with custom context values such as `mode` (from ThemeContext) and `insets` (from InsetsContext).
 *
 * The output includes:
 * - `mode`: Light/dark mode from the app's ThemeContext
 * - `palette`: Full palette object from MUI's `createTheme`, including color tokens and UI actions
 * - `insets`: Safe area insets (top/right/bottom/left) for layout padding/margin
 *
 * Useful for debugging how the current theme looks, understanding the applied color system,
 * and ensuring injected context values are correctly picked up across the app.
 */
export const CurrentThemeState = () => {
  const theme = useTheme();
  const { mode, themeId } = useThemeContext();
  const { insets } = useInsets();
  return (
    <pre style={{ padding: 16 }}>
      <code>
        {JSON.stringify(
          {
            mode,
            themeId,
            palette: theme.palette,
            fontFamily: theme.typography?.fontFamily,
            typography: theme.typography,
            insets,
          },
          null,
          2
        )}
      </code>
    </pre>
  );
};

export default {
  title: 'Theme/Viewer',
  component: CurrentThemeState,
tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
This story renders the **active theme state** used throughout your app.

### What you will see:
- \`mode\`: Current light/dark mode from ThemeContext
- \`palette\`: Full MUI palette object generated from createTheme(), including:
  - primary, secondary, error, warning, success, info colors
  - background and text colors
  - action states (hover, focus, selected, etc.)
- \`insets\`: Safe area layout padding (top/right/bottom/left) from InsetsContext (useful for notch-aware design)

### Why this is useful:
- Debug whether the correct theme is being used
- Inspect how palette tokens resolve dynamically
- Verify how inset values change (iOS, Android, desktop)
- Helps debug dynamic theme toggles and token propagation

Ideal for inspecting changes in real-time while modifying theme-related code or tokens.
          `,
      },
    },
  },
} satisfies Meta<typeof CurrentThemeState>;