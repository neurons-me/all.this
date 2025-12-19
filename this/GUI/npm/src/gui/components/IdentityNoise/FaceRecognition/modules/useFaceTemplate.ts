import * as React from 'react';
import type {
  FaceTemplate,
  Blendshape,
  Point2D,
  UseFaceTemplateBurstOptions,
} from './useFaceTemplateBurst';
import { useFaceTemplateBurst } from './useFaceTemplateBurst';

// Re-export types (optional, but handy for external imports)
export type { FaceTemplate, Blendshape, Point2D };

// Backwards-friendly alias: keep old hook name, same options.
export type UseFaceTemplateOptions = UseFaceTemplateBurstOptions;

export type UseFaceTemplateResult = {
  stableTemplate: FaceTemplate | null;
  reset: () => void;
};

/**
 * useFaceTemplate
 *
 * Backwards-friendly wrapper. Internally uses a burst sampler that emits
 * a stable template every N samples.
 */
export function useFaceTemplate(options: UseFaceTemplateOptions): UseFaceTemplateResult {
  const { stableTemplate, reset } = useFaceTemplateBurst(options);
  return { stableTemplate, reset };
}

export default useFaceTemplate;