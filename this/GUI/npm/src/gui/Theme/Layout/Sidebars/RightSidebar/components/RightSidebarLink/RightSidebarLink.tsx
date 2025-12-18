import React, { useState } from 'react';
import { Box, Typography, Tooltip } from '@/gui/components/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import { useRightSidebar } from '@/gui/hooks';

type RightSidebarLinkProps = {
  label?: string;
  icon?: string;
  iconColor?: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

const RightSidebarLink: React.FC<RightSidebarLinkProps> = ({
  label,
  icon,
  iconColor,
  active,
  onClick,
  children,
}) => {
  const { view } = useRightSidebar();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Boolean(children);

  const handleClick = () => {
    if (hasChildren) setExpanded((prev) => !prev);
    onClick?.();
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
        color: active ? 'primary.main' : 'text.primary',
      }}
    >
      {icon && <Icon name={icon} iconColor={iconColor || (active ? 'primary.main' : undefined)} />}
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
      {hasChildren && view !== 'rail' && (
        <Icon name={expanded ? 'expand_less' : 'expand_more'} />
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: view === 'rail' ? 'center' : 'flex-start',
        p: 1.123,
        backgroundColor: active ? 'action.selected' : 'transparent',
        borderRight: 2,
        borderRightStyle: 'solid',
        borderRightColor: active ? 'primary.main' : 'transparent',
        cursor: 'pointer',
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'action.hover',
          borderRightColor: 'primary.main',
        },
        position: 'relative',
        width: '100%',
      }}
      onClick={handleClick}
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
      {hasChildren && expanded && view !== 'rail' && (
        <Box sx={{ pl: 2, pt: 0.5 }}>
          {React.Children.map(children, (child, index) =>
            React.isValidElement(child) ? React.cloneElement(child, { key: index }) : null
          )}
        </Box>
      )}
      {hasChildren && expanded && view === 'rail' && (
        <Box
          sx={{
            position: 'absolute',
            right: '100%',
            top: 0,
            backgroundColor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1,
            mt: -1,
            zIndex: 10,
            p: 1,
            minWidth: 180,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {React.Children.map(children, (child, index) =>
            React.isValidElement(child) ? React.cloneElement(child, { key: index }) : null
          )}
        </Box>
      )}
    </Box>
  );
};

export default RightSidebarLink;
