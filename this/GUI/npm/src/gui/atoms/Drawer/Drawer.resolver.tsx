// src/gui/atoms/Drawer/Drawer.resolver.tsx
import * as React from 'react';
import { Drawer } from '@/gui/components/atoms';
import type { RegistryEntry } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative resolver for Drawer
 *
 * Goals
 * - Stay faithful to MUI props.
 * - Add ergonomic sugar for JSON-driven UIs (width → PaperProps.sx.width, paperSx merge, content alias, keepMounted).
 * - Keep types helpful (SxProps<Theme> where relevant).
 *
 * Notes
 * - We deliberately DO NOT update layout insets here. That responsibility belongs to higher-level layout components.
 */
type DrawerSpec = {
  type: 'Drawer';
  props?: {
    // Behavior & placement
    variant?: 'temporary' | 'persistent' | 'permanent';
    anchor?: 'left' | 'right' | 'top' | 'bottom';
    open?: boolean; // if omitted in declarative JSON, default to false
    /**
     * Accept either MUI's full signature or a simple no-arg callback for declarative specs.
     * In runtime, if a no-arg function is provided, we wrap it into MUI's signature.
     */
    onClose?: ((event: object, reason: 'backdropClick' | 'escapeKeyDown') => void) | (() => void);

    // Styling
    width?: number;                 // shortcut → merged into PaperProps.sx.width
    sx?: SxProps<Theme>;            // root sx
    PaperProps?: any;               // will be merged; sx merged with width/paperSx
    paperSx?: SxProps<Theme>;       // optional convenience to add to Paper sx

    // Container/Portal & Modal behavior (temporary/persistent)
    container?: Element | (() => Element) | null;
    ModalProps?: any;
    keepMounted?: boolean;          // shorthand → ModalProps.keepMounted = true

    // Content
    children?: React.ReactNode;
    content?: React.ReactNode;

    // Misc
    id?: string;
    className?: string;
    'data-testid'?: string;

    // passthrough
    [key: string]: any;
  };
};

const DrawerResolver: RegistryEntry = {
  type: 'Drawer',
  resolve(spec: DrawerSpec) {
    const p = spec.props ?? {};

    // Merge Paper sx with `width` and optional `paperSx`
    const mergedPaperSx = {
      ...(typeof p.width === 'number' ? { width: p.width } : {}),
      ...(p.paperSx ?? {}),
      ...(p.PaperProps?.sx ?? {}),
    };

    const PaperProps = {
      ...(p.PaperProps ?? {}),
      ...(Object.keys(mergedPaperSx).length ? { sx: mergedPaperSx } : {}),
    };

    // ModalProps (support keepMounted shorthand and preserve provided values)
    const ModalProps =
      p.keepMounted != null
        ? { ...(p.ModalProps ?? {}), keepMounted: p.keepMounted }
        : p.ModalProps;

    // Normalize onClose: support no-arg functions from declarative JSON
    let onCloseProp: ((event: object, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined;
    if (typeof p.onClose === 'function') {
      onCloseProp = (event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
        // If the provided function expects no arguments (JSON sugar), just call it.
        if ((p.onClose as Function).length === 0) {
          (p.onClose as () => void)();
          return;
        }
        // Otherwise, forward MUI's (event, reason)
        (p.onClose as (event: object, reason: 'backdropClick' | 'escapeKeyDown') => void)(event, reason);
      };
    }

    const children = p.children ?? p.content ?? null;

    return (
      <Drawer
        variant={p.variant ?? 'temporary'}
        anchor={p.anchor ?? 'left'}
        open={p.open ?? false}
        onClose={onCloseProp}
        PaperProps={PaperProps}
        ModalProps={ModalProps}
        container={p.container}
        sx={p.sx}
        id={ensureNodeId('drawer', p.id)}
        className={p.className}
        data-testid={p['data-testid']}
      >
        {children}
      </Drawer>
    );
  },
};

export default DrawerResolver;