import React, { ReactNode } from 'react';
import clsx from 'clsx';

export type TopBarActionProps = {
  element: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const TopBarAction: React.FC<TopBarActionProps> = ({ element, className, style }) => {
  return (
    <div className={clsx('TopBarAction', className)} style={style}>
      {element}
    </div>
  );
};

export default TopBarAction;