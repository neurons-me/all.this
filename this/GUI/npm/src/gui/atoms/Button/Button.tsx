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
  /** Convenience alias for the native `aria-label` attribute.
   *  - Use a string for icon-only buttons.
   *  - Use `false` to explicitly opt out when the button already has visible text.
   */
  ariaLabel?: string | false;
};
function resolveIcon(node: Iconish): ReactNode | null {
  if (!node) return null;
  return typeof node === 'string' ? <Icon name={node} fontSize={18} /> : node;
}
const ButtonImpl = React.forwardRef<any, ButtonProps>(function Button(
  { startIcon, endIcon, ariaLabel, ...rest },
  ref
) {
  const nativeAriaLabel = (rest as any)['aria-label'] as string | undefined;
  const resolvedAriaLabel =
    nativeAriaLabel ?? (typeof ariaLabel === 'string' ? ariaLabel : undefined);

  if (process.env.NODE_ENV !== 'production') {
    const hasTextChild =
      typeof (rest as any).children === 'string' ||
      typeof (rest as any).children === 'number' ||
      (Array.isArray((rest as any).children) &&
        (rest as any).children.some(
          (c: any) => typeof c === 'string' || typeof c === 'number'
        ));

    const isIconOnly = !hasTextChild && (startIcon || endIcon || (rest as any).children);
    if (isIconOnly && !resolvedAriaLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        '[this.gui/Button] Icon-only button should include an accessible label via `aria-label` or `ariaLabel`. '
      );
    }
  }

  return (
    <MuiButton
      ref={ref}
      {...rest}
      aria-label={resolvedAriaLabel}
      startIcon={resolveIcon(startIcon)}
      endIcon={resolveIcon(endIcon)}
    />
  );
}) as unknown as OverridableComponent<ButtonTypeMap<{}, 'button'>>;
(ButtonImpl as any).displayName = 'Button';
export default ButtonImpl;
export type GuiButtonProps = React.ComponentProps<typeof ButtonImpl>;