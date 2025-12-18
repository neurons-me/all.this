import ThemesCatalog from './ThemesCatalog';
import type { ThemesCatalogResolverSpec } from './ThemesCatalog.types';

const resolver = {
  type: 'ThemesCatalog',
  resolve: (props?: ThemesCatalogResolverSpec) => {
    const { variant, sx } = props || {};
    return {
      component: () => <ThemesCatalog variant={variant} sx={sx} />,
      props,
    };
  },
};

export default resolver;