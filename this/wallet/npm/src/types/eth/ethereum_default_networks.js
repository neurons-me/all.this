// src/types/networks/ethereum_default_networks.js
// by suiGn - neurons.me

export const defaultNetworks = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://rpc.ankr.com/eth',
    explorer: 'https://etherscan.io',
    symbol: 'ETH',
    requiresApiKey: false
  },
  bnb: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com',
    symbol: 'BNB',
    requiresApiKey: false
  },
  bnbTestnet: {
    chainId: 97,
    name: 'BNB Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorer: 'https://testnet.bscscan.com',
    symbol: 'tBNB',
    requiresApiKey: false
  },
  goerli: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://rpc.ankr.com/eth_goerli',
    explorer: 'https://goerli.etherscan.io',
    symbol: 'GoerliETH',
    requiresApiKey: false
  },
  infuraMainnet: {
    chainId: 1,
    name: 'Infura ETH',
    rpcUrlTemplate: 'https://mainnet.infura.io/v3/{INFURA_KEY}',
    explorer: 'https://etherscan.io',
    symbol: 'ETH',
    requiresApiKey: true,
    provider: 'infura'
  },
  alchemyMainnet: {
    chainId: 1,
    name: 'Alchemy ETH',
    rpcUrlTemplate: 'https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_KEY}',
    explorer: 'https://etherscan.io',
    symbol: 'ETH',
    requiresApiKey: true,
    provider: 'alchemy'
  }
};