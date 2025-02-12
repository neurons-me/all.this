/*index.js
╔═╗╦  ╦  ╔╦╗╦ ╦╦╔═╗
╠═╣║  ║   ║ ╠═╣║╚═╗
╩ ╩╩═╝╩═╝o╩ ╩ ╩╩╚═╝
ⓝⓔⓤⓡⓞⓝⓢ.ⓜⓔ
🆂🆄🅸🅶🅽                                                                                                            
--------------------------------
Aggregates all individual this.* modules into a single package for convenience.
For more information, visit: https://neurons.me*/
//all.this 
//Data Structures.
//import Me from "./codespaces/this.me/index.js"; // ✅ Load from local path
import Wallet from "./codespaces/this.wallet/index.js"; 
//import Img from "./codespaces/this.img/index.js";  // ✅ Fix this path
//import Text from "./codespaces/this.text/index.js"; 

const all = { Me, Be, Wallet, Img, Text };

export default all;

