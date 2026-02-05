import type { Meta, StoryObj } from '@storybook/react';
import CodeBlock from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Molecules/Code/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  args: {
    language: 'html',
    variant: 'dark',
    title: 'index.html',
    showLineNumbers: false,
    wrapLongLines: true,
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>this.GUI</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {
  name: 'Default',
};

export const WithTitle: Story = {
  name: 'With Title',
  args: {
    title: 'bootstrap.html',
  },
};

export const TypeScript: Story = {
  name: 'TypeScript',
  args: {
    language: 'ts',
    title: 'gui-tools.ts',
    code: `export const guiToolsLeftSidebarConfig = {
  initialView: 'rail' as const,
  elements: [
    { type: 'link', props: { label: 'Home', icon: 'home', href: 'https://neurons-me.github.io/' } },
    { type: 'link', props: { label: 'Themes', icon: 'palette', href: 'https://neurons-me.github.io/this.GUI/themes/' } },
  ],
};`,
  },
};

export const LightVariant: Story = {
  name: 'Light Variant',
  args: {
    variant: 'light',
    language: 'bash',
    title: 'terminal',
    code: `npm run build
npm run build-storybook`,
  },
};

export const WithLineNumbers: Story = {
  name: 'With Line Numbers',
  args: {
    showLineNumbers: true,
    language: 'json',
    title: 'package.json',
    code: `{
  "name": "this.gui",
  "version": "1.0.0",
  "private": false
}`,
  },
};

export const WrapLongLines: Story = {
  name: 'Wrap Long Lines',
  args: {
    wrapLongLines: true,
    language: 'txt',
    title: 'notes.txt',
    code: `This is a very long line intended to demonstrate wrapping behavior in CodeBlock. If wrapping is enabled, it should continue on the next visual line instead of forcing horizontal scrolling forever.`,
  },
};
