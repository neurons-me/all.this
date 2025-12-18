import ThemeModeToggle from './ThemeModeToggle';
import { ThemeModeToggleResolverSpec } from './ThemeModeToggle.types';
/**
 * Resolver for ThemeModeToggle
 * ----------------------------
 * Allows you to render the ThemeModeToggle from a plain JSON/config object.
 *
 * Minimal accepted shape:
 * {
 *   "type": "ThemeModeToggle",
 *   "props": {
 *     "variant": "minimal" | "switchMinimal" | "switchWithLabel",
 *     "show": "icons" | "label" | "both",
 *     "id": "optional-id",
 *     "className": "optional-class",
 *     "data-testid": "test-id",
 *     // Optional granular styling
 *     "sx": {  root styles  },
 *     "iconSx": { icons styles },
 *     "switchSx": { switch styles (variant='switch')  },
 *     "labelSx": { label Typography styles  }
 *   }
 * }
 */

export function resolveThemeModeToggle(p: ThemeModeToggleResolverSpec = {}) {
  const {
    variant = 'minimal',
    show = 'icons',
    id,
    className,
    ['data-testid']: dataTestId,
    sx,
    iconSx,
    switchSx,
    labelSx,
    switchSize,
    iconSize,
  } = p;

  return (
    <ThemeModeToggle
      variant={variant}
      show={show}
      id={id}
      className={className}
      data-testid={dataTestId}
      sx={sx}
      iconSx={iconSx}
      switchSx={switchSx}
      labelSx={labelSx}
      switchSize={switchSize}
      iconSize={iconSize}
    />
  );
}

export default resolveThemeModeToggle;