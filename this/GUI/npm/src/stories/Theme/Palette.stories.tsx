import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import { Box, Typography, Toolbar, Bar } from '@/gui/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import { useGuiTheme } from '@/gui/hooks';

const meta: Meta = {
  title: 'GUI/Theme/Palette',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const PaletteViewer: React.FC = () => {
  const theme = useGuiTheme();
  const palette = theme.palette;

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Bar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Icon name="palette" fontSize={20} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            GUI.Palette
          </Typography>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Back to Themes Catalog */}
          <Box
            role="button"
            tabIndex={0}
            title="Go to Themes Catalog"
            aria-label="Go to Themes Catalog"
            onClick={() => {
              try {
                const fn = linkTo('GUI/Theme/Catalog', 'Playground');
                if (typeof fn === 'function') return fn();
              } catch {
                // ignore
              }
              // Fallback hash navigation (works even if addon-links isn't enabled)
              window.location.hash = '#/story/gui-theme-catalog--playground';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.currentTarget as any).click();
              }
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <Icon name="widgets" fontSize={18} />
          </Box>
        </Toolbar>
      </Bar>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 2,
          }}
        >
          {Object.entries(palette).map(([colorKey, colorValue]) => {
            if (typeof colorValue === 'string') {
              // Sometimes palette keys can be strings (rare)
              return (
                <Box key={colorKey} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {colorKey}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: colorValue,
                      height: 48,
                      borderRadius: 1,
                      mb: 1,
                    }}
                  />
                  <Typography variant="caption">{colorValue}</Typography>
                </Box>
              );
            }

            if (typeof colorValue === 'object' && colorValue !== null) {
              return (
                <Box
                  key={colorKey}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {colorKey}
                  </Typography>
                  {Object.entries(colorValue).map(([shadeKey, shadeValue]) => {
                    if (typeof shadeValue !== 'string') return null;
                    return (
                      <Box key={shadeKey} sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            backgroundColor: shadeValue,
                            height: 32,
                            borderRadius: 1,
                            mb: 0.5,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        <Typography variant="caption" sx={{ userSelect: 'text' }}>
                          {shadeKey}: {shadeValue}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              );
            }

            return null;
          })}
        </Box>
      </Box>
    </Box>
  );
};

export const Default: StoryFn = () => <PaletteViewer />;
