import React from 'react';
import { 
    Box, 
    Table,
    TableHead,
    TableRow, 
    TableCell, 
    TableBody,
    Typography } from '@/gui/atoms';

export interface BlocksTableEntry {
  id: number;
  blockId: string;
  timestamp: number;
  namespace: string;
  identityHash: string;
  expression: string;
  json: string;
}

export function BlocksTable({ endpoint }: { endpoint: string }) {
  const [data, setData] = React.useState<BlocksTableEntry[]>([]);

  React.useEffect(() => {
    async function loadBlocks() {
      const base = String(endpoint || '').replace(/\/+$/, '');
      if (!base) {
        setData([]);
        return;
      }

      const tryFetchJson = async (url: string) => {
        const res = await fetch(url, { method: 'GET' });
        const text = await res.text();
        const ct = res.headers.get('content-type') || '';
        const looksJson =
          ct.includes('application/json') ||
          text.trim().startsWith('{') ||
          text.trim().startsWith('[');

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!looksJson) throw new Error('Not JSON');

        return JSON.parse(text);
      };

      try {
        let json: any;
        try {
          json = await tryFetchJson(`${base}/blocks`);
        } catch {
          // Fallback: some nodes expose blocks at the root URL
          json = await tryFetchJson(`${base}/`);
        }

        if (Array.isArray(json)) setData(json as any);
        else if (Array.isArray(json?.blocks)) setData(json.blocks);
        else if (Array.isArray(json?.data)) setData(json.data);
        else setData([]);
      } catch (e) {
        console.error('[BlocksTable] Failed to load blocks:', e);
        setData([]);
      }
    }
    loadBlocks();
  }, [endpoint]);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: 'background.nav',
        overflow: 'hidden',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ background: 'background.paper' }}>
            <TableCell><Typography fontWeight={700}>ID</Typography></TableCell>
            <TableCell><Typography fontWeight={700}>Block ID</Typography></TableCell>
            <TableCell><Typography fontWeight={700}>Timestamp</Typography></TableCell>
            <TableCell><Typography fontWeight={700}>Namespace</Typography></TableCell>
            <TableCell><Typography fontWeight={700}>Identity</Typography></TableCell>
            <TableCell><Typography fontWeight={700}>Expression</Typography></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography sx={{ opacity: 0.6, py: 3 }}>No blocks yet.</Typography>
              </TableCell>
            </TableRow>
          )}

          {data.map((r) => (
            <TableRow key={r.blockId}>
              <TableCell>{r.id}</TableCell>
              <TableCell sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.blockId}
              </TableCell>
              <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
              <TableCell>{r.namespace}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {r.identityHash}
              </TableCell>
              <TableCell>{r.expression}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default BlocksTable;