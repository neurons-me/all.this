import type { Meta } from '@storybook/react';
import TopBarMenu from './TopBarMenu';
const meta: Meta<typeof TopBarMenu> = {
  component: TopBarMenu,
  title: 'Layout/TopBar/TopBarMenu',
};

export default meta;
export const ReactUsage = () => (
  <TopBarMenu
    label="More"
    items={[
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'External', href: 'https://external.com', external: true },
    ]}
  />
);

export const DeclarativeUsage = {
  type: 'menu',
  props: {
    label: 'More',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'External', href: 'https://external.com', external: true },
    ],
  },
};

export const NestedItemsExample = () => (
  <TopBarMenu
    label="Services"
    items={[
      { label: 'Web Development', href: '/services/web' },
      {
        label: 'Design',
        href: '/services/design',
        items: [
          { label: 'UI Design', href: '/services/design/ui' },
          { label: 'UX Research', href: '/services/design/ux' },
          {
            label: 'Branding',
            href: '/services/design/branding',
            items: [
              { label: 'Logo Design', href: '/services/design/branding/logo' },
              { label: 'Identity Systems', href: '/services/design/branding/identity' },
            ],
          },
        ],
      },
      { label: 'Consulting', href: '/services/consulting' },
    ]}
  />
);