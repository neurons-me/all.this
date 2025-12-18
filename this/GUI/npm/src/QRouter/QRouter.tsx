import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { BrowserRouter, useInRouterContext } from "react-router-dom";
type QuantumNode = { id: string; path: string; element: ReactNode; derived?: boolean };
type LinkObject = { href: string; rel?: string; label?: string };
type QRouterContextValue = {
  nodes: QuantumNode[];
  addNode: (node: QuantumNode) => void;
  deriveRoute: (path: string) => void;
  registerLinks: (links: LinkObject[]) => void;
};
const QRouterContext = createContext<QRouterContextValue | null>(null);
export const useQRouter = () => {
  const ctx = useContext(QRouterContext);
  if (!ctx) throw new Error("useQRouter must be used within QRouter");
  return ctx;
};

export const QRouter: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<QuantumNode[]>(() => [
    { id: "__default_root__", path: "/", element: <div style={{ padding: 16 }}>🏠 Home</div> },
  ]);
  const [links, setLinks] = useState<LinkObject[]>([]);
  const inRouter = useInRouterContext(); // detecta si ya existe un router activo

  const addNode = (node: QuantumNode) =>
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.path === node.path);
      if (idx === -1) return [...prev, node];
      const next = prev.slice();
      // Override by path (the app should be able to replace the default root route)
      next[idx] = { ...prev[idx], ...node };
      return next;
    });

  const deriveRoute = (path: string) => {
    if (path === "/") return; // never overwrite root
    const id = path.replace(/\//g, "_") || "root";
    addNode({ id, path, element: <div style={{ padding: 16 }}>✨ Quantum derived: {path}</div>, derived: true });
  };

  const registerLinks = (newLinks: LinkObject[]) => {
    setLinks((prev) => {
      const existing = new Set(prev.map((l) => l.href));
      const filtered = newLinks.filter((l) => !existing.has(l.href));
      return [...prev, ...filtered];
    });
  };

  const value = useMemo(() => ({ nodes, addNode, deriveRoute, registerLinks }), [nodes]);

  const Inner = <QRouterContext.Provider value={value}>{children}</QRouterContext.Provider>;

  // 🧩 Si ya hay router, úsalo. Si no, crea uno.
  return inRouter ? Inner : <BrowserRouter>{Inner}</BrowserRouter>;
};

export default QRouter;
