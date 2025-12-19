import ThemesCatalog from './Catalog';
import type { ThemesCatalogResolverSpec } from './Catalog.types';

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