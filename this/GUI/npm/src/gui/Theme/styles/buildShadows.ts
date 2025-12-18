// themes/styles/buildShadows.ts
import { Theme } from '@mui/material/styles';
export const buildShadows = (shadowTokens: any, mode: 'light' | 'dark'): Theme['shadows'] => {
  const DEFAULT_SHADOWS: string[] =
    mode === 'dark'
      ? [
          'none',
          '0px 1px 2px rgba(0,0,0,0.6)',
          '0px 2px 4px rgba(0,0,0,0.55)',
          '0px 3px 6px rgba(0,0,0,0.5)',
          '0px 4px 8px rgba(0,0,0,0.45)',
          '0px 5px 10px rgba(0,0,0,0.4)',
          '0px 6px 12px rgba(0,0,0,0.38)',
          '0px 7px 14px rgba(0,0,0,0.36)',
          '0px 8px 16px rgba(0,0,0,0.34)',
          '0px 9px 18px rgba(0,0,0,0.32)',
          '0px 10px 20px rgba(0,0,0,0.3)',
          '0px 11px 22px rgba(0,0,0,0.28)',
          '0px 12px 24px rgba(0,0,0,0.26)',
          '0px 13px 26px rgba(0,0,0,0.24)',
          '0px 14px 28px rgba(0,0,0,0.22)',
          '0px 15px 30px rgba(0,0,0,0.2)',
          '0px 16px 32px rgba(0,0,0,0.19)',
          '0px 17px 34px rgba(0,0,0,0.18)',
          '0px 18px 36px rgba(0,0,0,0.17)',
          '0px 19px 38px rgba(0,0,0,0.16)',
          '0px 20px 40px rgba(0,0,0,0.15)',
          '0px 22px 44px rgba(0,0,0,0.14)',
          '0px 24px 48px rgba(0,0,0,0.13)',
          '0px 26px 52px rgba(0,0,0,0.12)',
          '0px 28px 56px rgba(0,0,0,0.11)',
        ]
      : [
          'none',
          '0px 1px 2px rgba(0,0,0,0.08)',
          '0px 2px 4px rgba(0,0,0,0.1)',
          '0px 3px 6px rgba(0,0,0,0.12)',
          '0px 4px 8px rgba(0,0,0,0.14)',
          '0px 5px 10px rgba(0,0,0,0.15)',
          '0px 6px 12px rgba(0,0,0,0.16)',
          '0px 7px 14px rgba(0,0,0,0.17)',
          '0px 8px 16px rgba(0,0,0,0.18)',
          '0px 9px 18px rgba(0,0,0,0.19)',
          '0px 10px 20px rgba(0,0,0,0.2)',
          '0px 11px 22px rgba(0,0,0,0.21)',
          '0px 12px 24px rgba(0,0,0,0.22)',
          '0px 13px 26px rgba(0,0,0,0.23)',
          '0px 14px 28px rgba(0,0,0,0.24)',
          '0px 15px 30px rgba(0,0,0,0.25)',
          '0px 16px 32px rgba(0,0,0,0.26)',
          '0px 17px 34px rgba(0,0,0,0.27)',
          '0px 18px 36px rgba(0,0,0,0.28)',
          '0px 19px 38px rgba(0,0,0,0.29)',
          '0px 20px 40px rgba(0,0,0,0.3)',
          '0px 22px 44px rgba(0,0,0,0.31)',
          '0px 24px 48px rgba(0,0,0,0.32)',
          '0px 26px 52px rgba(0,0,0,0.33)',
          '0px 28px 56px rgba(0,0,0,0.34)',
        ];

  const ensureArrayLen = <T,>(arr: T[] | unknown, len: number, filler: T): T[] => {
    const a = Array.isArray(arr) ? ([...arr] as T[]) : [];
    for (let i = a.length; i < len; i++) a.push(filler);
    return a.slice(0, len);
  };

  if (Array.isArray(shadowTokens)) {
    return ensureArrayLen<string>(shadowTokens, 25, DEFAULT_SHADOWS[0]) as Theme['shadows'];
  }

  if (shadowTokens && typeof shadowTokens === 'object') {
    const arr: string[] = [];
    for (let i = 0; i < 25; i++) {
      const v =
        shadowTokens?.[i] ??
        shadowTokens?.[`s${i}`];
      arr.push(v ?? DEFAULT_SHADOWS[i] ?? DEFAULT_SHADOWS[0]);
    }
    return arr as Theme['shadows'];
  }

  return DEFAULT_SHADOWS as Theme['shadows'];
};
