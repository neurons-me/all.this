// src/gui/mdx/GuiMDX.tsx
import React from 'react';
import { MDXProvider } from '@mdx-js/react';
// Keep the MDX layer minimal: it should only provide
// (1) component mappings and (2) optional wrappers (providers).
// It should NOT depend on `GUI.tsx` (which mounts an app + router).
import Theme from '@/gui/Theme/Theme';
import { Button } from '@/gui/atoms';
import CodeBlock from '@/gui/molecules';
export type GuiMDXComponents = Record<string, any>;
// Export the mapping so other hosts (Storybook/app/editor) can reuse it
// without being forced into a provider decision.
export const guiMdxComponents: GuiMDXComponents = {
  h1: (p: any) => <h1 {...p} />,
  h2: (p: any) => <h2 {...p} />,
  Button,
  CodeBlock,
};

export type GuiMDXProps = {
  children: React.ReactNode;
  /** Override/extend the default MDX component mapping */
  components?: GuiMDXComponents;
  /** Wrap content with Theme (disable if the host already provides it) */
  withTheme?: boolean;
};

export function GuiMDX({
  children,
  components,
  withTheme = true,
}: GuiMDXProps) {
  const merged = { ...guiMdxComponents, ...(components || {}) };
  const content = <MDXProvider components={merged}>{children}</MDXProvider>;
  if (withTheme) {
    return <Theme>{content}</Theme>;
  }

  return content;
}
