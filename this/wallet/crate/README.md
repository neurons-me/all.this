# This.Wallet.Proxy.Server
A lightweight **JSON-RPC proxy** for EVM-compatible blockchains (Ethereum, Goerli, Sepolia, BSC, etc.).  
Its goal is to safely expose blockchain calls to the frontend without leaking private provider keys, while offering **load balancing, caching, rate limiting, and circuit breaking**.

---

## ✨ Features
- **Multi-upstream support**: routes requests across multiple providers (public RPCs, Infura, Alchemy, etc.)
- **Round-robin balancing**: distributes traffic evenly between available upstreams.
- **Circuit breaker**: skips unreliable upstreams and retries others automatically.
- **Per-origin rate limiting**: avoids abuse by combining `origin` + `ip`.
- **Method allow-list**: only expose safe, explicitly permitted JSON-RPC methods.
- **CORS permissive**: designed for dApp frontend integration.
- **Chain-aware routing**: supports multiple EVM chains out-of-the-box.
- **Caching**: short-lived caching for `eth_chainId`.


## ⚙️ Configuration
All settings are controlled via **environment variables**.  

---

## 🚀 Usage

### Start the server
```bash
cargo run --release
```

By default, the server listens at:  
**`http://localhost:7878`**

---

### Endpoints

#### `GET /health`
Returns a simple **200 OK** with `"ok"`.  
Use this for health checks.

```bash
curl http://localhost:8080/health
# -> ok
```

---

#### `POST /rpc`
Proxies **JSON-RPC** requests to the configured upstreams.

Example:
```bash
curl -X POST http://localhost:8080/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'
```
Response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1"
}
```

Query parameter `chain` lets you select other EVM chains:
```bash
curl -X POST "http://localhost:8080/rpc?chain=sepolia" ...
```

---

## 🛡️ Rate Limiting

- Each client is identified by a combination of `Origin` + **real client IP**.
- Defaults to **120 requests per minute**.
- Exceeding the limit returns:
```json
{
  "error": "rate_limited"
}
```

---

## 🛠️ JSON-RPC Allow-List

For security, only safe methods are allowed by default:

- `eth_chainId`
- `eth_getBalance`
- `eth_call`
- `eth_estimateGas`
- `eth_getTransactionCount`
- `eth_sendRawTransaction`
- `net_version`
- `web3_clientVersion`

Requests using disallowed methods return:
```json
{
  "error": "method_not_allowed",
  "method": "eth_getLogs"
}
```

---

## 🧠 How It Works

1. **Pick upstreams**: based on `chain`, environment variables, and available providers.
2. **Rate limit**: rejects abusive origins/IPs.
3. **Round robin**: rotates through upstreams if multiple exist.
4. **Circuit breaker**: skips upstreams that recently failed.
5. **Caching**: `eth_chainId` responses are cached for short TTLs.
6. **Proxy request**: forwards the request and returns the response unchanged.

---

Mapa de rutas ⇄ consumidor
	•	GET /health → handlers::health::health
Consumido por: checks de infra o curl (para ver que el server vive).
	•	GET /meta → handlers::eth::meta::meta
Consumido por: páginas que quieren saber methods, chains, rate_limit. (Útil para poblar UIs sin hardcodear).
	•	GET / → handlers::home::home
Consumido por: la portada (home) del sitio.
	•	GET /ethereum → handlers::eth::ethereum::ethereum
Consumido por: la página “Ethereum” (intro, allowed methods, enlaces).
	•	GET /json-rpc-overview → handlers::eth::rpc_overview::rpc_overview
Consumido por: doc/overview de JSON-RPC (explica requests/responses).
	•	GET /rpc-providers → handlers::eth::rpc_providers::rpc_providers_page
Consumido por: doc de proveedores (Infura/Alchemy/Ankr/PublicNode).
	•	GET /dev/eth-upstreams → handlers::eth::dev_upstream::dev_upstreams_page
Consumido por: página dev que hace fetch a /meta/upstreams para listar upstreams efectivos.
	•	GET /meta/upstreams → handlers::eth::dev_upstream::meta_upstreams
Consumido por: solo dev, la página anterior; devuelve JSON con {url, status, ttl_down_secs, provider}. Requiere EXPOSE_UPSTREAMS=1.
	•	OPTIONS/POST /rpc → handlers::eth::rpc::{rpc_options, rpc}
Consumido por:
	•	Tu Playground (/eth-playground) vía fetch al dar “Run”.
	•	Cualquier cliente JSON-RPC (curl/SDK) que pegue a tu proxy.
	•	GET /eth-playground → handlers::eth::eth_playground::eth_playground
Consumido por: el navegador. La página incluye JS que:
	1.	lee ?method= (si viene)
	2.	prellena el textarea
	3.	al “Run”, hace POST /rpc?chain=<...> con el body JSON.

---

## 📄 License
MIT © neurons.me
Maintained by [neurons.me](https://neurons.me)
• Authored by suiGn
