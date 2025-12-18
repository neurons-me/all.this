import * as React from 'react';
import Switch from './Switch';
import { FormControlLabel } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Switch.resolver
 * ------------------------------------------------------------
 * Allows declarative usage of the Switch atom. You can pass any
 * MUI Switch prop through, plus optional `label` support. If
 * `label` is provided, we wrap the control in `FormControlLabel`.
 *
 * Examples (JSON-ish):
 *  {
 *    type: 'Switch',
 *    props: { checked: true, color: 'primary', size: 'small' }
 *  }
 *
 *  {
 *    type: 'Switch',
 *    props: { label: 'Enable feature', defaultChecked: true }
 *  }
 */

export type SwitchResolverProps = React.ComponentProps<typeof Switch> & {
  /** Optional text/element label to render alongside the switch */
  label?: React.ReactNode;
  /** Label position when `label` is provided */
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  sx?: SxProps<Theme>;
  guiId?: string;
};

export default function resolveSwitch(props: SwitchResolverProps) {
  const { label, labelPlacement = 'end', guiId, sx, ...rest } = props || ({} as SwitchResolverProps);

  const nodeId = ensureNodeId('Switch', guiId);

  const control = <Switch id={nodeId} sx={sx} {...rest} />;

  if (label != null) {
    return (
      <FormControlLabel
        control={control}
        label={label}
        labelPlacement={labelPlacement}
      />
    );
  }

  return control;
}