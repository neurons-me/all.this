/**
 * This.GUI — TableRow
 * Thin wrapper that preserves MUI's own typing and API.
 *
 * Examples:
 *   <TableRow hover>
 *     <TableCell>...</TableCell>
 *   </TableRow>
 *
 * Notes:
 * - Preserves full MUI TableRow props and typing.
 * - Integrates into This.GUI namespace and resolver pattern.
 */
import * as React from 'react';
import MuiTableRow from '@mui/material/TableRow';
// Re-export using MUI's own component type to keep full typing
const TableRow = MuiTableRow;
export type TableRowProps = React.ComponentProps<typeof TableRow>;
(TableRow as any).displayName = 'Gui.TableRow';
export default TableRow;
