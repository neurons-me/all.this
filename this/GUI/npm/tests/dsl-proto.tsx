import React from "react";
import ReactDOMServer from "react-dom/server";
// NOTE:
// If your editor still complains, ensure `this.gui` resolves to your package root.
// In this monorepo, that means this `npm/` folder should have a valid `package.json`
// with `name: "this.gui"`, and TypeScript should include it via NodeNext/bundler resolution.
// Prefer the package entry so TS can see declarations (dist JS may not expose proper module typings).
import GUI from "../index";
const { Card, Button, Text } = GUI.atoms;
// 1) Expr type
type MeExpr<T = unknown> = { kind: "me"; path: string; __t?: T };
const me = <T = unknown>(path: string): MeExpr<T> => ({ kind: "me", path });

// 2) Runtime resolver
type MeRuntime = (expr: MeExpr<any>) => any;
const resolveValue = (v: any, rt: MeRuntime) => {
  if (v && typeof v === "object" && v.kind === "me" && typeof v.path === "string") return rt(v);
  return v;
};

// 3) Node model
type Node<P = any> = {
  type: React.ElementType;
  props?: Record<string, any>;
  children?: Array<Node | string>;
};

// 4) Typed helpers (minimal)
function node<P>(type: React.ElementType, props?: P, children?: Array<Node | string>): Node<P> {
  return { type, props: props as any, children };
}

function renderNode(n: Node | string, rt: MeRuntime): React.ReactNode {
  if (typeof n === "string") return n;
  const propsResolved: Record<string, any> = {};
  for (const [k, v] of Object.entries(n.props ?? {})) propsResolved[k] = resolveValue(v, rt);

  const kids = (n.children ?? []).map((c) => renderNode(c as any, rt));
  return React.createElement(n.type, propsResolved, ...kids);
}

// 5) Build a tree
const tree: Node = node(
  Card,
  { sx: { p: 2 } },
  [
    node(Text, { weight: 800 }, [me<string>("name") as any]), // simplest: allow string child from expr
    node(Button, { onClick: () => {} }, ["Claim"]),
  ]
);

// 6) Render with a runtime
const meRuntime: MeRuntime = (expr) => {
  if (expr.path === "name") return "Abella";
  return null;
};

const html = ReactDOMServer.renderToString(renderNode(tree, meRuntime) as any);
console.log(html);