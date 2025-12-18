use once_cell::sync::Lazy;
use std::collections::HashSet;
//ethereum
pub static ALLOW_METHODS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "eth_chainId",
        "eth_getBalance",
        "eth_call",
        "eth_estimateGas",
        "eth_getTransactionCount",
        "eth_sendRawTransaction",
        "net_version",
        "web3_clientVersion",
    ])
});