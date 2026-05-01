<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1765903003/all.this_sr55ml.webp" style="width: 21%" />

# All.This
A modular **ecosystem** under **all.this.**

#### User Centric:

# **.me**

#### Modules

**Cleaker, netget, pixelgrid, mlearning, monad, neurons.me.**

#### Packages
> Versions below are the pinned versions.

**.text / .blockhain / .env / .GUI / .url / .DOM / .pixel / .wallet / .dictionaries / .img / .dir / .audio / .document / .video.**

`all.this` is the root repository. Everything inside is a **git submodule** — each one is its own independent repo.

#### Two independent systems, same files 

**git submodules** | entire repo | version control, GitHub pushes | 

**pnpm workspace** | `npm/` folders only | link JS dependencies locally |

They don't conflict. Submodules handle source control. pnpm handles local JS wiring. 

## Getting Started 

```bash
bash git clone --recurse-submodules https://github.com/neurons-me/all.this.git 
cd all.this 
pnpm install 
```

The `pnpm-lock.yaml` file ensures reproducible installs across machines. Without it, `pnpm install` resolves versions from scratch — different machines, different versions, hard-to-reproduce bugs.
