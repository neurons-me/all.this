import React from 'react';
import Layout from './Layout';
import type { RegistryEntry } from '@/gui/registry/types';
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
    const contentSections = spec.Content ?? [];
    return (
      <Layout
        {...props}
      >
        {contentSections.map((section, index) => (
          <React.Fragment key={index}>
            {Array.isArray(section.children)
              ? section.children.map((child, i) => (
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