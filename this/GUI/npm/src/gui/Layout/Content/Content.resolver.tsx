import React from 'react';
import type { RegistryEntry } from '@/gui/registry/types';
import Content from './Content';
import type { ContentProps, ContentSection } from './Content.types';

type ContentSpec = {
  type: 'Content';
  props?: ContentProps;
};

/**
 * ContentResolver
 * - Minimal resolver to render the Content area with optional children/sections.
 * - If `sections` are provided, it renders a simple placeholder tree for now.
 *   (Extend with real component mapping as registry entries become available.)
 */
const ContentResolver: RegistryEntry = {
  type: 'Content',
  resolve(spec: ContentSpec) {
    const props = spec.props ?? {};
    const sections = props.sections ?? [];

    const renderSections = (items: ContentSection[]) =>
      items.map((section, idx) => (
        <React.Fragment key={idx}>
          {/* Placeholder output; replace with real registry-driven rendering when available */}
          <div data-type={section.type} {...(section.props ?? {})}>
            {section.children ? renderSections(section.children) : null}
          </div>
        </React.Fragment>
      ));

    return (
      <Content
        id={props.id}
        className={props.className}
        sx={props.sx}
        data-testid={props['data-testid']}
      >
        {props.children}
        {renderSections(sections)}
      </Content>
    );
  },
};

export default ContentResolver;
