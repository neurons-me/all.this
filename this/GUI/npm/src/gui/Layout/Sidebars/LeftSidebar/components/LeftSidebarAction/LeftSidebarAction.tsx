import React from 'react';
import clsx from 'clsx';
import { Box, Typography, Tooltip } from '@/gui/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import type { LeftSidebarMode } from '../../LeftSidebar.types';
import { useLeftSidebar } from '@/gui/hooks';

export type LeftSidebarActionProps = {
  label?: string;
  icon?: string;
  iconColor?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  resolver?: string; // optional resolver name or JS function string
  view: LeftSidebarMode; // added line
};

const LeftSidebarAction: React.FC<LeftSidebarActionProps> = ({
  label,
  icon,
  iconColor,
  onClick,
  active = false,
  className,
  style,
  resolver,
  view,
}) => {
  const handleClick = onClick || (resolver ? () => { try { new Function(resolver)(); } catch (e) { console.error(e); } } : undefined);

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
      <Icon name={icon || ''} iconColor={iconColor || (active ? 'primary.main' : 'text.secondary')} />
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
      onClick={handleClick}
      className={clsx('LeftSidebarAction', className)}
      style={style}
      sx={{
        p: 1.123,
        display: 'flex',
        flexDirection: 'column',
        alignItems: view === 'rail' ? 'center' : 'flex-start',
        borderLeft: 2,
        borderLeftColor: active ? 'primary.main' : 'transparent',
        borderLeftStyle: 'solid',
        cursor: 'pointer',
        backgroundColor: active ? 'action.selected' : 'transparent',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderLeftColor: 'primary.main',
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
          placement="right"
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

export default LeftSidebarAction;