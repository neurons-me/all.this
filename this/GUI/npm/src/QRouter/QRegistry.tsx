import React, { createContext, useContext, useState, ReactNode } from "react";
export type QuantumNode = {
  path: string;
  derivedAt: number;
  active?: boolean;
};

type QuantumRegistryContextType = {
  nodes: QuantumNode[];
  registerNode: (path: string) => void;
  unregisterNode: (path: string) => void;
  setActiveNode: (path: string) => void;
};

const QuantumRegistryContext = createContext<QuantumRegistryContextType | undefined>(undefined);
export const QRegistryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<QuantumNode[]>([]);
  const registerNode = (path: string) => {
    setNodes((prev) => {
      if (prev.find((n) => n.path === path)) return prev;
      return [...prev, { path, derivedAt: Date.now(), active: false }];
    });
  };

  const unregisterNode = (path: string) => {
    setNodes((prev) => prev.filter((n) => n.path !== path));
  };

  const setActiveNode = (path: string) => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        active: n.path === path,
      }))
    );
  };

  return (
    <QuantumRegistryContext.Provider value={{ nodes, registerNode, unregisterNode, setActiveNode }}>
      {children}
    </QuantumRegistryContext.Provider>
  );
};

export const useQuantumRegistry = () => {
  const context = useContext(QuantumRegistryContext);
  if (!context) {
    throw new Error("useQuantumRegistry must be used within a QRegistryProvider");
  }
  return context;
};

export default QRegistryProvider;