import * as React from 'react';
import MuiTableBody from '@mui/material/TableBody';
// Re-export using MUI's own component type to keep full typing
const TableBody = MuiTableBody;
export type TableBodyProps = React.ComponentProps<typeof TableBody>;
(TableBody as any).displayName = 'Gui.TableBody';
export default TableBody;
