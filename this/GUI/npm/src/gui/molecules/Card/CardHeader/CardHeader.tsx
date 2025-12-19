import * as React from 'react';
import MuiCardHeader from '@mui/material/CardHeader';

/**
 * This.GUI — CardHeader (atom)
 * Thin wrapper around MUI’s CardHeader that preserves props & typing.
 * Useful for defining title, subheader, and action areas in cards with consistent API.
 */
const CardHeader = MuiCardHeader;
export type CardHeaderProps = React.ComponentProps<typeof CardHeader>;
(CardHeader as any).displayName = 'Gui.CardHeader';
export default CardHeader;