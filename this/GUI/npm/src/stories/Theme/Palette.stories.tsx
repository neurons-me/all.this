import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
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
