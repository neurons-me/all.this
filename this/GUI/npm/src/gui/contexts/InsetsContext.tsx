// src/themes/contexts/InsetsContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
type Insets = { top: number; right: number; bottom: number; left: number; nav: number };
type InsetsContextType = {
  insets: Insets;
  updateInsets: (next: Partial<Insets>) => void;
};

export const InsetsContext = createContext<InsetsContextType | undefined>(undefined);

export const InsetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insets, setInsets] = useState<Insets>({ top: 0, right: 0, bottom: 0, left: 0, nav: 0 });

  const updateInsets = useCallback((next: Partial<Insets>) => {
    setInsets((prev) => ({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    const { top, right, bottom, left, nav } = insets;
    document.documentElement.style.setProperty('--gui-inset-top', `${top}px`);
    document.documentElement.style.setProperty('--gui-inset-right', `${right}px`);
    document.documentElement.style.setProperty('--gui-inset-bottom', `${bottom}px`);
    document.documentElement.style.setProperty('--gui-inset-left', `${left}px`);
    document.documentElement.style.setProperty('--gui-nav-height', `${nav || top}px`);
  }, [insets]);

  return (
    <InsetsContext.Provider value={{ insets, updateInsets }}>
      {children}
    </InsetsContext.Provider>
  );
};

export const useInsetsContext = () => {
  const context = useContext(InsetsContext);
  if (!context) {
    throw new Error('useInsetsContext must be used within an InsetsProvider');
  }
  return context;
};
