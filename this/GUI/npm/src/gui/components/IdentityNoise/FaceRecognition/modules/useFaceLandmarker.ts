

import * as React from 'react';

// We keep a module-level singleton so multiple FaceRecognition instances
// share one heavy MediaPipe model + wasm runtime.
let faceLandmarkerPromise: Promise<any | null> | null = null;
let faceLandmarkerSingleton: any | null = null;

// Note: The wasm + model URLs are pinned to specific versions for stability.
// They can be self-hosted later if desired.
async function getFaceLandmarker(): Promise<any | null> {
  if (faceLandmarkerSingleton) return faceLandmarkerSingleton;
  if (faceLandmarkerPromise) return faceLandmarkerPromise;

  faceLandmarkerPromise = (async () => {
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = vision as any;

      const wasmBasePath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
      const filesetResolver = await FilesetResolver.forVisionTasks(wasmBasePath);

      const modelPath =
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: modelPath,
        },
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      faceLandmarkerSingleton = faceLandmarker;
      return faceLandmarker;
    } catch {
      return null;
    }
  })();

  return faceLandmarkerPromise;
}

export type UseFaceLandmarkerOptions = {
  /** Whether the consumer wants the landmarker available. */
  enabled: boolean;
};

export type UseFaceLandmarkerResult = {
  faceLandmarker: any | null;
  faceLandmarkerLoading: boolean;
  faceLandmarkerError: boolean;
};

/**
 * useFaceLandmarker
 *
 * Loads MediaPipe's FaceLandmarker lazily and exposes loading/error state.
 * Uses a module-level singleton so we only pay model+wasm cost once.
 */
export function useFaceLandmarker(options: UseFaceLandmarkerOptions): UseFaceLandmarkerResult {
  const { enabled } = options;

  const [faceLandmarker, setFaceLandmarker] = React.useState<any | null>(null);
  const [faceLandmarkerError, setFaceLandmarkerError] = React.useState<boolean>(false);
  const [faceLandmarkerLoading, setFaceLandmarkerLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!enabled) {
      // We intentionally do not clear the module singleton; we only detach local state.
      setFaceLandmarker(null);
      setFaceLandmarkerLoading(false);
      setFaceLandmarkerError(false);
      return;
    }

    let cancelled = false;
    setFaceLandmarkerLoading(true);
    setFaceLandmarkerError(false);

    getFaceLandmarker().then((fl) => {
      if (cancelled) return;
      if (fl) {
        setFaceLandmarker(fl);
        setFaceLandmarkerLoading(false);
      } else {
        setFaceLandmarker(null);
        setFaceLandmarkerLoading(false);
        setFaceLandmarkerError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    faceLandmarker,
    faceLandmarkerLoading,
    faceLandmarkerError,
  };
}

export default useFaceLandmarker;