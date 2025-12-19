import React from 'react';
import { Box, useTheme } from '@mui/material';
import type { HeroProps } from './Hero.types';

function resolveBlurRadius(theme: any, blur?: 'none'|'light'|'medium'|'heavy'|'all'): string {
  if (!blur || blur === 'none') return '0px';
  const fromTheme = theme?.custom?.blurRadius?.[blur];
  return fromTheme ?? '0px';
}

function resolveOverlayColor(
  theme: any,
  blur?: 'none' | 'light' | 'medium' | 'heavy' | 'all',
  customColor?: string,
  overlayColor?: string
): string {
  const paletteBlur = blur ? theme?.palette?.blur?.[blur] : undefined;

  const resolved =
    customColor
      ? customColor
      : paletteBlur?.$value
      ? paletteBlur.$value
      : typeof paletteBlur === 'string'
      ? paletteBlur
      : overlayColor || 'transparent';

  console.log('resolveOverlayColor inputs:', { blur, customColor, overlayColor, paletteBlur });
  console.log('resolveOverlayColor resolved:', resolved);

  return resolved;
}

function resolveMediaFilter(blurRadius: string, blur?: 'none'|'light'|'medium'|'heavy'|'all'): string | undefined {
  if (!blur || blur === 'none') return 'none';
  return blur === 'all' ? 'saturate(1.05) brightness(0.96)' : 'none';
}

export const Hero: React.FC<HeroProps> = ({
  backgroundSrc,
  backgroundType = 'image',
  overlayColor,
  children,
  height = '100vh',
  padding = 4,
  blur,
  customColor,
}) => {
  const theme = useTheme();

  //console.log('theme.palette.blur:', theme.palette.blur);
  //console.log('theme.custom.blurRadius:', theme.custom.blurRadius);
  //console.log(theme.palette.blur);
  const blurRadius = resolveBlurRadius(theme, blur);
  const overlayBg  = resolveOverlayColor(theme, blur, customColor, overlayColor);
  const mediaFilter = resolveMediaFilter(blurRadius, blur);

  return (
    <Box
      component="section"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        zIndex: 0,
        backgroundColor: 'transparent',
      }}
    >
      {backgroundSrc && (
        <>
          {backgroundType === 'video' ? (
            <Box
              component="video"
              src={backgroundSrc}
              autoPlay
              muted
              loop
              playsInline
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
                filter: mediaFilter,
                willChange: 'transform, filter',
                transform: 'translateZ(0)',
              }}
            />
          ) : (
            <Box
              component="img"
              src={backgroundSrc}
              alt=""
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
                filter: mediaFilter,
                willChange: 'transform, filter',
                transform: 'translateZ(0)',
              }}
            />
          )}

          {/* Overlay Layer */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: overlayBg,
              // backdropFilter: blur ? `blur(${blurRadius})` : undefined,
              // WebkitBackdropFilter: blur ? `blur(${blurRadius})` : undefined,
              zIndex: 2,
              transition: 'opacity 0.4s ease',
            }}
          />
        </>
      )}

      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          color: 'text.primary',
          px: padding,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
