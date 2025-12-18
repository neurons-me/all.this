import * as Ethereum from './types/ethereum.js';
import * as Bitcoin from './types/bitcoin.js';
import * as Stellar from './types/stellar.js';

function createHandler(type, options) {
  switch (type) {
    case 'ethereum': return new Ethereum.WalletHandler(options);
    case 'bitcoin':  return new Bitcoin.WalletHandler(options);
    case 'stellar':  return new Stellar.WalletHandler(options);
    default: throw new Error(`Unsupported wallet type: ${type}`);
  }
}

/**
 * Wallet façade – thin wrapper over chain-specific handlers.
 * IMPORTANT: Do not duplicate state here. Delegate to the handler.
 */
export class Wallet {
  constructor({ type = 'ethereum', ...opts } = {}) {
    this.type = type;
    this.handler = createHandler(type, opts);
    this._promoteHandlerMethods();
  }

  // Promote handler methods onto this instance (generateAddress, getBalance, sendCrypto, etc.)
  _promoteHandlerMethods() {
    const h = this.handler;
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(h))
      .filter(n => typeof h[n] === 'function' && n !== 'constructor');
    for (const n of methodNames) {
      // bind to handler so internal `this` is correct
      this[n] = h[n].bind(h);
    }
  }

  /** Export via handler (optionally without secrets) */
  export(opts = {}) {
    return this.handler.export ? this.handler.export(opts) : {
      type: this.type,
      address: this.address,
    };
  }

  /** Add/override a network entry on the handler */
  addNetwork(name, config) {
    if (!this.handler.addNetwork) throw new Error('addNetwork not supported by handler');
    return this.handler.addNetwork(name, config);
  }

  /** Select active network on the handler */
  setNetwork(name) {
    if (!this.handler.setNetwork) throw new Error('setNetwork not supported by handler');
    return this.handler.setNetwork(name);
  }

  /** Introspection that reflects the handler’s truth */
  getTypeInfo() {
    if (this.handler.getTypeInfo) return this.handler.getTypeInfo();
    return {
      type: this.type,
      address: this.address,
      currentNetwork: null,
      availableNetworks: [],
    };
  }

  // Simple getters that proxy to the handler
  get address()   { return this.handler.address; }
  get publicKey() { return this.handler.publicKey; }
  get privateKey(){ return this.handler.privateKey; }
  get mnemonic()  { return this.handler.mnemonic; }

  /** Re-create from JSON by passing it straight to the handler */
  static import(json) {
    return new Wallet(json); // handler ctor soporta {privateKey/mnemonic/networks/currentNetwork}
  }
}

// ── Dev helper for the browser: list real methods from the instance’s handler ──
const _printWalletHelp = (w) => {
  console.log("%c[this.wallet] Available Methods:", "color:#4CAF50;font-weight:bold;");
  const map = {};
  const proto = Object.getPrototypeOf(w.handler);
  Object.getOwnPropertyNames(proto)
    .filter(n => n !== "constructor" && typeof w.handler[n] === "function")
    .forEach(n => { map[n] = "(handler)"; });

  // façade methods you may want to highlight
  ["addNetwork","setNetwork","export","getTypeInfo"].forEach(n => {
    if (typeof w[n] === "function") map[n] = (map[n] ? map[n]+" + façade" : "(façade)");
  });

  console.table(map);
  console.log(
    "%cTip:%c e.g. `wallet.generateAddress()`, `wallet.setNetwork('mainnet')`, `await wallet.getBalance()`",
    "color:#2196F3;font-weight:bold;", "color:#333;"
  );
};

// Expose a default instance for DX in the browser (optional)
if (typeof window !== "undefined") {
  const instance = new Wallet({ type: "ethereum" });
  window.wallet = instance;
  instance.help = () => _printWalletHelp(instance);
  console.log(".wallet loaded. Tip: type `wallet.help()` to see available methods.");
}

export default Wallet;