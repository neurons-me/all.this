import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
export type CodeBlockVariant = 'dark' | 'light';
export type CodeBlockProps = {
  /** Code string to render */
  code: string;
  /** Language id (e.g., "ts", "tsx", "js", "json", "bash", "html") */
  language?: string;
  /** Theme variant */
  variant?: CodeBlockVariant;
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
};

/**
 * CodeBlock
 * ---------
 * Blog-style code block with syntax highlighting.
 * Uses `react-syntax-highlighter` (Prism) under the hood.
 */
export default function CodeBlock(props: CodeBlockProps) {
  const {
    code,
    language = 'tsx',
    variant = 'dark',
    title,
    showLineNumbers = false,
    wrapLongLines = true,
    className,
    style,
  } = props;

  const theme = variant === 'light' ? oneLight : oneDark;

  return (
    <div
      className={className}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: 14,
        overflow: 'hidden',
        border:
          variant === 'light'
            ? '1px solid rgba(0,0,0,0.10)'
            : '1px solid rgba(255,255,255,0.10)',
        background:
          variant === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(10, 14, 22, 0.92)',
        ...style,
      }}
    >
      {title ? (
        <div
          style={{
            padding: '10px 14px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.2px',
            borderBottom:
              variant === 'light'
                ? '1px solid rgba(0,0,0,0.08)'
                : '1px solid rgba(255,255,255,0.08)',
            background:
              variant === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
            opacity: 0.9,
          }}
        >
          {title}
        </div>
      ) : null}

      <SyntaxHighlighter
        language={language}
        style={theme as any}
        showLineNumbers={showLineNumbers}
        wrapLongLines={wrapLongLines}
        customStyle={{
          margin: 0,
          padding: '14px',
          background: 'transparent',
          fontSize: 13,
          lineHeight: 1.55,
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          },
        }}
      >
        {String(code ?? '')}
      </SyntaxHighlighter>
    </div>
  );
}
