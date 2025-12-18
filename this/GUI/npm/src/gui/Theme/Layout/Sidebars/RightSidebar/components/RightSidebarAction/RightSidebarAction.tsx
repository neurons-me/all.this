import React from 'react';
import clsx from 'clsx';
import { Box, Typography, Tooltip } from '@/gui/components/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import type { RightSidebarView } from '../../RightSidebar.types';

export type RightSidebarActionProps = {
  label?: string;
  icon?: string;
  iconColor?: string;
  onClick?: () => void;
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
  active = false,
  className,
  style,
  view,
}) => {
  const content = (
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

  return (
    <Box
      component="button"
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
        cursor: 'pointer',
        backgroundColor: active ? 'action.selected' : 'transparent',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderRightColor: 'primary.main',
        },
        color: active ? 'primary.main' : 'text.primary',
        width: '100%',
        textAlign: view === 'rail' ? 'center' : 'left',
        outline: 'none',
        border: 'none',
      }}
      aria-pressed={active}
      type="button"
    >
      {view === 'rail' ? (
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
      )}
    </Box>
  );
};

export default RightSidebarAction;
