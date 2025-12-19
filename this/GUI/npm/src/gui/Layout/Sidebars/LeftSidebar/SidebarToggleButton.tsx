import React from 'react';
import { Box, IconButton } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

export interface SidebarToggleButtonProps {
  expanded: boolean;
  onToggle: () => void;
  collapsedWidth?: number;
  style?: React.CSSProperties;
  location?: 'topbar' | 'sidebar' | 'none';
  sx?: SxProps<Theme>;
  forceRender?: boolean;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  expanded,
  onToggle,
  collapsedWidth = 72,
  style,
  location,
  sx,
}) => {
  const [locationState, setLocation] = React.useState<'topbar' | 'sidebar' | 'none'>(location ?? 'none');

  React.useEffect(() => {
    if (location) {
      setLocation(location);
    }
  }, [location]);

  if (locationState === 'none') return null;

  return (
    <Box
      sx={{
        ...(locationState === 'topbar'
          ? { display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1 }
          : { width: collapsedWidth, display: 'flex', justifyContent: 'center', py: 1 }),
        ...sx,
      }}
      style={style}
    >
      <IconButton size="small" onClick={onToggle} aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}>
        <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
          {expanded ? 'chevron_left' : 'chevron_right'}
        </span>
      </IconButton>
    </Box>
  );
};

export default SidebarToggleButton;
