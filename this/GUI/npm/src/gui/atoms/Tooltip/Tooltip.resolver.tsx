import * as React from 'react';
import Tooltip from './Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';

/**
 * Tooltip — Resolver
 * --------------------------------------------------
 * Declarative spec → live <Tooltip /> with correct props.
 * Supports nested declarative children via ctx.render when available.
 */
export type TooltipSpec = {
  type: 'Tooltip';
  props?: {
    // Content
    title?: React.ReactNode | string; // required by MUI; we default if missing
    children?: React.ReactNode | any; // can be a nested spec object

    // Behavior
    placement?:
      | 'bottom-end' | 'bottom-start' | 'bottom'
      | 'left-end'   | 'left-start'   | 'left'
      | 'right-end'  | 'right-start'  | 'right'
      | 'top-end'    | 'top-start'    | 'top';
    arrow?: boolean;
    followCursor?: boolean;
    enterDelay?: number;
    enterNextDelay?: number;
    enterTouchDelay?: number;
    leaveDelay?: number;
    leaveTouchDelay?: number;
    disableFocusListener?: boolean;
    disableHoverListener?: boolean;
    disableInteractive?: boolean;
    disableTouchListener?: boolean;
    open?: boolean; // controlled mode

    // Styling / test ids
    sx?: SxProps<Theme>;
    id?: string;
    className?: string;
    'data-testid'?: string;
    'data-gui-id'?: string;
  };
};

const TooltipResolver: RegistryEntry = {
  type: 'Tooltip',
  resolve(spec: TooltipSpec, ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const guiId = ensureNodeId('Tooltip', (p as any)['data-gui-id']);

    // Resolve child: if a nested spec is provided and we have a renderer in ctx, use it.
    let childCandidate: any = (spec.props?.children ?? (spec.props as any)?.child) as any;
    if (!React.isValidElement(childCandidate) && childCandidate && typeof childCandidate === 'object' && ctx?.render) {
      childCandidate = ctx.render(childCandidate);
    }

    // Tooltip expects exactly ONE ReactElement child. Coerce anything else into an element.
    let childEl: React.ReactElement;
    if (React.isValidElement(childCandidate)) {
      childEl = childCandidate as React.ReactElement;
    } else if (
      typeof childCandidate === 'string' ||
      typeof childCandidate === 'number' ||
      typeof childCandidate === 'bigint'
    ) {
      childEl = <span>{String(childCandidate)}</span>;
    } else if (childCandidate) {
      // Arrays, iterables, true/false, portals, promises, etc. → wrap safely
      childEl = <span>{childCandidate as any}</span>;
    } else {
      // No child provided → harmless inline element to satisfy MUI contract
      childEl = <span style={{ display: 'inline-block', width: 0, height: 0 }} />;
    }

    let titleNode: React.ReactNode = p.title;
    if (titleNode && !React.isValidElement(titleNode) && typeof titleNode === 'object' && ctx?.render) {
      titleNode = ctx.render(titleNode as any);
    }
    if (typeof titleNode === 'undefined' || titleNode === null) {
      titleNode = '';
    }

    const {
      // remove resolver-only keys
      id,
      className,
      sx,
      placement,
      arrow,
      followCursor,
      enterDelay,
      enterNextDelay,
      enterTouchDelay,
      leaveDelay,
      leaveTouchDelay,
      disableFocusListener,
      disableHoverListener,
      disableInteractive,
      disableTouchListener,
      open,
      // keep title out, we already computed titleNode
      title: _title,
      // also remove our custom id
      ['data-gui-id']: _dataGuiId,
      // and remove the alias 'child' if present
      child: _child,
      ...rest
    } = p as any;

    return (
      <Tooltip
        title={titleNode}
        placement={placement}
        arrow={arrow}
        followCursor={followCursor}
        enterDelay={enterDelay}
        enterNextDelay={enterNextDelay}
        enterTouchDelay={enterTouchDelay}
        leaveDelay={leaveDelay}
        leaveTouchDelay={leaveTouchDelay}
        disableFocusListener={disableFocusListener}
        disableHoverListener={disableHoverListener}
        disableInteractive={disableInteractive}
        disableTouchListener={disableTouchListener}
        open={open}
        sx={sx}
        id={id}
        className={className}
        data-testid={(p as any)['data-testid']}
        data-gui-id={guiId}
        {...rest}
      >
        {childEl}
      </Tooltip>
    );
  },
};

export default TooltipResolver;