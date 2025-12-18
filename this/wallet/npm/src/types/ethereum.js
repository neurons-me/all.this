// this.wallet/npm/src/types/ethereum.js
// by suiGn - neurons.me

import { defaultNetworks } from './eth/ethereum_default_networks.js';
import {
  Wallet as EthersWallet,
  verifyMessage,
  JsonRpcProvider,
  parseEther,
  formatEther,
  isAddress
} from 'ethers';

/**
 * Ethereum-like wallet handler (EVM chains: ETH, BNB, Goerli, etc.).
 * 
 * Design:
 * - Stateless by default: if no key/mnemonic is provided, a new random wallet is created in-memory.
 * - Networks are configurable and selected with `setNetwork(name)`.
 * - Native coin transfer is exposed as `sendCrypto()` (ETH/BNB/tBNB depending on the active network).
 * - All cryptographic operations are backed by ethers.js v6.
 */
export class WalletHandler {
  /**
   * @param {string|object|null} data
   *   - string: private key (hex with 0x)
   *   - object: { privateKey?, mnemonic?, networks?, currentNetwork? }
   *   - null/undefined: generates a new random wallet
   */
  constructor(data = null) {
    if (typeof data === 'string') {
      // Private key only
      this.wallet = new EthersWallet(data);
      this.mnemonic = null;
    } else if (data && typeof data.mnemonic === 'string') {
      // From mnemonic phrase
      this.wallet = EthersWallet.fromPhrase(data.mnemonic);
      this.mnemonic = data.mnemonic;
    } else if (data && typeof data.privateKey === 'string') {
      // Explicit private key
      this.wallet = new EthersWallet(data.privateKey);
      this.mnemonic = data.mnemonic || null;
    } else {
      // Ephemeral random wallet (recoverable via generated mnemonic)
      const rnd = EthersWallet.createRandom();
      this.wallet = EthersWallet.fromPhrase(rnd.mnemonic.phrase);
      this.mnemonic = rnd.mnemonic.phrase;
    }

    // Network configuration (copy defaults; allow overrides from input)
    this.networks = data?.networks || { ...defaultNetworks };
    this.currentNetwork = data?.currentNetwork || null;
    // Convenience mirrors (kept in sync when rotating keys)
    this.address = this.wallet.address;
    this.privateKey = this.wallet.privateKey;
    this.publicKey = this.wallet.publicKey || null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Internal helpers (keep small and predictable)
  // ─────────────────────────────────────────────────────────────────────────────
  /** @returns {object} active network config or throws if not selected/unknown */
  _getNetworkCfg() {
    if (!this.currentNetwork) {
      throw new Error("No network selected. Call setNetwork(name) first.");
    }
    const cfg = this.networks?.[this.currentNetwork];
    if (!cfg) {
      throw new Error(`Network ${this.currentNetwork} is not defined`);
    }
    return cfg;
  }

  /** @returns {string} RPC URL resolved from the current network config */
  _getRpcUrl() {
    const cfg = this._getNetworkCfg();

    // 1) Prefer proxy if provided: e.g., { proxyBase: "http://localhost:7878/rpc" }
    //    This automatically appends the `chain` query param based on currentNetwork.
    if (cfg.proxyBase) {
      const base = String(cfg.proxyBase);
      const sep = base.includes('?') ? '&' : '?';
      const chain = encodeURIComponent(this.currentNetwork);
      return `${base}${sep}chain=${chain}`;
    }

    // 2) Direct URL override
    if (cfg.rpcUrl) return cfg.rpcUrl;

    // 3) Template-based providers (Infura/Alchemy)
    if (cfg.rpcUrlTemplate) {
      const url = cfg.rpcUrlTemplate
        .replace("{INFURA_KEY}", cfg.INFURA_KEY || "")
        .replace("{ALCHEMY_KEY}", cfg.ALCHEMY_KEY || "");
      if (url.includes("{INFURA_KEY}") || url.includes("{ALCHEMY_KEY}")) {
        throw new Error(
          `Missing provider API key for ${this.currentNetwork}. ` +
          `Provide cfg.INFURA_KEY/ALCHEMY_KEY, or set cfg.proxyBase / cfg.rpcUrl.`
        );
      }
      return url;
    }

    throw new Error(
      `Network ${this.currentNetwork} missing rpcUrl, rpcUrlTemplate, or proxyBase`
    );
  }

  /** @returns {JsonRpcProvider} ethers provider bound to the active network */
  _getProvider() {
    return new JsonRpcProvider(this._getRpcUrl());
  }

  /** @returns {string} coin symbol for the current network (e.g., ETH, BNB) */
  getSymbol() {
    const cfg = this._getNetworkCfg();
    return cfg.symbol || "ETH";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API (promoted to the core/factory-returned instance)
  // ─────────────────────────────────────────────────────────────────────────────
  /**
   * Rotates to a brand-new wallet (new mnemonic/privateKey) and returns its address.
   * @returns {string} new checksum address
   */
  generateAddress() {
    const rnd = EthersWallet.createRandom();
    this.wallet = EthersWallet.fromPhrase(rnd.mnemonic.phrase);
    this.mnemonic = rnd.mnemonic.phrase;
    this.address = this.wallet.address;
    this.privateKey = this.wallet.privateKey;
    this.publicKey = this.wallet.publicKey || null;
    return this.address;
  }

  /**
   * Reads native balance for the active address on the selected network.
   * @returns {Promise<string>} balance as a decimal string in native units (18 decimals), e.g. "0.1234"
   */
  async getBalance() {
    const provider = this._getProvider();
    const wei = await provider.getBalance(this.wallet.address);
    return formatEther(wei);
  }

  /**
   * Sends the network's *native* coin (ETH/BNB/tBNB/etc.) to `to`.
   * 
   * @param {string} to - destination address (must be a valid EVM address)
   * @param {string|number} amountNative - amount in native units (human-readable), e.g. "0.01"
   * @param {object} overrides - optional tx fields: gasPrice/maxFeePerGas/maxPriorityFeePerGas/nonce...
   * @returns {Promise<{hash: string, network: string, symbol: string}>}
   */
  async sendCrypto(to, amountNative, overrides = {}) {
    if (!to || !isAddress(to)) {
      throw new Error(`Invalid 'to' address: ${to}`);
    }
    if (amountNative == null || amountNative === "" || Number(amountNative) < 0) {
      throw new Error("Invalid 'amount'");
    }
    const provider = this._getProvider();
    const signer = this.wallet.connect(provider);
    const tx = await signer.sendTransaction({
      to,
      value: parseEther(String(amountNative)), // Native EVM uses 18 decimals
      ...overrides
    });

    return {
      hash: tx.hash,
      network: this.currentNetwork,
      symbol: this.getSymbol()
    };
  }

  /** Back-compat alias (previously named `send`) */
  async send(to, amountEth, overrides = {}) {
    return this.sendCrypto(to, amountEth, overrides);
  }

  /**
   * Signs an arbitrary message with the current private key (EIP-191).
   * @param {string|Uint8Array} message
   * @returns {Promise<string>} signature (0x…)
   */
  sign(message) {
    return this.wallet.signMessage(message);
  }

  /**
   * Verifies a signature against the current wallet's address.
   * @param {string|Uint8Array} message
   * @param {string} signature
   * @returns {boolean} true if signature recovers to this wallet address
   */
  verifySignature(message, signature) {
    return verifyMessage(message, signature) === this.wallet.address;
  }

  /**
   * Adds or overrides a network configuration entry.
   * @param {string} name
   * @param {object} config - should provide at least { rpcUrl } or { rpcUrlTemplate + provider key }
   */
  addNetwork(name, config) {
    if (!this.networks) this.networks = {};
    this.networks[name] = config;
  }

  /**
   * Selects the active network by name (must exist in `this.networks`).
   * @param {string} name
   */
  setNetwork(name) {
    if (!this.networks || !this.networks[name]) {
      throw new Error(`Network ${name} is not defined`);
    }
    this.currentNetwork = name;
  }

  /**
   * Exports wallet data.
   * @param {object} [opts]
   * @param {boolean} [opts.includeSecrets=false] include privateKey/mnemonic (⚠️ browser-sensitive)
   * @returns {object}
   */
  export(opts = {}) {
    const { includeSecrets = false } = opts;
    return {
      type: 'ethereum',
      privateKey: includeSecrets ? this.wallet.privateKey : undefined,
      mnemonic: includeSecrets ? (this.mnemonic || null) : undefined,
      address: this.wallet.address,
      networks: this.networks || {},
      currentNetwork: this.currentNetwork || null
    };
  }

  /**
   * Re-creates a handler from exported JSON.
   * @param {object} data
   * @returns {WalletHandler}
   */
  static import(data) {
    return new WalletHandler(data);
  }

  /**
   * Introspection helper (useful for UIs/diagnostics).
   * @returns {{type:string, address:string, currentNetwork:string|null, availableNetworks:string[]}}
   */
  getTypeInfo() {
    return {
      type: 'ethereum',
      address: this.wallet.address,
      currentNetwork: this.currentNetwork,
      availableNetworks: Object.keys(this.networks || {})
    };
  }
}