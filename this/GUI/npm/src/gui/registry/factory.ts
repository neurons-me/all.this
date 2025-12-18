import type { RegistryEntry, GuiRegistry } from "./types";

export function createRegistry(entries: RegistryEntry[]): GuiRegistry {
  return entries.reduce<GuiRegistry>((acc, e) => {
    acc[e.type] = e;
    return acc;
  }, {} as GuiRegistry);
}

export function extendRegistry(base: GuiRegistry, entries: RegistryEntry[]): GuiRegistry {
  return { ...base, ...createRegistry(entries) };
}