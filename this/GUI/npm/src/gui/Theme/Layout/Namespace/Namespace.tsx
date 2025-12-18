// Layout/Namespace/Namespace.tsx
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@/gui/components/atoms/atoms';
// Import concrete blocks/views you want to render
type Resolved =
  | { kind: 'unknown'; path: string };
function resolve(pathname: string): Resolved {
  return { kind: 'unknown', path: pathname };
}

export default function Namespace() {
  const { pathname } = useLocation();
  const resolved = useMemo(() => resolve(pathname), [pathname]);
  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 800 }}>Namespace</Typography>
      <Typography sx={{ opacity: 0.75, fontFamily: 'monospace' }}>
        {resolved.path}
      </Typography>
      <Typography sx={{ mt: 1, opacity: 0.7 }}>
        View not wired yet.
      </Typography>
    </Box>
  );
}