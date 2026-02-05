import * as React from 'react';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import { ensureNodeId } from '@/gui/utils/nodeID';
import CodeBlock from './CodeBlock';
export type CodeBlockSpec = {
  type: 'CodeBlock';
  props?: {
    /** Code string to render */
    code: string;
    /** Language id (e.g., "ts", "tsx", "js", "json", "bash", "html") */
    language?: string;
    /** Theme variant */
    variant?: 'dark' | 'light';
    /** Optional label above the block (e.g., filename) */
    title?: string;
    /** Show line numbers */
    showLineNumbers?: boolean;
    /** Wrap long lines */
    wrapLongLines?: boolean;
    /** Extra class name for outer wrapper */
    className?: string;
    /** Optional inline style for outer wrapper */
    style?: React.CSSProperties;
    /** Optional id */
    id?: string;
    /** data-testid */
    'data-testid'?: string;
    /** allow arbitrary props */
    [key: string]: any;
  };
};

const CodeBlockResolver: RegistryEntry = {
  type: 'CodeBlock',
  resolve(spec: CodeBlockSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? ({} as any);
      const {
      code,
      language,
      variant,
      title,
      showLineNumbers,
      wrapLongLines,
      className,
      style,
      id,
      ...rest
    } = p;
    const codeBlockId = ensureNodeId('codeblock', id);
    return (
      <CodeBlock
        code={code}
        language={language}
        variant={variant}
        title={title}
        showLineNumbers={showLineNumbers}
        wrapLongLines={wrapLongLines}
        className={className}
        style={style}
        id={codeBlockId}
        data-testid={p['data-testid']}
        {...rest}
      />
    );
  },
};

export default CodeBlockResolver;