import React, { useState } from 'react';
import { Box, Collapse, Typography } from '@/gui/components/atoms';
import Icon from '@/gui/Theme/Icon/Icon';

type RightSidebarMenuItem = {
  label?: string;
  icon?: string;
  iconColor?: string;
  onClick?: () => void;
};

type RightSidebarMenuProps = {
  label?: string;
  icon?: string;
  iconColor?: string;
  items?: RightSidebarMenuItem[];
  view?: 'rail' | 'expanded' | 'mobile';
};

const RightSidebarMenu: React.FC<RightSidebarMenuProps> = ({ label, icon, iconColor, items, view }) => {
  const [open, setOpen] = useState(false);
  const [anchorTop, setAnchorTop] = useState<number | null>(null);
  const isRail = view === 'rail';

  return (
    <Box
      onMouseEnter={(e) => {
        if (isRail) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setAnchorTop(rect.top);
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (isRail) {
          setOpen(false);
          setAnchorTop(null);
        }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: 1.123,
        backgroundColor: 'transparent',
        cursor: 'pointer',
        borderRadius: 1,
        color: 'text.primary',
        '&:hover': { backgroundColor: 'action.hover' },
        position: 'relative',
      }}
      onClick={() => !isRail && setOpen((prev) => !prev)}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: isRail ? 'center' : 'flex-start',
          alignItems: 'center',
          width: '100%',
          textAlign: isRail ? 'center' : 'left',
          px: isRail ? 0 : 1.23,
        }}
      >
        <Icon name={icon ?? ''} iconColor={iconColor} />
        {view !== 'rail' && <Typography variant="body2">{label}</Typography>}
        {!isRail && <Icon name={open ? 'expand_less' : 'expand_more'} />}
      </Box>

      {isRail ? (
        open && (
          <Box
            sx={{
              position: 'fixed',
              right: 'var(--gui-rail-width, 72px)',
              top: anchorTop ?? 0,
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderRadius: 1,
              boxShadow: 3,
              zIndex: 1300,
              border: '1px solid',
              borderColor: 'divider',
              minWidth: 180,
              maxHeight: '80vh',
              overflowY: 'auto',
              py: 1,
            }}
          >
            {(items ?? []).map((item, idx) => (
              <Box
                key={idx}
                onClick={item.onClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 0.75,
                  gap: 1.5,
                  cursor: 'pointer',
                  borderRadius: 1,
                  color: 'text.primary',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Icon name={item.icon ?? ''} iconColor={item.iconColor} />
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        )
      ) : (
        <Collapse in={open}>
          {(items ?? []).map((item, idx) => (
            <Box
              key={idx}
              onClick={item.onClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 0.75,
                gap: 1.123,
                cursor: 'pointer',
                borderRadius: 1,
                color: 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <Icon name={item.icon ?? ''} iconColor={item.iconColor} />
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Collapse>
      )}
    </Box>
  );
};

export default RightSidebarMenu;
