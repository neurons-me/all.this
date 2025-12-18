// src/themes/catalog/catalog.ts
// A collection of theme manifests
// and their associated modes (light/dark) with token paths.
// It also provides utility functions to access and manipulate the theme catalog.
import neuronsManifest from '../catalog/neurons/manifest';
import ghostShellManifest from '../catalog/GhostShell/manifest';
import PrinceOfDarknessManifest from '../catalog/PrinceOfDarkness/manifest';
import muiManifest from '../catalog/MUI/manifest';
import lunaManifest from '../catalog/LunaHex/manifest';
import cherryByteManifest from '../catalog/CherryByte/manifest';
import SeafoamManifest from '../catalog/Seafoam/manifest';
import { FlatGuiTheme } from '@/types/theme'; //definiciones de tipos
export const GuiThemes = [neuronsManifest, ghostShellManifest, PrinceOfDarknessManifest, muiManifest, lunaManifest, cherryByteManifest, SeafoamManifest];
/*
 FlatGuiThemes (plano)
	•	Es un array plano de modos individuales.
	•	Cada GuiTheme en esta lista representa una única combinación de:
	•	themeId
	•	themeName
	•	mode (light o dark)
	•	tokens
	•	manifest
	•	Esto es útil para renderizar selects, listas visuales, previews, etc.
  */
export const FlatGuiThemes = GuiThemes.flatMap((manifest) => {
  return (['light', 'dark'] as const).flatMap((mode) => {
    return [{
      themeId: manifest.themeId ?? '',
      themeName: manifest.themeName ?? '',
      description: manifest.description,
      author: manifest.author,
      version: manifest.version,
      license: manifest.license,
      homepage: manifest.homepage,
      tags: manifest.tags,
      createdAt: manifest.createdAt,
      updatedAt: manifest.updatedAt,
      badgeUrl: manifest.badgeUrl,
      mode,
      // Si los tokens ya están cargados/resueltos en este punto:
      tokens: manifest.mode?.[mode] ?? {},
    }];
  });
});
/*
	•	Representa la colección de temas, donde cada tema tiene dos modos (light y dark).
	•	Es decir, el theme completo, tal como viene en el manifest.*/


export function getGuiThemes() {
  return GuiThemes;
}
export function getGuiTheme(themeId: string) {
  return GuiThemes.find(theme => theme.themeId === themeId);
}
export function getFlatGuiThemes(): FlatGuiTheme[] {
  return FlatGuiThemes;
}
export function getFlatGuiTheme(themeId: string, mode: 'light' | 'dark') {
  return FlatGuiThemes.find(theme => theme.themeId === themeId && theme.mode === mode);
}