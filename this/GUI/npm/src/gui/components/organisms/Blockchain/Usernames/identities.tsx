import React, { useMemo } from "react";
import Box from "@/gui/atoms/Box/Box";
import { useGuiTheme } from "@/gui/hooks";

type DerivationRow = {
  step: string;
  domain: "client" | "wire" | "ledger" | "union";
  input: string;
  op: string;
  output: string;
  storedWhere: string;
  matchWhen: string;
  rotates: string;
};

function Badge({ tone, children }: { tone: "neutral" | "info" | "success" | "warn" | "error"; children: React.ReactNode }) {
  const theme = useGuiTheme();
  const bg =
    tone === "success"
      ? "rgba(0, 200, 120, 0.18)"
      : tone === "warn"
      ? "rgba(255, 200, 0, 0.18)"
      : tone === "error"
      ? "rgba(255, 60, 60, 0.18)"
      : tone === "info"
      ? "rgba(0, 180, 255, 0.14)"
      : theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.05)";

  const fg =
    tone === "success"
      ? theme.palette.success.main
      : tone === "warn"
      ? theme.palette.warning.main
      : tone === "error"
      ? theme.palette.error.main
      : tone === "info"
      ? theme.palette.info.main
      : theme.palette.text.secondary;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 0.8,
        py: 0.25,
        borderRadius: "999px",
        fontSize: "10px",
        lineHeight: "12px",
        fontWeight: 800,
        letterSpacing: 0.2,
        background: bg,
        color: fg,
        border: `1px solid ${theme.palette.divider}`,
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}

function DomainBadge(domain: "client" | "wire" | "ledger" | "union") {
  switch (domain) {
    case "client":
      return <Badge tone="neutral">CLIENT</Badge>;
    case "wire":
      return <Badge tone="info">WIRE</Badge>;
    case "ledger":
      return <Badge tone="success">LEDGER</Badge>;
    case "union":
      return <Badge tone="warn">UNION</Badge>;
  }
}

