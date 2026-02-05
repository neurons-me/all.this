import React from 'react';
import Layout from './Layout';
import type { RegistryEntry } from '@/Registry/types';
import type { LayoutSpec } from './Layout.types';
/**
 * The LayoutResolver dynamically constructs a responsive layout
 * using declarative JSON configuration.
 *
 * It resolves topBar, sidebars, footer, and content sections
 * by passing their configs into the Layout component.
 */
const LayoutResolver: RegistryEntry = {
  type: 'Layout',
  resolve(spec: LayoutSpec) {
    const props = spec.props ?? {};

    // Allow declarative specs to use semantic region names (preferred):
    //   TopBar / LeftSideBar / RightSideBar / Footer
    // while still supporting legacy *Config keys.
    // We normalize to the legacy prop names that the Layout component expects.
    const {
      TopBar,
      LeftSideBar,
      RightSideBar,
      Footer,
      topBarConfig,
      leftSidebarConfig,
      rightSidebarConfig,
      footerConfig,
      ...rest
    } = props as any;

    const normalizedProps = {
      ...rest,
      topBarConfig: TopBar ?? topBarConfig,
      leftSidebarConfig: LeftSideBar ?? leftSidebarConfig,
      rightSidebarConfig: RightSideBar ?? rightSidebarConfig,
      footerConfig: Footer ?? footerConfig,
    };

    const contentSections = (spec as any).Content ?? [];
    return (
      <Layout {...normalizedProps}>
        {contentSections.map((section: any, index: number) => (
          <React.Fragment key={index}>
            {Array.isArray(section.children)
              ? section.children.map((child: any, i: number) => (
                  <div key={`${index}-${i}`} {...(child.props ?? {})}>
                    {child.type}
                  </div>
                ))
              : null}
          </React.Fragment>
        ))}
      </Layout>
    );
  },
};

export default LayoutResolver;