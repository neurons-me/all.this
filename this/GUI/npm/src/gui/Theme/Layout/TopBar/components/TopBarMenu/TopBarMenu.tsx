import Icon from '@/gui/Theme/Icon/Icon';
import React, { useState } from 'react';
import { Menu, MenuItem, Typography } from '@mui/material';
import Link from '@/gui/atoms/Link/Link';
import type { TopBarMenuProps, TopBarMenuItemProps } from './TopBarMenu.types';

const renderMenuItems = (
  items: TopBarMenuItemProps[],
  handleClose: () => void,
  expandedItems: Set<string>,
  toggleExpand: (label: string) => void
): React.ReactElement[] =>
  items.map(({ label, href, icon, iconColor, external, items: subItems }) => {
    const isExpanded = expandedItems.has(label);

    const content = (
      <Link
        to={!external ? href : undefined}
        href={external ? href : undefined}
        target={external ? '_blank' : undefined}
        style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
      >
        {icon && (
          <Icon
            name={typeof icon === 'string' ? icon : 'info'}
            iconColor={iconColor || 'currentColor'}
            style={{ marginRight: 2, fontSize: 20, position: 'relative', top: -1 }}
          />
        )}
        {label}
      </Link>
    );

    if (subItems && subItems.length > 0) {
      return (
        <React.Fragment key={label}>
          <MenuItem
            onClick={() => toggleExpand(label)}
            sx={{ color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {content}
            <Icon
              name={isExpanded ? 'expand_less' : 'expand_more'}
              iconColor="currentColor"
              style={{ fontSize: 20, position: 'relative', top: -1, marginLeft: 1 }}
            />
          </MenuItem>
          <div
            style={{
              maxHeight: isExpanded ? '500px' : '0px',
              opacity: isExpanded ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.2s ease-out, opacity 0.2s ease-out',
              paddingLeft: 16,
            }}
          >
            {renderMenuItems(subItems, handleClose, expandedItems, toggleExpand)}
          </div>
        </React.Fragment>
      );
    }

    return (
      <MenuItem key={label} onClick={handleClose} sx={{ color: 'inherit' }}>
        {content}
      </MenuItem>
    );
  });

const TopBarMenu: React.FC<TopBarMenuProps> = ({ label, icon, iconColor, items, showLabel = true }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setExpandedItems(new Set());
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  return (
    <>
      <Typography
        onClick={handleOpen}
        sx={{
          cursor: 'pointer',
          px: 1,
          display: 'inline-flex',
          alignItems: 'center',
          color: 'inherit',
        }}
      >
        {icon && (
          <Icon
            name={typeof icon === 'string' ? icon : 'info'}
            iconColor={iconColor || 'currentColor'}
            style={{ marginRight: showLabel ? 2 : 0, fontSize: 20, position: 'relative', top: -1 }}
          />
        )}
        {showLabel && <span>{label}</span>}
      </Typography>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} sx={{ color: 'inherit' }}>
        {items && renderMenuItems(items, handleClose, expandedItems, toggleExpand)}
      </Menu>
    </>
  );
};

export default TopBarMenu;