// src/Router/Registry.tsx
import React, { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Path: canonical address of a Page in the GUI web.
 * Examples:
 *  - "neurons.me/docs"
 *  - "this.GUI/Home"
 *  - "/local/home" (if you choose to stay single-domain)
 */
export type Path = string;

/**
 * A Page is a node in a navigable path graph.
 */
export type Page = {
  path: Path;
  derivedAt: number;
  active?: boolean;
};

/**
 * Link: edge between two Paths (internal) or a Path -> URL (external).
 */
export type Link = {
  from: Path;
  to: Path | string; // Page.path (internal) or URL (external)
  kind?: "internal" | "external";
  label?: string;
  rel?: string;
  weight?: number;
  clicks?: number;
  lastUsedAt?: number;
};

type PathContextValue = {
  pages: Page[];
  links: Link[];
  register: (path: Path) => void;
  unregister: (path: Path) => void;
  setActive: (path: Path) => void;
  registerLink: (link: Link) => void;
  unregisterLink: (from: Path, to: Path | string) => void;
  touchLink: (from: Path, to: Path | string) => void;
};

const PathContext = createContext<PathContextValue | undefined>(undefined);

/**
 * Path: provides a set of discovered Pages and an active Page marker.
 */
export const Path: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const register = (path: Path) => {
    setPages((prev) => {
      if (prev.find((p) => p.path === path)) return prev;
      return [...prev, { path, derivedAt: Date.now(), active: false }];
    });
  };

  const unregister = (path: Path) => {
    setPages((prev) => prev.filter((p) => p.path !== path));
  };

  const setActive = (path: Path) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        active: p.path === path,
      }))
    );
  };

  const registerLink = (link: Link) => {
    const kind = link.kind ?? (String(link.to).startsWith("http") ? "external" : "internal");
    setLinks((prev) => {
      const idx = prev.findIndex((l) => l.from === link.from && l.to === link.to);
      const next: Link = {
        ...link,
        kind,
        clicks: link.clicks ?? (idx >= 0 ? prev[idx].clicks : 0),
        lastUsedAt: link.lastUsedAt ?? (idx >= 0 ? prev[idx].lastUsedAt : undefined),
      };
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], ...next };
        return copy;
      }
      return [...prev, next];
    });
  };

  const unregisterLink = (from: Path, to: Path | string) => {
    setLinks((prev) => prev.filter((l) => !(l.from === from && l.to === to)));
  };

  const touchLink = (from: Path, to: Path | string) => {
    setLinks((prev) => {
      const idx = prev.findIndex((l) => l.from === from && l.to === to);
      if (idx < 0) {
        return [...prev, { from, to, kind: String(to).startsWith("http") ? "external" : "internal", clicks: 1, lastUsedAt: Date.now() }];
      }
      const copy = prev.slice();
      const cur = copy[idx];
      copy[idx] = {
        ...cur,
        clicks: (cur.clicks ?? 0) + 1,
        lastUsedAt: Date.now(),
      };
      return copy;
    });
  };

  return (
    <PathContext.Provider value={{ pages, links, register, unregister, setActive, registerLink, unregisterLink, touchLink }}>
      {children}
    </PathContext.Provider>
  );
};

export const usePath = () => {
  const context = useContext(PathContext);
  if (!context) {
    throw new Error("usePath must be used within a Path");
  }
  return context;
};

// Alias vocabulary
export const Navigation = Path;
export const useNavigation = usePath;

export default Path;