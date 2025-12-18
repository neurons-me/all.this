use std::env;

pub fn env_u32(name: &str, default: u32) -> u32 {
    env::var(name)
        .ok()
        .and_then(|val| val.parse::<u32>().ok())
        .unwrap_or(default)
}

pub fn env_u64(name: &str, default: u64) -> u64 {
    env::var(name)
        .ok()
        .and_then(|val| val.parse::<u64>().ok())
        .unwrap_or(default)
}
