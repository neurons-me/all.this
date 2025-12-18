import React from "react";
export type ConnectionStatus = 'idle' | 'connecting' | 'online' | 'offline' | 'declined';
export type UsernameStatus = 'idle' | 'checking' | 'exists' | 'available' | 'error';
export function normalizeBlockchain(raw: string): string {
  return raw.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}
export function useBlockchainConnection(params: {
  blockchain: string;
  username: string;
  me: any;
  debouncePingMs?: number;
  debounceUserMs?: number;
}): {
  blockchainHost: string;
  blockchainBaseUrl: string;
  connectionStatus: ConnectionStatus;
  usernameStatus: UsernameStatus;
} {
  const {
    blockchain,
    username,
    debouncePingMs = 400,
    debounceUserMs = 350,
  } = params;
  const blockchainHost = normalizeBlockchain(blockchain);
  const blockchainBaseUrl = `http://${blockchainHost}`;
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('idle');
  const [usernameStatus, setUsernameStatus] = React.useState<UsernameStatus>('idle');
  React.useEffect(() => {
    if (!blockchainHost) {
      setConnectionStatus('idle');
      return;
    }
    setConnectionStatus('connecting');
    const handle = setTimeout(() => {
      fetch(`${blockchainBaseUrl}/`)
        .then(res => {
          if (res.ok) setConnectionStatus('online');
          else setConnectionStatus('offline');
        })
        .catch(err => {
          const msg = err.message.toLowerCase();
          if (msg.includes('cors') || msg.includes('failed to fetch')) setConnectionStatus('declined');
          else setConnectionStatus('offline');
        });
    }, debouncePingMs);
    return () => clearTimeout(handle);
  }, [blockchainHost, blockchainBaseUrl, debouncePingMs]);
  React.useEffect(() => {
    if (connectionStatus !== 'online' || !username) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    // Try me['@'](username) to ignore validation errors while typing
    try {
      params.me['@'](username);
    } catch {
      // ignore
    }

    const handle = setTimeout(() => {
      fetch(`${blockchainBaseUrl}/users/${username}`)
        .then(res => {
          if (res.status === 200) setUsernameStatus('exists');
          else if (res.status === 404) setUsernameStatus('available');
          else setUsernameStatus('error');
        })
        .catch(() => setUsernameStatus('error'));
    }, debounceUserMs);

    return () => clearTimeout(handle);
  }, [connectionStatus, username, blockchainBaseUrl, debounceUserMs, params.me]);
  return {
    blockchainHost,
    blockchainBaseUrl,
    connectionStatus,
    usernameStatus,
  };
}
