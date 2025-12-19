// src/components/generics/AppBars/TopBar/TopBar.resolver.tsx
import TopBar from './TopBar';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
/** Declarative shape the renderer/LLM can emit for a TopBar */
type TopBarLinkChildSpec = {
  label: string;
  href?: string;
  external?: boolean;
  icon?: string;
  iconColor?: string;
};

type TopBarLinkSpec = {
  label: string;
  href?: string;
  external?: boolean;
  icon?: string;
  iconColor?: string;
  children?: TopBarLinkChildSpec[];
};

type TopBarSpec = {
  type: 'TopBar';
  props?: {
    title?: string;
    logo?: string;
    NavBarLinks?: TopBarLinkSpec[];
    showMenuButton?: boolean;
    showThemeToggle?: boolean;
    homeTo?: string;
    position?: 'fixed' | 'static' | 'sticky';
    /** Optional event id to resolve from ctx.actions (e.g., 'openLeftDrawer') */
    onMenuClickId?: string;
    /** Pass-through styling slot (sx forwarded to AppBar/Toolbar usage inside) */
    sx?: any;
    /** Misc passthroughs */
    id?: string;
    className?: string;
    'data-testid'?: string;
  };
};

/**
 * TopBarResolver
 * - Maps a JSON-friendly spec → real <TopBar />.
 * - Handlers can be injected from ResolveCtx via `onMenuClickId`.
 */
const TopBarResolver: RegistryEntry = {
  type: 'TopBar',
  resolve(spec: TopBarSpec, ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    // Resolve optional handler from ctx if provided
    const onMenuClick =
      (p.onMenuClickId && ctx?.actions && typeof ctx.actions[p.onMenuClickId] === 'function')
        ? ctx.actions[p.onMenuClickId]
        : undefined;

    return (
      <TopBar
        title={p.title ?? 'neurons.me'}
        logo={p.logo ?? 'https://neurons.me/neurons.me.png'}
        elementsCenter={(p.NavBarLinks ?? []).map(link => ({
          type: 'link',
          props: {
            label: link.label ?? '',
            href: link.href ?? '',
            external: link.external ?? false,
            icon: link.icon,
            iconColor: link.iconColor,
            children: link.children ?? [],
          }
        }))}
        homeTo={p.homeTo ?? '/'}
        position={p.position ?? 'fixed'}
        // passthroughs
        sx={p.sx}
        id={p.id}
        className={p.className}
        data-testid={p['data-testid']}
      />
    );
  },
};

export default TopBarResolver;