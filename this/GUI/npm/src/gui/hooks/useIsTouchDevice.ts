// src/gui/hooks/useIsTouchDevice.ts

/**
 * useIsTouchDevice
 * ---------------
 * Hook that determines whether the current device supports touch events.
 * Useful for adapting UI behavior depending on touch capabilities.
 */

import { useEffect, useState } from 'react';

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasTouchSupport =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouch(hasTouchSupport);
  }, []);

  return isTouch;
}

export default useIsTouchDevice;