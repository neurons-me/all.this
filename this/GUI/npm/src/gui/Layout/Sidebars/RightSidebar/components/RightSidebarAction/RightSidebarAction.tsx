import React from 'react';
import clsx from 'clsx';
import { Box, Typography, Tooltip } from '@/gui/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import type { RightSidebarView } from '../../RightSidebar.types';

export type RightSidebarActionProps = {
  label?: string;
  icon?: string;
  iconColor?: string;
  onClick?: () => void;
  element?: React.ReactNode;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  view: RightSidebarView;
};

const RightSidebarAction: React.FC<RightSidebarActionProps> = ({
  label,
  icon,
  iconColor,
  onClick,
  element,
  active = false,
  className,
  style,
  view,
}) => {
  const hasCustomElement = Boolean(element);
  const content = hasCustomElement ? (
    <Box
      sx={{
        display: 'flex',
        justifyContent: view === 'rail' ? 'center' : 'flex-start',
        alignItems: 'center',
        width: '100%',
        px: view === 'rail' ? 0 : 1.23,
      }}
    >
      {element}
    </Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        gap: 1.123,
        justifyContent: view === 'rail' ? 'center' : 'flex-start',
        alignItems: 'center',
        width: '100%',
        textAlign: view === 'rail' ? 'center' : 'left',
        px: view === 'rail' ? 0 : 1.23,
      }}
    >
      <Icon name={icon ?? ''} iconColor={iconColor || (active ? 'primary.main' : undefined)} />
      {view !== 'rail' && (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: active ? 'primary.main' : 'text.primary',
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );

  const maybeWrappedContent =
    view === 'rail' && label ? (
      <Tooltip
        title={label}
        placement="left"
        arrow
        slotProps={{ tooltip: { sx: { fontSize: '0.9rem', py: 0.5, px: 1 } } }}
      >
        {content}
      </Tooltip>
    ) : (
      content
    );

  return (
    <Box
      component={hasCustomElement ? 'div' : 'button'}
      onClick={onClick}
      className={clsx('RightSidebarAction', className)}
      style={style}
      sx={{
        p: 1.123,
        display: 'flex',
        flexDirection: 'column',
        alignItems: view === 'rail' ? 'center' : 'flex-start',
        borderRight: 2,
        borderRightColor: active ? 'primary.main' : 'transparent',
        borderRightStyle: 'solid',
        backgroundColor: active ? 'action.selected' : 'transparent',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderRightColor: 'primary.main',
        },
        color: active ? 'primary.main' : 'text.primary',
        cursor: hasCustomElement && !onClick ? 'default' : 'pointer',
        width: '100%',
        textAlign: view === 'rail' ? 'center' : 'left',
        outline: 'none',
        border: 'none',
      }}
      aria-pressed={hasCustomElement ? undefined : active}
      type={hasCustomElement ? undefined : 'button'}
    >
      {maybeWrappedContent}
    </Box>
  );
};

export default RightSidebarAction;
