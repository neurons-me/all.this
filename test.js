import all from "./index.js";

const me = new all.Me("jabellae");

console.log("Username:", me.username);

me.be("name", "Abella");
me.be("age", 30);

console.log("Attributes:", me.getAttributes());

me.addWallet({ type: "ETH", address: "0x123..." });
console.log("Wallets:", me.getWallets());