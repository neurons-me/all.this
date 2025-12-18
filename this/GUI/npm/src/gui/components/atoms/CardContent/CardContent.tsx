import * as React from 'react';
import MuiCardContent from '@mui/material/CardContent';
/**
 * This.GUI — CardContent (atom)
 * Thin wrapper around MUI’s CardContent component.
 *
 * - Preserves props and typing directly from MUI.
 * - Allows styling via `sx`, polymorphism via `component`, and content via `children`.
 */
const CardContent = MuiCardContent;
export type CardContentProps = React.ComponentProps<typeof CardContent>;
(CardContent as any).displayName = 'Gui.CardContent';
export default CardContent;