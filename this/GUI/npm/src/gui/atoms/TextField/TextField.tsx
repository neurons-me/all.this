/*
 * This.GUI — TextField (polymorphic)
 * Wrapper that keeps MUI's typing, including full prop support.
 * Examples:
 *   <TextField label="Name" variant="outlined" />
 *   <TextField multiline rows={4} placeholder="Write something..." />
 */
import MuiTextField from '@mui/material/TextField';
import * as React from 'react';

// Re-export using MUI's own component type
const TextField = MuiTextField;
export type TextFieldProps = React.ComponentProps<typeof TextField>;
(TextField as any).displayName = 'Gui.TextField';
export default TextField;