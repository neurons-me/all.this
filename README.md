<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1765903003/all.this_sr55ml.webp" style="width: 21%" />

# All.This
A modular **ecosystem** under **all.this.**

### User Centric:

**.me**

## Modules

**Cleaker, netget, pixelgrid, mlearning, monad, neurons.me.**

## Packages
> Versions below are the pinned versions.
**.text / .blockhain / .env / .GUI / .url / .DOM / .pixel / .wallet / .dictionaries / .img / .dir / .audio / .document / .video.**

La estructura real es:


all.this/                    ← git repo principal
  modules/
    cleaker/                 ← git submodule (repo completo: npm/ + pip/ + crate/)
      npm/                   ← pnpm workspace apunta AQUÍ (solo esta carpeta)
      pip/
      crate/
    netget/                  ← git submodule (repo completo)
      package.json           ← este es especial, su npm/ ES la raíz
    monad/                   ← git submodule
      npm/                   ← pnpm workspace
  me/                        ← git submodule
    npm/                     ← pnpm workspace
Son dos sistemas ortogonales operando sobre los mismos archivos — no se pisan:

Sistema	Scope	Propósito
git submodules	Todo el repo (npm + pip + crate)	Control de versiones, pushes a GitHub
pnpm workspace	Solo la carpeta npm/	Linkear dependencias JS entre módulos

