/*
 * This.GUI — Typography (polymorphic)
 * Thin wrapper over MUI's Typography that preserves its full polymorphic API:
 * - `component` / `as` (MUI OverridableComponent)
 * - `variantMapping`
 * - works with router links (`component={Link}`) or anchors (`component="a"`)
 *
 * Import from "@/gui/atoms" instead of "@mui/material" so we can change
 * the underlying engine without breaking consumers.
 */
import * as React from 'react';
import MuiTypography from '@mui/material/Typography';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { TypographyTypeMap } from '@mui/material/Typography';
// Public prop type (mirrors MUI's polymorphic typing)
export type TypographyProps = React.ComponentProps<
  OverridableComponent<TypographyTypeMap<{}, 'span'>>
>;
// Component: preserve MUI OverridableComponent so `component` works as in MUI
const Typography = MuiTypography as unknown as OverridableComponent<
  TypographyTypeMap<{}, 'span'>
>;
// DevTools label
(Typography as any).displayName = 'Gui.Typography';
// Helpful alias for consumers who prefer a prefixed name
export type GuiTypographyProps = TypographyProps;
export default Typography;