import * as React from 'react';
import type { ReactNode } from 'react';
import MuiButton from '@mui/material/Button';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { ButtonTypeMap } from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import Icon from '@/gui/Theme/Icon/Icon';
/**
 * Button (This.GUI primitive)
 * ----------------------------------------
 * - Polymorphic: preserves MUI's `component` API and typing via OverridableComponent.
 * - Enhances MUI by allowing `startIcon` / `endIcon` to be a declarative string
 *   (e.g., "mui:Settings" / "lucide:camera") or a ReactNode.
 */
// Polymorphic props type that matches MUI Button while letting us tweak icon props
export type Iconish = ReactNode | string | undefined;
export type ButtonProps = Omit<MuiButtonProps, 'startIcon' | 'endIcon'> & {
  startIcon?: Iconish;
  endIcon?: Iconish;
};
function resolveIcon(node: Iconish): ReactNode | null {
  if (!node) return null;
  return typeof node === 'string' ? <Icon name={node} fontSize={18} /> : node;
}
const ButtonImpl = React.forwardRef<any, ButtonProps>(function Button(
  { startIcon, endIcon, ...rest },
  ref
) {
  return (
    <MuiButton
      ref={ref}
      startIcon={resolveIcon(startIcon)}
      endIcon={resolveIcon(endIcon)}
      {...rest}
    />
  );
}) as unknown as OverridableComponent<ButtonTypeMap<{}, 'button'>>;
(ButtonImpl as any).displayName = 'Button';
export default ButtonImpl;
export type GuiButtonProps = React.ComponentProps<typeof ButtonImpl>;