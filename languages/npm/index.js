/*index.js
╔═╗╦  ╦  ╔╦╗╦ ╦╦╔═╗
╠═╣║  ║   ║ ╠═╣║╚═╗
╩ ╩╩═╝╩═╝o╩ ╩ ╩╩╚═╝
ⓝⓔⓤⓡⓞⓝⓢ.ⓜⓔ
🆂🆄🅸🅶🅽----------*/
import GUI from "this.gui";
export { GUI };
export * from "this.gui"; // <- permite import { TextTitle } from "all.this" si quieres

// Namespaces para otras libs
import * as me from "this.me";
import * as wallet from "this.wallet";
import * as cleaker from "cleaker";
export { me, wallet, cleaker };

// Default export (opcional)
export default {
  GUI,
  me,
  wallet,
  cleaker,
};