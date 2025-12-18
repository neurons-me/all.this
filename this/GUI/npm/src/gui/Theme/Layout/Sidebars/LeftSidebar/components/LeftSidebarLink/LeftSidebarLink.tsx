import React, { useState } from 'react';
import { Box, Typography, Tooltip } from '@/gui/components/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import type { LeftSidebarItemProps } from './LeftSidebarLink.types';
import { useLeftSidebar } from '@/gui/hooks';
import { Link as RouterLink } from 'react-router-dom';

const LeftSidebarLink: React.FC<LeftSidebarItemProps> = ({
  label,
  icon,
  iconColor,
  href,
  to,
  active,
  external,
  onClick,
  children
}) => {
  const { view } = useLeftSidebar();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Boolean(children);

  const handleClick = () => {
    if (hasChildren) setExpanded((prev) => !prev);
    if (onClick) onClick();
  };

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
      {icon && (
        <Icon name={icon} iconColor={iconColor}/>
      )}
      {view !== 'rail' && <Typography variant="body2">{label}</Typography>}
      {hasChildren && (
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          iconColor={iconColor}
        />
      )}
    </Box>
  );

  return (
    <Box
      component={to ? (RouterLink as any) : href ? 'a' : 'div'}
      {...(to ? ({ to } as any) : {})}
      {...(!to && href ? ({ href, target: external ? '_blank' : undefined, rel: external ? 'noreferrer' : undefined } as any) : {})}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: 1.123,
        backgroundColor: 'transparent',
        border: active ? '1px solid' : 'none',
        borderColor: active ? 'primary.main' : 'transparent',
        color: active ? 'white' : 'text.primary',
        cursor: 'pointer',
        borderRadius: 1,
        textDecoration: 'none',
        '&:hover': {
          backgroundColor: 'action.hover',
          textDecoration: 'none',
        },
        position: 'relative',
      }}
      onClick={(e: any) => {
        if (hasChildren) {
          e.preventDefault();
        }
        handleClick();
      }}
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
      {hasChildren && (
        <>
          {expanded && view !== 'rail' && (
            <Box sx={{ pl: 2, pt: 0.5 }}>
              {React.Children.map(children, (child, index) =>
                React.isValidElement(child) ? (
                  React.cloneElement(child, { key: index })
                ) : null
              )}
            </Box>
          )}
          {expanded && view === 'rail' && (
            <Box
              sx={{
                position: 'absolute',
                left: '100%',
                top: 0,
                backgroundColor: 'background.paper',
                boxShadow: 3,
                borderRadius: 1,
                mt: -1,
                zIndex: 10,
                p: 1,
                minWidth: 180,
              }}
            >
              {React.Children.map(children, (child, index) =>
                React.isValidElement(child)
                  ? React.cloneElement(child, { key: index })
                  : null
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LeftSidebarLink;