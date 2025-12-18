import type { ReactNode } from 'react';

export type TopBarMenuProps = {
  label: string;
  icon?: ReactNode;
  iconColor?: string;
  /** Whether to display the label next to the icon in the top-level menu trigger. Defaults to true. */
  showLabel?: boolean;
  items?: TopBarMenuItemProps[];
};

export type TopBarMenuItemProps = {
  label: string;
  href: string;
  icon?: ReactNode;
  iconColor?: string;
  external?: boolean;
  items?: TopBarMenuItemProps[]; 
};

// Note: The items property in TopBarMenuItemProps is added to support nested menu items if needed.
// This allows for multi-level dropdown menus in the TopBarMenu component.
// The iconColor property allows customization of each menu item’s icon color.

// Example usage:
// const menu: TopBarMenuProps = {
//   label: 'Menu',
//   icon: <MenuIcon />,
//   items: [
//     { label: 'Item 1', href: '/item1', icon: <Item1Icon /> },
//     { label: 'Item 2', href: '/item2', icon: <Item2Icon />, items: [ // Nested items
//       { label: 'Subitem 1', href: '/item2/subitem1' },
//       { label: 'Subitem 2', href: '/item2/subitem2' },
//     ] },
//   ],
// };   
// The above example shows how to define a menu with nested items using the updated types.
// The items property in TopBarMenuProps is optional, allowing for menus without dropdowns.


export type TopBarMenuItemResolverSpec = {
  type: 'TopBarMenuItem';
  props?: TopBarMenuItemProps;
};