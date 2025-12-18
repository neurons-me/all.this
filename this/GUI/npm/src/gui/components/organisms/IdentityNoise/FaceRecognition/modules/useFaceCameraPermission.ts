import * as React from 'react';

export type CameraPermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

export type UseFaceCameraPermissionArgs = {
  /** When false, the hook stays idle and returns 'unknown'. */
  enabled: boolean;
};

export type UseFaceCameraPermissionResult = {
  permissionState: CameraPermissionState;
};

/**
 * useFaceCameraPermission
 *
 * Reads camera permission state using `navigator.permissions` when available.
 * - Some browsers (notably Safari) don't support `navigator.permissions` for camera.
 * - When unsupported (or errors), returns 'unknown'.
 */
export function useFaceCameraPermission(
  args: UseFaceCameraPermissionArgs
): UseFaceCameraPermissionResult {
  const { enabled } = args;
  const [permissionState, setPermissionState] =
    React.useState<CameraPermissionState>('unknown');

  React.useEffect(() => {
    if (!enabled) {
      setPermissionState('unknown');
      return;
    }

    let cancelled = false;

    async function checkPermission() {
      try {
        const perms: any = (navigator as any)?.permissions;
        if (!perms?.query) {
          if (!cancelled) setPermissionState('unknown');
          return;
        }

        const status = await perms.query({ name: 'camera' as any });
        if (cancelled) return;

        setPermissionState((status?.state as CameraPermissionState) ?? 'unknown');

        if (status && typeof status.onchange !== 'undefined') {
          status.onchange = () => {
            if (cancelled) return;
            setPermissionState((status?.state as CameraPermissionState) ?? 'unknown');
          };
        }
      } catch {
        if (!cancelled) setPermissionState('unknown');
      }
    }

    checkPermission();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { permissionState };
}

export default useFaceCameraPermission;