import * as React from 'react';
import clsx from 'clsx';
import Box from '@/gui/atoms/Box/Box';
import IconButton from '@/gui/atoms/IconButton/IconButton';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import Icon from '@/gui/Theme/Icon/Icon';
import Tooltip from '@/gui/atoms/Tooltip/Tooltip';
import Drawer from '@/gui/atoms/Drawer/Drawer';
import HighLightsDrawer from '@/gui/widgets/HighLighter/HighLightsDrawer';

export type HighLighterColor = string;

export type HighLighterProps = {
  /** Optional custom palette shown in the tooltip */
  colors?: HighLighterColor[];
  /** Currently selected color (controlled) */
  value?: HighLighterColor;
  /** Default selected color (uncontrolled) */
  defaultValue?: HighLighterColor;
  /** Fired whenever a color is selected */
  onChange?: (color: HighLighterColor) => void;

  /** Tooltip label shown above the palette */
  title?: React.ReactNode;
  /** Tooltip size preset */
  tooltipSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** MUI placement for tooltip */
  placement?:
    | 'bottom'
    | 'bottom-end'
    | 'bottom-start'
    | 'left'
    | 'left-end'
    | 'left-start'
    | 'right'
    | 'right-end'
    | 'right-start'
    | 'top'
    | 'top-end'
    | 'top-start';

  /** Icon configuration */
  iconName?: string;
  iconSize?: number | string;
  className?: string;
  style?: React.CSSProperties;

  /** Disabled state */
  disabled?: boolean;
};

const DEFAULT_COLORS: HighLighterColor[] = [
  '#FDE047', // yellow
  '#86EFAC', // green
  '#93C5FD', // blue
  '#FCA5A5', // red
  '#D8B4FE', // purple
];

