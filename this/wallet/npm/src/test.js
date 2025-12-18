import { Wallet } from './wallet.js'; // ajusta la ruta si estás en otro dir
(async () => {
  // Prueba con Ethereum
  const wallet = new Wallet({ type: 'ethereum' });
  console.log('Wallet Address:', wallet.address);
  console.log('Wallet Type Info:', wallet.getTypeInfo());
  console.log('Mnemonic Phrase:', wallet.export().mnemonic || 'N/A');
  const message = 'hello world';
  const signature = await wallet.sign(message);
  console.log('Signature:', signature);
  const verified = await wallet.verifySignature(message, signature);
  console.log('Verified:', verified);
  // Network test
  wallet.addNetwork('mainnet', { chainId: 1, rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY' });
  wallet.setNetwork('mainnet');
  console.log('Current Network:', wallet.getTypeInfo().currentNetwork);
  // Export wallet and test import
  const exported = wallet.export();
  console.log('Exported Wallet:', exported);
  const importedWallet = Wallet.import(exported);
  console.log('Imported Wallet Address:', importedWallet.address);
  console.log('Imported Wallet Mnemonic:', importedWallet.mnemonic || 'N/A');
})();