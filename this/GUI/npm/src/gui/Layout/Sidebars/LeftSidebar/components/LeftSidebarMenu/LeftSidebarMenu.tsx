import React, { useState } from "react";
import Box from "@/gui/atoms/Box/Box";
import Collapse from "@/gui/atoms/Collapse/Collapse";
import Typography from "@/gui/atoms/Typography/Typography";
import Icon from "@/gui/Theme/Icon/Icon";
type LeftSidebarMenuItem = {
  label?: string;
  icon?: string;
  onClick?: () => void;
};

type LeftSidebarMenuProps = {
  label?: string;
  icon?: string;
  items?: LeftSidebarMenuItem[];
  view?: 'rail' | 'expanded' | 'mobile';
};

const LeftSidebarMenu: React.FC<LeftSidebarMenuProps> = ({ label, icon, items, view }) => {
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
      onClick={() => !isRail && setOpen(!open)}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: view === 'rail' ? 'center' : 'flex-start',
          alignItems: 'center',
          width: '100%',
          textAlign: view === 'rail' ? 'center' : 'left',
          px: view === 'rail' ? 0 : 1.23,
        }}
      >
        <Icon name={icon ?? ''} />
        {view !== 'rail' && <Typography variant="body2">{label}</Typography>}
        {!isRail && (
          <Icon name={open ? 'expand_less' : 'expand_more'} />
        )}
      </Box>

      {isRail ? (
        open && (
          <Box
            sx={{
              position: 'fixed',
              left: 'calc(var(--gui-rail-width, 60px) + 2px)',
              marginLeft: '-2px',
              top: anchorTop ?? 0,
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderRadius: 1,
              boxShadow: 3,
              zIndex: 1500,
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
                <Icon name={item.icon ?? ''} />
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
              <Icon name={item.icon ?? ''} />
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export default LeftSidebarMenu;