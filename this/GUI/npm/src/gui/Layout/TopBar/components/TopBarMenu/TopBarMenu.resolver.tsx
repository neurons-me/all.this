import type { TopBarMenuResolverSpec } from './TopBarMenu.types';

const resolver: TopBarMenuResolverSpec = {
  type: 'TopBarMenu',
  props: {
    label: 'Menu',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export default resolver;