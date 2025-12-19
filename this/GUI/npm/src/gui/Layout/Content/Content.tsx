import React from 'react';
import { Box } from '@/gui/atoms';
import { useInsets } from '@/gui/hooks';
import type { ContentProps } from './Content.types';

const Content: React.FC<ContentProps> = ({ children }) => {
  const insets = useInsets();
  const safeTop = Math.max(0, Number(insets?.top ?? 0));
  const navHeight = Math.max(0, Number(insets?.nav ?? 0));
  const topInset = safeTop + navHeight;
  const bottomInset = Math.max(0, Number(insets?.bottom ?? 0));
  const leftInset = Math.max(0, Number(insets?.left ?? 0));
  const rightInset = Math.max(0, Number(insets?.right ?? 0));

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
