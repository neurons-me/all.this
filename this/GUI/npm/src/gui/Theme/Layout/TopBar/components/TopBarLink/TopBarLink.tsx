import React from 'react';
import Link from '@/gui/atoms/Link/Link'; // Adjust import path if necessary
import Icon from '@/gui/Theme/Icon/Icon'; // Import Icon component
import type { TopBarLinkProps } from './TopBarLink.types';
const TopBarLink: React.FC<TopBarLinkProps> = ({ label, href, icon, iconColor, external, showLabel = true }) => {
  const content = (
    <>
      {icon && (
        <Icon
          name={icon}
          iconColor={iconColor || 'currentColor'}
          style={{ marginRight: 3, fontSize: 20, position: 'relative', top: -1 }}
        />
      )}
      {showLabel && <span>{label}</span>}
    </>
  );

  return (
    <Link
      href={href ?? '#'}
      target={external ? '_blank' : '_self'}
      style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
    >
      {content}
    </Link>
  );
};

export default TopBarLink;