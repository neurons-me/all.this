import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Layout from '@/gui/Layout/Layout';
import Box from '@/gui/atoms/Box/Box';
import Typography from '@/gui/atoms/Typography/Typography';
const meta: Meta<typeof Layout> = {
  title: 'GUI/Layout/Content',
  component: Layout,
  parameters: { layout: 'fullscreen' },
};
export default meta;
interface DemoContentProps {
  text: string;
}

const DemoContent: React.FC<DemoContentProps> = ({ text }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      color: 'text.primary',
    }}
  >
    <Typography variant="h4">{text}</Typography>
  </Box>
);

const Template = (args: React.ComponentProps<typeof Layout>): React.JSX.Element => (
  <Layout {...args}>
    <DemoContent text="This is the Content area" />
  </Layout>
);

type Story = StoryObj<typeof Layout>;
export const OnlyContent: Story = {
  render: Template,
  args: {
    topBarConfig: false,
    leftSidebarConfig: false,
    rightSidebarConfig: false,
    footerConfig: false,
  },
};

export const WithTopBar: Story = {
  render: Template,
  args: {
    topBarConfig: { title: 'Top Bar Example' },
  },
};

export const WithSidebars: Story = {
  render: Template,
  args: {
    leftSidebarConfig: { initialView: 'expanded' },
    rightSidebarConfig: { initialView: 'expanded' },
  },
};

export const WithTopBarAndSidebars: Story = {
  render: Template,
  args: {
    topBarConfig: { title: 'Top Bar Example' },
    leftSidebarConfig: { initialView: 'rail' },
    rightSidebarConfig: { initialView: 'expanded' },
  },
};

export const FullLayout: Story = {
  render: Template,
  args: {
    topBarConfig: { title: 'Full Layout' },
    leftSidebarConfig: { initialView: 'rail' },
    rightSidebarConfig: { initialView: 'rail' },
    footerConfig: {
      brandLabel: 'neurons.me',
      position: 'static',
      leftElements: [{ type: 'link', props: { label: 'Docs', href: '/docs' } }],
      rightElements: [{ type: 'link', props: { label: 'GitHub', href: 'https://github.com/neurons-me' } }],
    },
  },
};
