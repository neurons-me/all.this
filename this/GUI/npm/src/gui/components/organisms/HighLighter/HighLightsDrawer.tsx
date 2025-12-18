import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
export type HighLightsFilterMode = 'all' | 'byColor';
export type HighLightsDrawerProps = {
  colors: string[];
  selectedColor?: string;
  defaultSelectedColor?: string;
  onSelectedColorChange?: (color: string) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  mode?: HighLightsFilterMode;
  defaultMode?: HighLightsFilterMode;
  onModeChange?: (mode: HighLightsFilterMode) => void;
  title?: React.ReactNode;
};

function clampPalette(colors: string[]): string[] {
  const next = (colors?.length ? colors : []).slice(0, 8);
  return next;
}

function useControlled<T>({
  value,
  defaultValue,
}: {
  value?: T;
  defaultValue: T;
}) {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const state = (isControlled ? value : uncontrolled) as T;
  const setState = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
    },
    [isControlled],
  );
  return { state, setState, isControlled };
}

export default function HighLightsDrawer(props: HighLightsDrawerProps) {
  const {
    colors: colorsProp,
    selectedColor,
    defaultSelectedColor,
    onSelectedColorChange,
    query,
    defaultQuery,
    onQueryChange,
    mode,
    defaultMode = 'all',
    onModeChange,
    title = 'Highlights',
  } = props;

  const colors = React.useMemo(() => clampPalette(colorsProp), [colorsProp]);

  const { state: modeState, setState: setModeState } = useControlled<HighLightsFilterMode>({
    value: mode,
    defaultValue: defaultMode,
  });

  const { state: colorState, setState: setColorState } = useControlled<string>({
    value: selectedColor,
    defaultValue: defaultSelectedColor ?? colors[0] ?? '#FDE047',
  });

  const { state: queryState, setState: setQueryState } = useControlled<string>({
    value: query,
    defaultValue: defaultQuery ?? '',
  });

  const handleMode = React.useCallback(
    (_: unknown, next: HighLightsFilterMode | null) => {
      if (!next) return;
      setModeState(next);
      onModeChange?.(next);
    },
    [onModeChange, setModeState],
  );

  const handlePickColor = React.useCallback(
    (c: string) => {
      setColorState(c);
      onSelectedColorChange?.(c);
    },
    [onSelectedColorChange, setColorState],
  );

  const handleQuery = React.useCallback(
    (next: string) => {
      setQueryState(next);
      onQueryChange?.(next);
    },
    [onQueryChange, setQueryState],
  );

  return (
    <Box sx={{ width: 360, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
            {title}
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={modeState}
            onChange={handleMode}
            aria-label="Highlights filter mode"
          >
            <ToggleButton value="all" aria-label="All highlights">
              All
            </ToggleButton>
            <ToggleButton value="byColor" aria-label="Filter by color">
              By Color
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <TextField
            value={queryState}
            onChange={(e) => handleQuery(e.target.value)}
            size="small"
            fullWidth
            placeholder="Search highlights"
            inputProps={{ 'aria-label': 'Search highlights' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <span style={{ opacity: 0.65 }}>⌕</span>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {modeState === 'byColor' ? (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {colors.map((c) => {
              const selected = c.toLowerCase() === String(colorState).toLowerCase();
              return (
                <Box
                  key={c}
                  role="button"
                  tabIndex={0}
                  aria-label={`Filter highlights by ${c}`}
                  onClick={() => handlePickColor(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePickColor(c);
                    }
                  }}
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    bgcolor: c,
                    cursor: 'pointer',
                    border: selected ? '2px solid' : '1px solid',
                    borderColor: selected ? 'text.primary' : 'divider',
                    boxShadow: selected ? 1 : 0,
                    transform: selected ? 'scale(1.08)' : 'none',
                    transition: 'transform 120ms ease',
                  }}
                />
              );
            })}
            <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.75 }}>
              Select a color to filter.
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Divider />

      {/* Content area: will be implemented next */}
      <Box sx={{ p: 2, pt: 1.5 }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Drawer content coming next…
        </Typography>
      </Box>
    </Box>
  );
}

(HighLightsDrawer as any).displayName = 'Gui.HighLightsDrawer';