import * as React from 'react';
import type { RegistryEntry } from '@/gui/registry/types';
import RightSidebar from './RightSidebar';
import type { RightSidebarElement } from './RightSidebar.types';

type RightSidebarSpec = {
  type: 'RightSidebar';
  props?: {
    elements?: RightSidebarElement[];
    footerElements?: RightSidebarElement[];
    initialView?: 'rail' | 'expanded' | 'mobile';
    className?: string;
    id?: string;
    'data-testid'?: string;
  };
};

const RightSidebarResolver: RegistryEntry = {
  type: 'RightSidebar',
  resolve(spec: RightSidebarSpec) {
    const props = spec.props ?? {};
    return (
      <RightSidebar
        elements={props.elements ?? []}
        footerElements={props.footerElements ?? []}
        initialView={props.initialView}
        className={props.className}
        id={props.id}
        data-testid={props['data-testid']}
      />
    );
  },
};

export default RightSidebarResolver;
