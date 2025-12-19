import React from 'react';
import { Box } from '@/gui/atoms';
import { useInsets, useGuiTheme } from '@/gui/hooks';
import type { SectionProps } from './Section.types';

const Section: React.FC<SectionProps> = ({
  children,
  sx,
  maxWidth = '100%',
  component = 'section',
  bgcolor,
  colorVariant,
  padding,
  height,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
}) => {
  const insets = useInsets();
  const theme = useGuiTheme();
  // Determine if bgcolor is a theme token or raw color
  // We check if bgcolor matches a key path in theme.palette or if it is a raw color string
  const isThemeToken = (color: string) => {
    if (!color) return false;
    // Simple heuristic: theme tokens contain dot notation or match keys in palette
    if (color.includes('.')) {
      const parts = color.split('.');
      let obj: any = theme.palette;
      for (const part of parts) {
        if (obj && part in obj) {
          obj = obj[part];
        } else {
          return false;
        }
      }
      return true;
    }
    return color in theme.palette;
  };

  let finalBgcolor: string | undefined;
  if (bgcolor) {
    finalBgcolor = isThemeToken(bgcolor) ? bgcolor : bgcolor;
  } else if (colorVariant && theme.palette.section && colorVariant in theme.palette.section) {
    finalBgcolor = theme.palette.section[colorVariant];
  }

  return (
    <Box
      component={component}
      sx={{
        // Responsive width/height: fill viewport, but margin aligns with insets
        width: `calc(100vw - ${insets.left + insets.right}px)`,
        height: height ? height : `calc(100vh - ${insets.top + insets.bottom}px)`,
        marginTop: marginTop !== undefined ? marginTop : insets.top,
        marginBottom: marginBottom !== undefined ? marginBottom : insets.bottom,
        marginLeft: marginLeft !== undefined ? marginLeft : insets.left,
        marginRight: marginRight !== undefined ? marginRight : insets.right,
        maxWidth,
        // Responsive internal padding
        padding: padding !== undefined ? padding : {
          xs: 2,
          sm: 3,
          md: 4,
        },
        ...(finalBgcolor ? { bgcolor: finalBgcolor } : {}),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default Section;