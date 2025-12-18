import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useTheme, Box, Typography } from '@mui/material';

const meta: Meta = {
  title: 'Theme/Palette',
};

export default meta;

const PaletteViewer: React.FC = () => {
  const theme = useTheme();
  const palette = theme.palette;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 2,
        maxHeight: '80vh',
        overflowY: 'auto',
        p: 2,
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
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'flex', flexDirection: 'column' }}
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
  );
};

export const Default: StoryFn = () => <PaletteViewer />;
