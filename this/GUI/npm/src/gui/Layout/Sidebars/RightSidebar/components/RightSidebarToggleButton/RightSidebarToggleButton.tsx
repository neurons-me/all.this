import React from 'react';
import IconButton from '@mui/material/IconButton';
import Icon from '@/gui/Theme/Icon/Icon';

type RightSidebarToggleButtonProps = {
  expanded: boolean;
  onToggle: () => void;
};

const RightSidebarToggleButton: React.FC<RightSidebarToggleButtonProps> = ({ expanded, onToggle }) => {
  return (
    <IconButton
      aria-label="Toggle right sidebar"
      onClick={onToggle}
      sx={{ margin: 1 }}
    >
      <Icon name={expanded ? 'chevron_right' : 'chevron_left'} />
    </IconButton>
  );
};

export default RightSidebarToggleButton;