function Cell({ children, mono, dim }: { children: React.ReactNode; mono?: boolean; dim?: boolean }) {
  const theme = useGuiTheme();
  return (
    <Box
      sx={{
        px: 1,
        py: 0.75,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontSize: "11px",
        lineHeight: "14px",
        color: dim ? theme.palette.text.secondary : theme.palette.text.primary,
        fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" : "inherit",
        wordBreak: "break-word",
      }}
    >
      {children}
    </Box>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  const theme = useGuiTheme();
  return (
    <Box
      sx={{
        px: 1,
        py: 0.6,
        fontSize: "10px",
        lineHeight: "12px",
        fontWeight: 900,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: theme.palette.text.secondary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        userSelect: "none",
      }}
    >
      {children}
    </Box>
  );
}

export type IdentityDerivationTableProps = {
  username?: string;
  secret?: string;
  /** Optional: if you already computed the local identityRoot (e.g., hash(username+secret)). */
  identityRoot?: string;
  /** Optional: the ledger/host (chainId). */
  chainId?: string;
  /** Optional: what the server has stored for this username (e.g., users.identityHash). */
  serverIdentityHash?: string;
  /** Optional: if you are in face flow, show whether the face is enrolled or not. */
  faceStatus?: "idle" | "checking" | "not_enrolled" | "enrolled_match" | "enrolled_no_match";
};

/**
 * identities.tsx
 *
 * Visual table for the AUTH + derivation chain into the blockchain identity.
 *
 * This does not perform crypto; it's purely a UI visualization.
 */
export default function IdentityDerivationTable(props: IdentityDerivationTableProps) {
  const theme = useGuiTheme();
  const {
    username = "",
    secret = "",
    identityRoot,
    chainId = "(host/chain)",
    serverIdentityHash,
    faceStatus = "idle",
  } = props;

  const usernameNorm = String(username || "").trim().toLowerCase();
  const hasUsername = Boolean(usernameNorm);
  const hasSecret = Boolean(secret);

  // The UI idea: username+secret => k_unlock / identityRoot-ish
  // For display, we treat identityRoot as the derived value.
  const localDerived = String(identityRoot || "").trim();

  const usernameExistsOnServer = Boolean(String(serverIdentityHash || "").trim());
  const secretMatchesServer = useMemo(() => {
    if (!usernameExistsOnServer) return null; // unknown
    if (!localDerived) return false;
    return String(serverIdentityHash).trim() === localDerived;
  }, [usernameExistsOnServer, serverIdentityHash, localDerived]);

  const faceBadge = useMemo(() => {
    if (faceStatus === "checking") return <Badge tone="info">FACE • VERIFYING</Badge>;
    if (faceStatus === "not_enrolled") return <Badge tone="warn">FACE • NOT ENROLLED</Badge>;
    if (faceStatus === "enrolled_match") return <Badge tone="success">FACE • MATCH</Badge>;
    if (faceStatus === "enrolled_no_match") return <Badge tone="error">FACE • NO MATCH</Badge>;
    return <Badge tone="neutral">FACE • IDLE</Badge>;
  }, [faceStatus]);

  const authBadge = useMemo(() => {
    if (!hasUsername) return <Badge tone="neutral">AUTH • ENTER USERNAME</Badge>;
    if (!hasSecret) return <Badge tone="neutral">AUTH • ENTER SECRET</Badge>;

    if (!usernameExistsOnServer) {
      // Available-to-claim scenario
      return <Badge tone="info">AUTH • AVAILABLE TO CLAIM</Badge>;
    }

    if (secretMatchesServer === true) return <Badge tone="success">AUTH • SECRET MATCH</Badge>;
    if (secretMatchesServer === false) return <Badge tone="error">AUTH • SECRET MISMATCH</Badge>;

    return <Badge tone="neutral">AUTH • UNKNOWN</Badge>;
  }, [hasUsername, hasSecret, usernameExistsOnServer, secretMatchesServer]);

  // New lane cards section
  const laneCards = (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        display: "flex",
        gap: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === "dark" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.85)",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          flex: "1 1 160px",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          p: 1,
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          fontSize: "11px",
          lineHeight: 1.3,
        }}
      >
        <Box sx={{ fontWeight: 900, mb: 0.5, letterSpacing: 0.4 }}>CLIENT</Box>
        <Box>• Local key derivation & secrets</Box>
        <Box>• Unlock stable anchors</Box>
        <Box>• Key rotations & signing</Box>
      </Box>
      <Box
        sx={{
          flex: "1 1 160px",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          p: 1,
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          fontSize: "11px",
          lineHeight: 1.3,
        }}
      >
        <Box sx={{ fontWeight: 900, mb: 0.5, letterSpacing: 0.4 }}>WIRE</Box>
        <Box>• Encrypted data in transit</Box>
        <Box>• Challenges and signatures</Box>
        <Box>• Temporary proofs</Box>
      </Box>
      <Box
        sx={{
          flex: "1 1 160px",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          p: 1,
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          fontSize: "11px",
          lineHeight: 1.3,
        }}
      >
        <Box sx={{ fontWeight: 900, mb: 0.5, letterSpacing: 0.4 }}>LEDGER</Box>
        <Box>• Server & blockchain state</Box>
        <Box>• Stored anchors & mappings</Box>
        <Box>• Public keys & registry</Box>
      </Box>
      <Box
        sx={{
          flex: "0 0 200px",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          p: 1,
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          fontSize: "10px",
          lineHeight: 1.3,
          fontWeight: 700,
          textAlign: "center",
          alignSelf: "center",
          letterSpacing: 0.3,
        }}
      >
        UNION<br />
        <Box sx={{ fontWeight: 400, mt: 0.5, fontSize: "9px", lineHeight: 1.2 }}>
          where client proofs meet ledger state (binding, pubkeys, signatures, challenges)
        </Box>
      </Box>
    </Box>
  );

  const rows: DerivationRow[] = useMemo(() => {
    const u = usernameNorm || "(username)";

    return [
      {
        step: "L0",
        domain: "client",
        input: "username + secret",
        op: "KDF / derive",
        output: "k_unlock (or identityRoot fingerprint)",
        storedWhere: "client only (derived)",
        matchWhen: "—",
        rotates: "username ✅, secret ✅",
      },
      {
        step: "L1",
        domain: "client",
        input: "k_unlock + encNoise",
        op: "decrypt",
        output: "identityNoise (stable anchor seed)",
        storedWhere: "encNoise in DB; identityNoise stays client",
        matchWhen: "decrypt succeeds",
        rotates: "secret ✅ (re-encrypt encNoise)",
      },
      {
        step: "L2",
        domain: "ledger",
        input: "identityNoise",
        op: "hash",
        output: "anchorId = H(identityNoise)",
        storedWhere: "server DB + chain blocks",
        matchWhen: "anchorId equals server anchorId for this username",
        rotates: "no ❌ (stable)",
      },
      {
        step: "L3",
        domain: "client",
        input: "identityNoise + chainId",
        op: "KDF",
        output: "sk_chain (signing key for this chain)",
        storedWhere: "client only (derived)",
        matchWhen: "—",
        rotates: "key rotation ✅ (derive v2 / counter)",
      },
      {
        step: "L4",
        domain: "union",
        input: "sk_chain",
        op: "pubkey",
        output: "pk_chain",
        storedWhere: "server DB (users.publicKey) / chain registry",
        matchWhen: "pk_chain equals stored publicKey (or accepted rotation)",
        rotates: "✅ (with signed rotation)",
      },
      {
        step: "L5",
        domain: "union",
        input: "challenge + sk_chain",
        op: "sign",
        output: "sig",
        storedWhere: "wire only",
        matchWhen: "Verify(pk_chain, challenge, sig) == true",
        rotates: "—",
      },
      {
        step: "L6",
        domain: "union",
        input: `username '${u}'`,
        op: "bind mapping",
        output: "username -> anchorId",
        storedWhere: "server DB (usernames/users)",
        matchWhen: "signature from anchor approves binding",
        rotates: "username ✅ (transfer)",
      },
    ];
  }, [usernameNorm]);

  const derivedPreview = useMemo(() => {
    if (!localDerived) return "(waiting for local identityRoot / derived hash)";
    if (localDerived.length <= 14) return localDerived;
    return `${localDerived.slice(0, 8)}…${localDerived.slice(-6)}`;
  }, [localDerived]);

  const serverPreview = useMemo(() => {
    const s = String(serverIdentityHash || "").trim();
    if (!s) return "(server: none)";
    if (s.length <= 14) return s;
    return `${s.slice(0, 8)}…${s.slice(-6)}`;
  }, [serverIdentityHash]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 980,
        mx: "auto",
        mt: 2,
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        background: theme.palette.mode === "dark" ? theme.palette.section.default : theme.palette.section.subtle,
      }}
    >
      <Box
        sx={{
          px: 1.25,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === "dark" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.55)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 0 }}>
          <Box sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: 0.2, color: theme.palette.text.primary }}>
            Blockchain Auth • Derivation Chain
          </Box>
          <Box
            sx={{
              fontSize: "11px",
              color: theme.palette.text.secondary,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={`${usernameNorm || ""}`}
          >
            {usernameNorm ? `@${usernameNorm}` : "@…"} • chain: {chainId}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {authBadge}
          {faceBadge}
        </Box>
      </Box>

      {laneCards}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "64px 92px 1.3fr 1fr 1.4fr 1.2fr 1.4fr 0.9fr",
        }}
      >
        <HeaderCell>Step</HeaderCell>
        <HeaderCell>Domain</HeaderCell>
        <HeaderCell>Input</HeaderCell>
        <HeaderCell>Op</HeaderCell>
        <HeaderCell>Output</HeaderCell>
        <HeaderCell>Stored where</HeaderCell>
        <HeaderCell>Match when</HeaderCell>
        <HeaderCell>Rotates</HeaderCell>

        {rows.map((r) => (
          <React.Fragment key={r.step}>
            <Cell mono dim>
              {r.step}
            </Cell>
            <Cell>{DomainBadge(r.domain)}</Cell>
            <Cell mono>{r.input}</Cell>
            <Cell mono dim>
              {r.op}
            </Cell>
            <Cell mono>{r.output}</Cell>
            <Cell dim>{r.storedWhere}</Cell>
            <Cell dim>{r.matchWhen}</Cell>
            <Cell dim>{r.rotates}</Cell>
          </React.Fragment>
        ))}
      </Box>

      <Box
        sx={{
          px: 1.25,
          py: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        }}
      >
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "12px",
            p: 1,
            background: theme.palette.mode === "dark" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.6)",
          }}
        >
          <Box sx={{ fontSize: "10px", letterSpacing: 0.4, fontWeight: 900, textTransform: "uppercase", color: theme.palette.text.secondary }}>
            Local (derived)
          </Box>
          <Box
            sx={{
              mt: 0.35,
              fontSize: "12px",
              fontWeight: 900,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              color: theme.palette.text.primary,
            }}
            title={localDerived || ""}
          >
            {hasUsername && hasSecret ? derivedPreview : "(enter username + secret)"}
          </Box>
          <Box sx={{ mt: 0.35, fontSize: "11px", color: theme.palette.text.secondary }}>
            This represents your <b>k_unlock</b> / <b>identityRoot fingerprint</b> used to unlock the stable anchor.
          </Box>
        </Box>

        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "12px",
            p: 1,
            background: theme.palette.mode === "dark" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.6)",
          }}
        >
          <Box sx={{ fontSize: "10px", letterSpacing: 0.4, fontWeight: 900, textTransform: "uppercase", color: theme.palette.text.secondary }}>
            Server (claimed)
          </Box>
          <Box
            sx={{
              mt: 0.35,
              fontSize: "12px",
              fontWeight: 900,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              color: theme.palette.text.primary,
            }}
            title={String(serverIdentityHash || "").trim()}
          >
            {usernameExistsOnServer ? serverPreview : "(username not claimed)"}
          </Box>
          <Box sx={{ mt: 0.35, fontSize: "11px", color: theme.palette.text.secondary }}>
            What the ledger has stored for <b>@{usernameNorm || "username"}</b> (e.g., users.identityHash / anchor mapping).
          </Box>
        </Box>

        <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Box sx={{ fontSize: "11px", color: theme.palette.text.secondary }}>
            Union happens when a client proof (derived key or signature) is accepted against ledger state (stored mapping / public key).
          </Box>
          <Box>
            {usernameExistsOnServer ? (
              secretMatchesServer ? (
                <Badge tone="success">LOCAL == SERVER</Badge>
              ) : (
                <Badge tone="error">LOCAL ≠ SERVER</Badge>
              )
            ) : (
              <Badge tone="info">NO SERVER CLAIM</Badge>
            )}
          </Box>
        </Box>
      </Box>

      {/*
        Parts table (conceptual): breaks down what belongs to username vs blockchain,
        and where the binding (“union”) happens.
      */}
      <Box
        sx={{
          mt: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === "dark" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.45)",
        }}
      >
        <Box
          sx={{
            px: 1.25,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2, minWidth: 0 }}>
            <Box sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: 0.2, color: theme.palette.text.primary }}>
              Parts • Username × Blockchain
            </Box>
            <Box sx={{ fontSize: "11px", color: theme.palette.text.secondary }}>
              What is mutable vs stable, and what each side must store.
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            {DomainBadge("client")}
            {DomainBadge("ledger")}
            {DomainBadge("union")}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "160px 1fr 1fr 1fr",
          }}
        >
          <HeaderCell>Part</HeaderCell>
          <HeaderCell>Username side</HeaderCell>
          <HeaderCell>Blockchain side</HeaderCell>
          <HeaderCell>Union / Binding</HeaderCell>

          <Cell mono dim>
            alias
          </Cell>
          <Cell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Badge tone="neutral">mutable</Badge>
              <span>@{usernameNorm || "(username)"}</span>
            </Box>
          </Cell>
          <Cell dim>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Badge tone="success">stored</Badge>
              <span>users.username</span>
            </Box>
          </Cell>
          <Cell dim>
            Transfer requires proof from the anchor (signature) to rebind to a new alias.
          </Cell>

          <Cell mono dim>
            secret
          </Cell>
          <Cell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Badge tone="neutral">in head</Badge>
              <span>(never stored)</span>
            </Box>
          </Cell>
          <Cell dim>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Badge tone="success">never</Badge>
              <span>no plaintext secret</span>
            </Box>
          </Cell>
          <Cell dim>
            Used to derive keys and produce signatures; ledger only verifies.
          </Cell>

          <Cell mono dim>
            k_unlock
          </Cell>
          <Cell mono>
            {hasUsername && hasSecret ? derivedPreview : "(derive from username+secret)"}
          </Cell>
          <Cell dim>
            Not stored (ledger only keeps the anchor mapping / public key).
          </Cell>
          <Cell dim>
            Must reproduce the same proof that matches ledger state.
          </Cell>

          <Cell mono dim>
            identityNoise
          </Cell>
          <Cell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Badge tone="neutral">stable</Badge>
              <span>root seed (client)</span>
            </Box>
          </Cell>
          <Cell dim>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Badge tone="success">stored</Badge>
              <span>anchorId = H(noise)</span>
            </Box>
          </Cell>
          <Cell dim>
            Binding happens by proving you control the noise-derived signing key.
          </Cell>

          <Cell mono dim>
            public key
          </Cell>
          <Cell dim>
            Derived from noise/chain (never needs to be secret).
          </Cell>
          <Cell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Badge tone="success">stored</Badge>
              <span>users.publicKey</span>
            </Box>
          </Cell>
          <Cell dim>
            Ledger verifies signatures; rotations require signed updates.
          </Cell>

          <Cell mono dim>
            face template
          </Cell>
          <Cell dim>
            Captured locally; only a template vector should be transmitted.
          </Cell>
          <Cell dim>
            Stored as templateHash + encrypted template (optional), linked to identityHash.
          </Cell>
          <Cell dim>
            Face check gates claiming / login UX, but the anchor proof is the real membership.
          </Cell>
        </Box>

        <Box
          sx={{
            px: 1.25,
            py: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ fontSize: "11px", color: theme.palette.text.secondary }}>
            Quick mental model: <b>username</b> is the label, <b>blockchain</b> stores the mapping, and <b>union</b> is the signature-proof that binds them.
          </Box>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            <Badge tone="neutral">mutable alias</Badge>
            <Badge tone="warn">union = proof</Badge>
            <Badge tone="success">stable anchor</Badge>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
