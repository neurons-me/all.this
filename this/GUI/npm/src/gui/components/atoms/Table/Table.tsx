/**
 * This.GUI — Table
 * Thin wrapper that preserves MUI's own typing and API.
 *
 * Examples:
 *   <Table size="small">
 *     ...
 *   </Table>
 *
 * Notes:
 * - Preserves polymorphism and full MUI Table props.
 * - Integrates into This.GUI namespace and resolver pattern.
 */
import * as React from 'react';
import MuiTable from '@mui/material/Table';
// Re-export using MUI's own component type to keep full typing
const Table = MuiTable;
export type TableProps = React.ComponentProps<typeof Table>;
(Table as any).displayName = 'Gui.Table';
export default Table;
