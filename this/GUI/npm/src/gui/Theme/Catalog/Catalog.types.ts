import type { SxProps, Theme } from '@mui/system';
export type ThemesCatalogVariant = 'grid' | 'list';

/**
 * Props passed directly to the ThemesCatalog React component.
 */
export interface ThemesCatalogProps {
  /**
   * Whether to display the themes as a grid or list.
   */
  variant?: ThemesCatalogVariant;
  /**
   * Custom styles for the component container.
   */
  sx?: SxProps<Theme>;
  /**
   * If true, the theme description text is not rendered inside each theme card.
   */
  hideDescription?: boolean;
  /**
   * If true, the theme author text is not rendered inside each theme card.
   */
  hideAuthor?: boolean;
  /**
   * If true, renders the catalog in a minimal mode (hides author + description).
   * This is a convenience shortcut equivalent to setting `hideAuthor` and `hideDescription`.
   */
  minimal?: boolean;
}

/**
 * JSON/declarative spec for ThemesCatalog used in resolvers.
 * This is the shape accepted by the resolver when rendering via config.
 */
export interface ThemesCatalogResolverSpec {
  type?: 'ThemesCatalog';

  /**
   * Whether to render the themes in a grid or list layout.
   */
  variant?: ThemesCatalogVariant;

  /**
   * Styles applied to the root element.
   */
  sx?: SxProps<Theme>;
  /**
   * If true, the theme description text is not rendered inside each theme card.
   */
  hideDescription?: boolean;
  /**
   * If true, the theme author text is not rendered inside each theme card.
   */
  hideAuthor?: boolean;
  /**
   * If true, renders the catalog in a minimal mode (hides author + description).
   * This is a convenience shortcut equivalent to setting `hideAuthor` and `hideDescription`.
   */
  minimal?: boolean;
}