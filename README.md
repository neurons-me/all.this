<img src="https://suign.github.io/assets/imgs/monadlisa_allthis-removebg.png" alt="All.This Art" width="377" height="377" align="right">

# What is All.This?
**As an entry point, all.this facilitates easy access and interaction with the ecosystem's functionalities**, simplifying developers' engagement with the extensive capabilities available.

**Using** all.this **as an npm package**: 

## Install:
```bash
npm i all.this
```

## Import in your node.js project.
Module can be used like this:

```js
const allThis = require('all.this');
```

### **Key Points**
• **As a User**: You only need to **npm install all.this** and import the required modules into your project. 

• **As a Contributor**: You have access to the full structure of the monorepo, including workspaces and submodules. Use the provided npm scripts to manage the entire ecosystem effectively, keeping each module up-to-date and functioning smoothly.

## **Managing all.this as a Monorepo**
For contributors working on the development of all.this, managing the monorepo requires understanding the submodules, workspaces, and how to use npm scripts to handle the project.
**Setup for Development**

1. **Clone the Repository**
Clone the monorepo to start working on it:

```bash
git clone https://github.com/neurons-me/all.this.git
```

2. **Install Dependencies and Initialize Submodules**
Run the bootstrap command to set up all dependencies and submodules:

```
npm run bootstrap
```

This command will initialize the submodules and install the dependencies for each workspace.

3. **Update Submodules**
To pull the latest changes for each submodule, run:

```bash
npm run update-submodules
```

4. **Build All Workspaces**
Use this command to build all packages within the monorepo:

```bash
npm run build
```

Enjoy integrating and building upon `all.this`!

# Data Structures

**[this.me](https://suign.github.io/this.me)  - [this.audio](https://suign.github.io/this.audio) - [this.text](https://suign.github.io/this.text) - [this.wallet](https://suign.github.io/this.wallet) - [this.img](https://suign.github.io/this.img) - [this.pixel](https://suign.github.io/Pixels) - [be.this](https://suign.github.io/be.this) - [this.DOM](https://suign.github.io/this.DOM) - [this.env](https://suign.github.io/this.env/) - [this.GUI](https://suign.github.io/this.GUI) - [this.be](https://suign.github.io/this.be) - [this.video](https://suign.github.io/this.video) - [this.atom](https://suign.github.io/this.atom) - [this.dictionaries](https://suign.github.io/this.dictionaries/)**

These classes encapsulate the functionalities to **domain-specific data.**

### License & Policies
- **License**: MIT License (see LICENSE for details).
- **Privacy Policy**: Respects user privacy; no collection/storage of personal data.
- **Terms of Usage**: Use responsibly. No guarantees/warranties provided. 
  [Terms](https://www.neurons.me/terms-of-use) | [Privacy](https://www.neurons.me/privacy-policy)
  [neurons.me](https://neurons.me)

<img src="https://suign.github.io/neurons.me/neurons_logo.png" alt="neurons.me logo" width="123" height="123" style="width123px; height:123px;">





