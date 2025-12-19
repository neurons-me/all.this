import * as React from 'react';
import MuiCardActions from '@mui/material/CardActions';

/**
 * This.GUI — CardActions (atom)
 * Thin wrapper around MUI’s CardActions.
 *
 * - Preserves all props from MUI.
 * - Supports polymorphism, `sx`, layout spacing, and children.
 */
const CardActions = MuiCardActions;
export type CardActionsProps = React.ComponentProps<typeof CardActions>;
(CardActions as any).displayName = 'Gui.CardActions';
export default CardActions;
