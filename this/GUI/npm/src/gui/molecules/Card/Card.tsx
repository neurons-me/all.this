import * as React from 'react';
import MuiCard from '@mui/material/Card';
/**
 * This.GUI — Card (atom)
 * Wrapper around MUI’s Card that preserves props & typing.
 *
 * - Full support for MUI’s props and styling (`sx`, `elevation`, `variant`, etc.).
 * - No behavior changes; designed to keep consistent with the This.GUI atom model.
 */
const Card = MuiCard;
export type CardProps = React.ComponentProps<typeof Card>;
(Card as any).displayName = 'Gui.Card';
export default Card;