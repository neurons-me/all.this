import * as React from 'react';
import MuiAvatar from '@mui/material/Avatar';

/**
 * This.GUI — Avatar (atom)
 * Thin wrapper around MUI’s Avatar component.
 *
 * Supports standard avatar props like `src`, `alt`, `variant`, and `sx`.
 * Enables consistent use of avatar styling across the system.
 */
const Avatar = MuiAvatar;
export type AvatarProps = React.ComponentProps<typeof Avatar>;
(Avatar as any).displayName = 'Gui.Avatar';
export default Avatar;