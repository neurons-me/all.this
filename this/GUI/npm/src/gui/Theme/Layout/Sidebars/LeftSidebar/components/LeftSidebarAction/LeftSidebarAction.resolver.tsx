export default function resolveLeftSidebarAction({
  action,
  context,
}: {
  action: string | (() => any);
  context?: any;
}) {
  try {
    if (typeof action === 'function') return action();
    if (typeof action === 'string') {
      const fn = (window as any)[action];
      if (typeof fn === 'function') return fn(context);
      console.warn(`LeftSidebarAction: No global function found for "${action}"`);
    }
  } catch (err) {
    console.error(`Error executing LeftSidebarAction for "${action}":`, err);
  }
  return undefined;
}