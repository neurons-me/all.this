import * as React from 'react';
import MuiTableHead from '@mui/material/TableHead';

// Re-export using MUI's own component type to keep full typing
const TableHead = MuiTableHead;
export type TableHeadProps = React.ComponentProps<typeof TableHead>;

(TableHead as any).displayName = 'Gui.TableHead';
export default TableHead;
