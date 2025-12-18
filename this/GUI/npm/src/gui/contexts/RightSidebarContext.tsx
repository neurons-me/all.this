import React, { createContext, useState } from 'react';

export type RightSidebarView = 'rail' | 'expanded' | 'mobile';

export type RightSidebarContextType = {
  view: RightSidebarView;
  setView: (view: RightSidebarView) => void;
};

export const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined);

export const RightSidebarProvider: React.FC<{ children: React.ReactNode; initialView?: RightSidebarView }> = ({
  children,
  initialView = 'rail',
}) => {
  const [view, setView] = useState<RightSidebarView>(initialView);

  return (
    <RightSidebarContext.Provider value={{ view, setView }}>
      {children}
    </RightSidebarContext.Provider>
  );
};

export default RightSidebarProvider;