function clampPalette(colors: HighLighterColor[]): HighLighterColor[] {
  // Keep it simple: ensure exactly 5 items when possible.
  const next = (colors?.length ? colors : DEFAULT_COLORS).slice(0, 5);
  while (next.length < 5) next.push(DEFAULT_COLORS[next.length]);
  return next;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(255,255,0,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function useControlledColor({
  value,
  defaultValue,
}: {
  value?: HighLighterColor;
  defaultValue?: HighLighterColor;
}) {
  const [uncontrolled, setUncontrolled] = React.useState<HighLighterColor>(
    defaultValue ?? DEFAULT_COLORS[0],
  );
  const isControlled = value != null;
  const color = (isControlled ? value : uncontrolled) as HighLighterColor;
  const setColor = React.useCallback(
    (next: HighLighterColor) => {
      if (!isControlled) setUncontrolled(next);
    },
    [isControlled],
  );
  return { color, setColor, isControlled };
}

/**
 * This.GUI — HighLighter (organism)
 *
 * A marker/highlighter toggle button that opens a click-to-open tooltip palette
 * (5 circular swatches). Picking a swatch activates "marker mode":
 * - The cursor becomes a marker/highlighter (SVG cursor) and selection highlight color is applied via global CSS
 * - The selected color is exposed via `data-high-lighter-color` and CSS var
 *   `--gui-highlighter-color` on <html>
 * - A CustomEvent `gui:highlighter` is dispatched on window.
 *
 * You can implement actual text-highlighting in your editor by listening for:
 *   window.addEventListener('gui:highlighter', (e) => ...)
 * and/or by reading `document.documentElement.dataset.highLighterActive`.
 */
export default function HighLighter(props: HighLighterProps) {
  const {
    colors: colorsProp,
    value,
    defaultValue,
    onChange,
    title = 'Highlighter',
    tooltipSize = 'md',
    placement = 'right',
    iconName = 'ink_marker',
    iconSize = 22,
    className,
    style,
    disabled,
  } = props;

  const colors = React.useMemo(() => clampPalette(colorsProp ?? DEFAULT_COLORS), [colorsProp]);
  const { color, setColor } = useControlledColor({ value, defaultValue });

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const applyGlobalState = React.useCallback(
    (nextActive: boolean, nextColor: HighLighterColor) => {
      const root = document.documentElement;

      // dataset signals for external consumers
      root.dataset.highLighterActive = String(nextActive);
      root.dataset.highLighterColor = nextColor;

      // css vars for styling cursors/overlays/etc
      root.style.setProperty('--gui-highlighter-color', nextColor);
      root.style.setProperty('--gui-highlighter-rgba', hexToRgba(nextColor, 0.45));

      // cursor + selection
      // We set an SVG cursor. It can't be dynamically recolored in all browsers,
      // so we ship a "marker" silhouette and still expose the chosen color via CSS vars.
      const cursorSvg = encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <path d="M21.7 3.3c-1.2-1.2-3.1-1.2-4.2 0L7.2 13.6c-.3.3-.5.7-.6 1.1L5 21.9c-.2.8.6 1.6 1.4 1.4l7.2-1.6c.4-.1.8-.3 1.1-.6L24.9 7.5c1.2-1.2 1.2-3.1 0-4.2l-3.2-3.2z" fill="#111"/>
          <path d="M6.5 22.5l8-1.8-6.2-6.2-1.8 8z" fill="#555"/>
        </svg>
      `);

      if (nextActive) {
        root.style.cursor = `url("data:image/svg+xml,${cursorSvg}") 2 26, text`;
        root.style.setProperty('--gui-highlighter-active', '1');
      } else {
        root.style.cursor = '';
        root.style.removeProperty('--gui-highlighter-active');
      }
    },
    [],
  );

  // Keep globals in sync when active/color changes.
  React.useEffect(() => {
    // Avoid touching DOM in SSR
    if (typeof document === 'undefined') return;
    applyGlobalState(active, color);
    return () => {
      // If component unmounts while active, clean up.
      if (active) {
        const root = document.documentElement;
        delete root.dataset.highLighterActive;
        delete root.dataset.highLighterColor;
        root.style.removeProperty('--gui-highlighter-color');
        root.style.removeProperty('--gui-highlighter-rgba');
        root.style.cursor = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, color]);

  const handleToggleOpen = React.useCallback(() => {
    if (disabled) return;
    // If already active and the palette isn't open, a click toggles OFF (natural pen behavior).
    if (active && !open) {
      setActive(false);
      return;
    }
    setOpen((v) => !v);
  }, [disabled, active, open]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setDrawerOpen(false);
  }, []);

  const handlePick = React.useCallback(
    (next: HighLighterColor) => {
      setColor(next);
      onChange?.(next);
      setActive(true);
      setOpen(false);
      setDrawerOpen(false);
    },
    [onChange, setColor],
  );

  // Drawer open/close handlers for "Show Highlights"
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerClose = React.useCallback(() => setDrawerOpen(false), []);
  const handleDrawerOpen = React.useCallback(() => {
    setDrawerOpen(true);
    setOpen(false);
  }, []);

  const [filterMode, setFilterMode] = React.useState<'all' | 'byColor'>('all');
  const [filterColor, setFilterColor] = React.useState<string>(color);

  React.useEffect(() => {
    setFilterColor(color);
  }, [color]);

  // Inject global selection styles once (scoped by data-high-lighter-active)
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'gui-highlighter-selection-style';
    if (document.getElementById(id)) return;

    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
      html[data-high-lighter-active="true"] ::selection {
        background: var(--gui-highlighter-rgba, rgba(253, 224, 71, 0.45));
      }
      html[data-high-lighter-active="true"] ::-moz-selection {
        background: var(--gui-highlighter-rgba, rgba(253, 224, 71, 0.45));
      }
    `;
    document.head.appendChild(el);
  }, []);

  const tooltipContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {title ? (
        <Box sx={{ fontWeight: 600, lineHeight: 1.1, pr: 0.5 }}>{title}</Box>
      ) : null}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {colors.map((c) => {
          const selected = c.toLowerCase() === String(color).toLowerCase();
          return (
            <Box
              key={c}
              role="button"
              aria-label={`Select marker color ${c}`}
              tabIndex={0}
              onClick={() => handlePick(c)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePick(c);
                }
              }}
              sx={{
                width: 18,
                height: 18,
                borderRadius: '999px',
                bgcolor: c,
                cursor: 'pointer',
                border: selected ? '2px solid' : '1px solid',
                borderColor: selected ? 'text.primary' : 'divider',
                boxShadow: selected ? 1 : 0,
                transform: selected ? 'scale(1.05)' : 'none',
                transition: 'transform 120ms ease',
              }}
            />
          );
        })}
      </Box>

      <Box
        role="button"
        tabIndex={0}
        onClick={handleDrawerOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDrawerOpen();
          }
        }}
        sx={{
          mt: 0.5,
          px: 1,
          py: 0.75,
          borderRadius: 1,
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <span>Show Highlights</span>
        <span style={{ opacity: 0.7 }}>→</span>
      </Box>
    </Box>
  );

  const highlightSelection = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    // Wrap selection in a span with a background using the selected highlighter color.
    const span = document.createElement('span');
    span.setAttribute('data-gui-highlighter', 'true');
    // Marker-like look: softer corners, a touch of vertical padding, and a subtle inner shading.
    span.style.background = hexToRgba(color, 0.42);
    span.style.borderRadius = '999px';
    span.style.padding = '0.06em 0.18em';
    span.style.boxDecorationBreak = 'clone';
    (span.style as any)['-webkit-box-decoration-break'] = 'clone';
    span.style.boxShadow = `inset 0 -0.18em 0 0 rgba(0,0,0,0.06)`;
    span.style.display = 'inline';
    try {
      range.surroundContents(span);
      sel.removeAllRanges();
    } catch {
      // surroundContents fails for partially-selected nodes; fallback to extract/insert.
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
      sel.removeAllRanges();
    }

    window.dispatchEvent(
      new CustomEvent('gui:highlighter:highlight', {
        detail: { color },
      }),
    );
  }, [color]);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).guiHighLighter = {
      highlightSelection,
      get active() {
        return document.documentElement.dataset.highLighterActive === 'true';
      },
      get color() {
        return document.documentElement.dataset.highLighterColor;
      },
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (window as any).guiHighLighter;
    };
  }, [highlightSelection]);
  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ display: 'inline-flex' }} className={className} style={style}>
        <Tooltip
          title={tooltipContent}
          open={open}
          onClose={handleClose}
          disableHoverListener
          disableFocusListener
          disableTouchListener
          placement={placement}
          arrow
          size={tooltipSize}
        >
          <IconButton
            size="small"
            disabled={disabled}
            aria-label="HighLighter"
            onClick={handleToggleOpen}
            sx={{
              borderRadius: 2,
              border: active ? '1px solid' : '1px solid',
              borderColor: active ? 'text.primary' : 'divider',
              bgcolor: active ? 'action.selected' : 'transparent',
            }}
          >
            <Icon
              name={iconName}
              fontSize={iconSize}
              iconColor={active ? color : undefined}
              className={clsx(active && 'Gui-HighLighter-active')}
            />
          </IconButton>
        </Tooltip>
        <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
          <HighLightsDrawer
            title="Highlights"
            colors={colors}
            mode={filterMode}
            onModeChange={setFilterMode}
            selectedColor={filterColor}
            onSelectedColorChange={setFilterColor}
          />
        </Drawer>
      </Box>
    </ClickAwayListener>
  );
}

(HighLighter as any).displayName = 'Gui.HighLighter';
export { DEFAULT_COLORS };
