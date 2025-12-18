/**
 * This.GUI — Tooltip (atom)
 * Thin wrapper around MUI's Tooltip that keeps a stable import path:
 *   import { Tooltip } from '@/gui/atoms'
 *
 * Extensions:
 * - Adds an optional `size` prop (`'sm' | 'md' | 'lg' | 'xl'`) to scale typography/padding/arrow.
 * - Still allows granular overrides via `slotProps.tooltip.sx` and `slotProps.arrow.sx`
 *   which take precedence (our size styles are merged first).
 *
 * Notes:
 * - Tooltip is NOT polymorphic (no `component` prop).
 * - Works seamlessly with This.GUI theme through GuiProvider.
 *
 * Examples:
 *   &lt;Tooltip title="Hello"&gt;&lt;Button&gt;Hover me&lt;/Button&gt;&lt;/Tooltip&gt;
 *   &lt;Tooltip title="Info" size="lg" arrow placement="right" slotProps={{ tooltip: { sx: { bgcolor: 'primary.main' } } }}&gt;
 *     &lt;IconButton&gt;&lt;Icon name="mui:Info" /&gt;&lt;/IconButton&gt;
 *   &lt;/Tooltip&gt;
 */
import * as React from 'react';
import MuiTooltip, { type TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip';
export type TooltipSize = 'sm' | 'md' | 'lg' | 'xl';
export type TooltipProps = Omit<MuiTooltipProps, 'slotProps'> & {
  /**
   * Visual size of the tooltip bubble (typography + padding + arrow).
   * This is a This.GUI extension; if omitted, MUI defaults are used.
   */
  size?: TooltipSize;
  /**
   * Keep MUI slotProps but allow merging with size presets.
   * User-provided sx is applied AFTER our size preset, so it wins.
   */
  slotProps?: MuiTooltipProps['slotProps'];
};

const SIZE_PRESETS: Record<TooltipSize, { tooltipSx: any; arrowSx: any }> = {
  sm: { tooltipSx: { fontSize: 11, p: '4px 8px' },  arrowSx: { fontSize: 10 } },
  md: { tooltipSx: { fontSize: 13, p: '6px 10px' }, arrowSx: { fontSize: 12 } },
  lg: { tooltipSx: { fontSize: 15, p: '8px 12px' }, arrowSx: { fontSize: 14 } },
  xl: { tooltipSx: { fontSize: 17, p: '10px 14px' }, arrowSx: { fontSize: 16 } },
};

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(props, ref) {
  const { size, slotProps, ...rest } = props;
  // Build merged slotProps so consumer overrides win
  const preset = size ? SIZE_PRESETS[size] : undefined;
  const mergedSlotProps = React.useMemo<any>(() => {
    if (!preset) return slotProps;
    const next = { ...slotProps };
    // Tooltip content
    next.tooltip = {
      ...(slotProps?.tooltip as any),
      // Ensure `sx` is an array so both apply; user-provided last wins.
      sx: [preset.tooltipSx, (slotProps?.tooltip as any)?.sx].filter(Boolean) as any,
    } as any;
    // Arrow (applies only if `arrow` prop is set, but harmless to keep)
    next.arrow = {
      ...(slotProps?.arrow as any),
      sx: [preset.arrowSx, (slotProps?.arrow as any)?.sx].filter(Boolean) as any,
    } as any;
    return next;
  }, [preset, slotProps]);

  return <MuiTooltip ref={ref} slotProps={mergedSlotProps} {...rest} />;
});

(Tooltip as any).displayName = 'Gui.Tooltip';
export default Tooltip;
export type { TooltipProps as GuiTooltipProps };