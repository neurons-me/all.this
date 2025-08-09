/*index.js
╔═╗╦  ╦  ╔╦╗╦ ╦╦╔═╗
╠═╣║  ║   ║ ╠═╣║╚═╗
╩ ╩╩═╝╩═╝o╩ ╩ ╩╩╚═╝
ⓝⓔⓤⓡⓞⓝⓢ.ⓜⓔ
🆂🆄🅸🅶🅽                                                                                                            
--------------------------------*/
import dotenv from 'dotenv';
dotenv.config();
//Data Structures.
const isDev = process.env.ENV === 'development';
let Me;
if (isDev) {
  Me = (await import('./codespaces/this.me/index.js')).default;
} else {
  Me = (await import('this.me')).default;
}
//import Img from "./codespaces/this.img/index.js";  // ✅ Fix this path
//import Text from "./codespaces/this.text/index.js"; 
export default all;

