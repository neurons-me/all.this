import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Table from './Table';
import { Box,
      TableHead,
      TableRow, 
      TableCell, 
      TableBody, 
      Typography } from '@/gui/atoms';

const meta: Meta<typeof Table> = {
  title: 'Atoms/DataDisplay/Table',
  component: Table,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 16, minHeight: 260, maxWidth: 920 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **Table** atom is a thin wrapper around MUI's \`Table\`.  
It preserves MUI props and typing (faithful to the original), and fits naturally into This.GUI's declarative/resolver pattern.

---
## Features
- Fully preserves MUI Table API and typing.
- Supports \`sx\` styling via the system.
- Works with other Table atoms: \`TableHead\`, \`TableBody\`, \`TableRow\`, \`TableCell\`.
- Can be described declaratively via the **TableResolver**.

---
## Basic usage (React)
~~~tsx
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/gui/components/atoms';

<Table size="small">
  <TableHead>
    <TableRow>
      <TableCell>ID</TableCell>
      <TableCell>Name</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>1</TableCell>
      <TableCell>Alice</TableCell>
    </TableRow>
  </TableBody>
</Table>
~~~

---
## Declarative JSON / Resolver
~~~json
{
  "type": "Table",
  "props": {
    "size": "small",
    "sx": { "minWidth": 420 },
    "children": [
      { "type": "TableHead", "props": { "children": { "type": "TableRow", "props": { "children": [
        { "type": "TableCell", "props": { "children": "ID" } },
        { "type": "TableCell", "props": { "children": "Name" } }
      ]}}}},
      { "type": "TableBody", "props": { "children": { "type": "TableRow", "props": { "children": [
        { "type": "TableCell", "props": { "children": 1 } },
        { "type": "TableCell", "props": { "children": "Alice" } }
      ]}}}}
    ]
  }
}
~~~
        `,
      },
    },
  },
  argTypes: {
    size: { control: { type: 'radio' }, options: ['small', 'medium'] },
    padding: { control: { type: 'select' }, options: ['default', 'checkbox', 'none'] },
    stickyHeader: { control: { type: 'boolean' } },
    sx: { control: 'object' },
  },
  args: {
    size: 'small',
    padding: 'default' as any, // MUI's types allow 'normal' depending on version; keep story loose
    stickyHeader: false,
    sx: {},
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const DemoTable: React.FC<React.ComponentProps<typeof Table>> = (props) => {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Table {...props}>
        {props.children ?? (
          <>
            <TableHead>
              <TableRow sx={{ background: 'background.nav' }}>
                <TableCell>
                  <Typography fontWeight={700}>ID</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={700}>Name</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={700}>Score</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { id: 1, name: 'Alice', score: 98 },
                { id: 2, name: 'Bob', score: 84 },
                { id: 3, name: 'Charlie', score: 91 },
              ].map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        )}
      </Table>
    </Box>
  );
};

export const Playground: Story = {
  render: (args) => <DemoTable {...args} />,
};

export const MediumSize: Story = {
  args: { size: 'medium' },
  render: (args) => <DemoTable {...args} />,
};

export const StickyHeader: Story = {
  args: { stickyHeader: true, sx: { minWidth: 520 } },
  render: (args) => (
    <Box sx={{ maxHeight: 180, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <DemoTable {...args} />
    </Box>
  ),
};

export const DensePaddingNone: Story = {
  args: { padding: 'none' as any, size: 'small' },
  render: (args) => <DemoTable {...args} />,
};

export const WithSx: Story = {
  args: { sx: { minWidth: 640 } },
  render: (args) => <DemoTable {...args} />,
};
