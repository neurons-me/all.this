/**
 * This.GUI — TableCell
 * Thin wrapper that preserves MUI's own typing and API.
 *
 * Examples:
 *   <TableCell align="right">123</TableCell>
 *
 * Notes:
 * - Preserves full MUI TableCell props and typing.
 * - Integrates into This.GUI namespace and resolver pattern.
 */
import * as React from 'react';
import MuiTableCell from '@mui/material/TableCell';
// Re-export using MUI's own component type to keep full typing
const TableCell = MuiTableCell;
export type TableCellProps = React.ComponentProps<typeof TableCell>;
(TableCell as any).displayName = 'Gui.TableCell';
export default TableCell;
