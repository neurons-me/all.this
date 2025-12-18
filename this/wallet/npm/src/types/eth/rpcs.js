// src/types/eth/rpcs.js
// by suiGn - neurons.me

export const RPCS = {
  mainnet: [
    // Públicos primero (sin API key, pero pueden ser menos estables)
    "https://ethereum.publicnode.com",
    "https://rpc.ankr.com/eth",
    // Plantillas con API key opcional
    "https://mainnet.infura.io/v3/{INFURA_KEY}",
    "https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_KEY}",
  ],
  goerli: [
    "https://rpc.ankr.com/eth_goerli",
    "https://goerli.infura.io/v3/{INFURA_KEY}",
  ],
  bnb: [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
  ],
  bnbTestnet: [
    "https://data-seed-prebsc-1-s1.binance.org:8545/",
    "https://bsc-testnet.publicnode.com",
  ],
};