import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
type DerivableRouterContextType = {
  currentPath: string;
  navigate: (path: string) => void;
};

const DerivableRouterContext = createContext<DerivableRouterContextType | undefined>(undefined);
export const DerivableRouterProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState<string>(location.pathname);
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);
  return (
    <DerivableRouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </DerivableRouterContext.Provider>
  );
};

export const useDerivableRouter = (): DerivableRouterContextType => {
  const ctx = useContext(DerivableRouterContext);
  if (!ctx) {
    throw new Error('useDerivableRouter must be used within a DerivableRouterProvider');
  }
  return ctx;
};

// Wrapper to ensure routing context
export const DerivableRouterRoot: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <DerivableRouterProvider>{children}</DerivableRouterProvider>
  </BrowserRouter>
);