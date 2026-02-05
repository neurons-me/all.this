import React from 'react';
import ThemeModeToggle from '@/gui/Theme/ToggleMode/ToggleMode';

/**
 * GUI Tools
 * ---------
 * A tiny, portable set of left-sidebar link elements used across
 * standalone HTML pages and internal docs.
 *
 * This is intentionally framework-light: you can import the `elements`
 * array directly, or use the `leftSidebarConfig` helper.
 */

export type GUIToolsLinkElement = {
  type: 'link';
  props: {
    label: string;
    icon: string;
    href: string;
  };
};

export type GUIToolsActionElement = {
  type: 'action';
  props: {
    // Optional metadata (some renderers show label/icon for actions)
    label?: string;
    icon?: string;
    // The actual rendered element
    element: React.ReactNode;
  };
};

export type GUIToolsElement = GUIToolsLinkElement | GUIToolsActionElement;
export type GUIToolsElements = GUIToolsElement[];

/**
 * The canonical sidebar elements used by .GUI docs/runtime pages.
 */
export const guiToolsElements: GUIToolsElements = [
  {
    type: 'link',
    props: {
      label: 'Home',
      icon: 'home',
      href: 'https://neurons-me.github.io/',
    },
  },
  {
    type: 'link',
    props: {
      label: 'all.this',
      icon: 'hub',
      href: 'https://neurons-me.github.io/all.this',
    },
  },
  {
    type: 'link',
    props: {
      label: '.GUI',
      icon: 'widgets',
      href: 'https://neurons-me.github.io/this.GUI',
    },
  },
  
  {
    type: 'link',
    props: {
      label: 'Themes',
      icon: 'palette',
      href: 'https://neurons-me.github.io/themes.html',
    },
  },
    {
    type: 'link',
    props: {
      label: 'Storybook',
      icon: 'auto_stories',
      href: 'https://neurons-me.github.io/storybook-static/',
    },
  },
  {
    type: 'link',
    props: {
      label: 'GitHub',
      icon: 'code',
      href: 'https://github.com/neurons-me/this.GUI',
    },
  },
  {
    type: 'link',
    props: {
      label: 'npm',
      icon: 'package_2',
      href: 'https://www.npmjs.com/package/this.gui',
    },
  },
  {
    type: 'action',
    props: {
      label: 'Theme',
      icon: 'contrast',
      element: (
        <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />
      ),
    },
  },
];

/**
 * Minimal leftSidebarConfig payload (matches Layout stories shape).
 */
export const guiToolsLeftSidebarConfig = {
  initialView: 'rail' as const,
  elements: guiToolsElements,
};

/**
 * Optional helper component: returns its `children` unchanged.
 * Useful when you want to colocate/standardize the config import
 * without forcing a specific layout.
 */
export type GUIToolsProps = {
  children?: React.ReactNode;
};

export default function GUITools(props: GUIToolsProps) {
  return <>{props.children ?? null}</>;
}
