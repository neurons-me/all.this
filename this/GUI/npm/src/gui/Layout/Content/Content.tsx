import React from 'react';
import type { SxProps, Theme } from '@mui/system';
import { Box } from '@/gui/atoms';
import { useInsets } from '@/gui/hooks';

export type ContentProps = {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  /**
   * If true, Content will not apply left/right padding from GUI insets.
   * Useful for full-bleed pages where the LeftSidebar already provides spacing.
   */
  disableInsetPadding?: boolean;
};

const Content: React.FC<ContentProps> = ({ children, sx, disableInsetPadding = false }) => {
  const insets = useInsets();
  const safeTop = Math.max(0, Number(insets?.top ?? 0));
  const navHeight = Math.max(0, Number(insets?.nav ?? 0));
  const topInset = safeTop + navHeight;
  const bottomInset = Math.max(0, Number(insets?.bottom ?? 0));
  const leftInset = disableInsetPadding ? 0 : Math.max(0, Number(insets?.left ?? 0));
  const rightInset = disableInsetPadding ? 0 : Math.max(0, Number(insets?.right ?? 0));
  return (
    <Box
      id="content"
      component="main"
      sx={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        paddingTop: `${topInset}px`,
        paddingBottom: `${bottomInset}px`,
        paddingLeft: `${leftInset}px`,
        paddingRight: `${rightInset}px`,
        boxSizing: 'border-box',
        backgroundColor: 'background.default',
        transition: 'padding 0.3s ease',
        ...sx,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Content;
