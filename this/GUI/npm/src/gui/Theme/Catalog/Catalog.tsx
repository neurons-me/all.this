// ThemesCatalog.tsx
import type { ThemesCatalogProps } from './Catalog.types';
import { getGuiThemes } from '@/gui/Theme/utils/catalog';
import type { ThemeManifest } from '@/types/theme';
import Grid from '@/gui/atoms/Grid/Grid';
import Card from '@/gui/molecules/Card/Card';
import CardHeader from '@/gui/molecules/Card/CardHeader/CardHeader';
import CardContent from '@/gui/molecules/Card/CardContent/CardContent';
import CardActions from '@/gui/molecules/Card/CardActions/CardActions';
import Typography from '@/gui/atoms/Typography/Typography';
import Box from '@/gui/atoms/Box/Box';
import Avatar from '@/gui/atoms/Avatar/Avatar';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import MuiSwitch from '@mui/material/Switch';
import Icon from '@/gui/Theme/Icon/Icon';
import { useThemeContext } from '@/gui/contexts/ThemeContext';
function getPreviewSwatches(item: ThemeManifest) {
  const swatches = [];
  const lightMode = item.mode?.light;
  if (typeof lightMode === 'object' && lightMode?.palette) {
    if (lightMode.palette.primary?.main) {
      swatches.push({ label: 'Primary', value: lightMode.palette.primary.main });
    }
    if (lightMode.palette.secondary?.main) {
      swatches.push({ label: 'Secondary', value: lightMode.palette.secondary.main });
    }
    if (lightMode.palette.background?.default) {
      swatches.push({ label: 'Background', value: lightMode.palette.background.default });
    }
  }
  return swatches;
}
export default function ThemesCatalog({ sx, variant = 'grid' }: ThemesCatalogProps = {}) {
  const themes = getGuiThemes();
  const { setMode, mode: activeMode, themeId, setThemeId } = useThemeContext();
  if (!themes || themes.length === 0) {
    return <Typography>No themes available.</Typography>;
  }

  // Shared card rendering logic as a helper
  const ThemeCard = ({ theme }: { theme: ThemeManifest }) => {
    const light = Boolean(theme.mode?.light);
    const dark = Boolean(theme.mode?.dark);
    const isDarkSelected = activeMode === 'dark';
    return (
      <Box sx={{ position: 'relative' }}>
        <Card
          sx={{
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'background.default',
            border: (theme.mode.light as any).palette?.primary?.main
              ? `1px solid ${(theme.mode.light as any).palette.primary.main}`
              : '1px solid rgba(0,0,0,0.04)',
            borderRadius: 1.5,
            boxShadow: 'none',
            height: '100%',
            gap: 0.25,
          }}
        >
          <CardHeader
            sx={{ mb: 0, '& .MuiCardHeader-content': { overflow: 'hidden' } }}
            avatar={
              theme.badgeUrl ? (
                <Avatar src={theme.badgeUrl} alt={theme.themeName} />
              ) : (
                <Avatar>{theme.themeName?.[0] ?? 'T'}</Avatar>
              )
            }
            title={theme.themeName}
            subheader={theme.author}
          />
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
            {getPreviewSwatches(theme).map((sw, i) => (
              <Tooltip key={`${theme.themeId}-swatch-${i}`} title={sw.label}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: 1,
                    ...(String(sw.value).includes('gradient')
                      ? { background: sw.value }
                      : { bgcolor: sw.value }),
                    border: '1px solid rgba(0,0,0,0.2)',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Checkbox
              size="small"
              color="primary"
              checked={theme.themeId === themeId}
              onChange={() => {
                if (typeof setThemeId === 'function') {
                  setThemeId(theme.themeId ?? '');
                }
                if (typeof setMode === 'function') {
                  const fallbackMode: 'light' | 'dark' = theme.defaultMode === 'dark' ? 'dark' : 'light';
                  setMode(fallbackMode);
                }
              }}
              sx={{
                p: 0.5,
                backgroundColor: 'background.paper',
                borderRadius: 1,
              }}
            />
          </Box>
          <CardContent sx={{ p: 0.75, pt: 0.25 }}>
            <Typography variant="body2" color="text.secondary">
              {theme.description}
            </Typography>
            {theme.themeId === themeId && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5, mb: 0.25 }}>
                <Icon name="light_mode" style={{ opacity: light ? 1 : 0.4 }} />
                <MuiSwitch
                  size="small"
                  checked={isDarkSelected}
                  disabled={!light || !dark}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const nextMode = checked ? 'dark' : 'light';
                    if (typeof setMode === 'function') {
                      try { setMode(nextMode); } catch {}
                    }
                  }}
                  inputProps={{ 'aria-label': 'Toggle light/dark mode' }}
                />
                <Icon name="dark_mode" style={{ opacity: dark ? 1 : 0.4 }} />
              </Box>
            )}
          </CardContent>
          <CardActions>
          </CardActions>
        </Card>
      </Box>
    );
  };

  if (variant === 'list') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
        {themes.map((theme: ThemeManifest) => (
          <Box key={theme.themeId}>
            <ThemeCard theme={theme} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={sx}>
      {themes.map((theme: ThemeManifest) => (
        <Grid item key={theme.themeId} xs={12} sm={6} md={4} lg={3}>
          <ThemeCard theme={theme} />
        </Grid>
      ))}
    </Grid>
  );
}