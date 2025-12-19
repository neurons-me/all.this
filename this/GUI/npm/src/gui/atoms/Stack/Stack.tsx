/*
 * This.GUI — Stack (polymorphic)
 * Thin wrapper that preserves MUI's own typing and `component` API.
 * Examples:
 *   <Stack direction="row" spacing={2} />
 *   <Stack component="section" gap={1} />
 *   <Stack component="a" href="/docs" />
 */
import MuiStack from '@mui/material/Stack';
import * as React from 'react';
// Re-export using MUI's own component type to keep polymorphism and full typing
const Stack = MuiStack;
export type StackProps = React.ComponentProps<typeof Stack>;
(Stack as any).displayName = 'Gui.Stack';
export default Stack;
