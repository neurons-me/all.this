import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Triad from "../Triad";
import IconButton from "@mui/material/IconButton";
import Icon from "@/gui/Theme/Icon/Icon";
/**
 * These stories focus on two things:
 * 1) Triad UI states (online/offline/username available/exists) without needing a real ledger.
 * 2) The core mental model you described: ME is a short-term thought machine.
 *    - Everything creates a Thought.
 *    - shortTermMemory is bounded (ring-buffer).
 *    - Only when you "cleak" do you persist.
 */
const meta: Meta<typeof Triad> = {
  title: "Identity Noise/Triad/me",
  component: Triad,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Triad>;
// ------------------------------------------------------------
// Triad stories
// ------------------------------------------------------------
export const Default: Story = {
  name: "Default (blockchain input collapsed)",
  args: {},
};

export const WithBlockchainInputOpen: Story = {
  name: "Blockchain input open",
  render: () => {
    return <Triad />;
  },
};

export const OfflineBlockchain: Story = {
  name: "Offline blockchain (simulated)",
  render: () => (
    <WithFetchMock mode="offline">
      <Triad />
    </WithFetchMock>
  ),
};

export const OnlineBlockchainUsernameAvailable: Story = {
  name: "Online blockchain + username available (simulated)",
  render: () => (
    <WithFetchMock mode="available">
      <Triad />
    </WithFetchMock>
  ),
};

export const OnlineBlockchainUsernameExists: Story = {
  name: "Online blockchain + username exists (simulated)",
  render: () => (
    <WithFetchMock mode="exists">
      <Triad />
    </WithFetchMock>
  ),
};

/**
 * Minimal fetch mock for Triad's endpoints:
 *  - GET http://<host>/
 *  - GET http://<host>/users/<username>
 */
function WithFetchMock({
  mode,
  children,
}: {
  mode: "offline" | "available" | "exists";
  children: React.ReactNode;
}) {
  const originalFetch = React.useRef<typeof fetch | null>(null);
  React.useEffect(() => {
    originalFetch.current = globalThis.fetch;
    globalThis.fetch = (async (input: any, init?: any) => {
      const url = String(typeof input === "string" ? input : input?.url ?? "");
      if (mode === "offline") {
        return Promise.reject(new TypeError("Failed to fetch"));
      }
      // Root ping
      if (url.endsWith("/")) {
        return new Response("ok", { status: 200 });
      }
      // Username lookup
      const m = url.match(/\/users\/([^/?#]+)/);
      if (m) {
        if (mode === "exists") return new Response("exists", { status: 200 });
        if (mode === "available") return new Response("not found", { status: 404 });
      }

      return originalFetch.current!(input, init);
    }) as any;
    return () => {
      if (originalFetch.current) globalThis.fetch = originalFetch.current;
    };
  }, [mode]);
  return <>{children}</>;
}

// ------------------------------------------------------------
// ME thought model story (no Triad dependency)
// ------------------------------------------------------------
export const ThoughtModel_RingBufferAndCleak: Story = {
  name: "ME thought model: ring-buffer + cleak concept (explain)",
  render: () => <ThoughtModelWithInfoCorner />, // purely explanatory + simulated
  parameters: {
    layout: "padded",
  },
};

function ThoughtModelWithInfoCorner() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {open && (
          <div
            style={{
              maxWidth: 520,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(127,127,127,0.35)",
              background: "rgba(0,0,0,0.04)",
              backdropFilter: "blur(6px)",
              fontSize: 12,
              lineHeight: 1.35,
            }}
          >
            <div style={{ whiteSpace: "pre-wrap" }}>
              {"Your idea: everything creates a Thought and goes into shortTermMemory. We don't worry about overflow because STM is a fixed-size ring buffer. If you never \"cleak\", the thoughts eventually fall out of STM. When you cleak, you persist the current state / snapshot elsewhere (ledger, disk, chain, etc.)."}
            </div>
          </div>
        )}

        <IconButton
          aria-label={open ? "Hide info" : "Show info"}
          onClick={() => setOpen((v) => !v)}
          size="small"
          sx={{
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.secondary",
            boxShadow: 1,
            "&:hover": {
              bgcolor: "background.nav",
              color: "text.primary",
            },
          }}
        >
          <Icon name={open ? "info" : "info"} fontSize={18} />
        </IconButton>
      </div>

      <ThoughtModelDemo />
    </div>
  );
}

/**
 * This is a UI-less demo of the mental model:
 * - Every action yields a Thought
 * - shortTermMemory is bounded (ring buffer)
 * - selecting "cleak" copies current STM to persisted storage
 *
 * This does NOT import the ME runtime; it's a storybook explainer.
 * (Keeps story stable even if ME typing/runtime changes.)
 */
function ThoughtModelDemo() {
  type Thought = {
    id: number;
    path: string;
    operator: string | null;
    expression: any;
    timestamp: number;
  };
  const MAX = 12;
  const [stm, setStm] = React.useState<Thought[]>([]);
  const [persisted, setPersisted] = React.useState<Thought[][]>([]);
  const [counter, setCounter] = React.useState(0);
  const pushThought = React.useCallback((t: Omit<Thought, "id" | "timestamp">) => {
    setStm((prev) => {
      const next: Thought[] = [
        ...prev,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          timestamp: Date.now(),
          ...t,
        },
      ];
      // ring buffer
      return next.length <= MAX ? next : next.slice(next.length - MAX);
    });
  }, []);

  const fakeOps = React.useMemo(
    () => [
      () => pushThought({ path: "", operator: "@", expression: "jabellae" }),
      () => pushThought({ path: "", operator: "_", expression: "••••" }),
      () => pushThought({ path: "profile.name", operator: null, expression: "Abella" }),
      () => pushThought({ path: "wallet.income", operator: null, expression: 1000 }),
      () => pushThought({ path: "wallet.expenses.rent", operator: null, expression: 500 }),
      () => pushThought({ path: "wallet.net", operator: "=", expression: "wallet.income - wallet.expenses.rent" }),
      () => pushThought({ path: "wallet.hidden.notes", operator: "-", expression: "-" }),
      () => pushThought({ path: "", operator: "~", expression: "noise" }),
    ],
    [pushThought]
  );

  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
      <h3 style={{ marginTop: 0 }}>ME thought model (concept)</h3>
      <p style={{ maxWidth: 860, lineHeight: 1.35, opacity: 0.9 }}>
        <b>Everything creates a Thought</b> and goes into <b>ShortTermMemory</b>. We don't worry about overflow
        because STM is a <b>fixed-size ring buffer</b>. If you never "cleak", the thoughts eventually fall out of STM.
        When you <b>cleak</b>, you persist the current state / snapshot elsewhere (ledger, disk, chain, etc.).
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <button
          onClick={() => {
            const op = fakeOps[counter % fakeOps.length];
            op();
            setCounter((c) => c + 1);
          }}
        >
          Push Thought
        </button>
        <button
          onClick={() => {
            setPersisted((p) => [...p, stm]);
          }}
          disabled={stm.length === 0}
        >
          Cleak (persist snapshot)
        </button>
        <button
          onClick={() => {
            setStm([]);
          }}
        >
          Drop STM (simulate losing memory)
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 360, flex: 1 }}>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>
            STM(ShortTermMemory) (max {MAX}) — current size: {stm.length}
          </div>
          <div style={{ border: "1px solid rgba(127,127,127,0.35)", borderRadius: 10, padding: 10 }}>
            {stm.length === 0 ? (
              <div style={{ opacity: 0.7 }}>No thoughts yet.</div>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {stm.map((t) => (
                  <li key={t.id} style={{ marginBottom: 6 }}>
                    <span style={{ opacity: 0.85 }}>
                      {new Date(t.timestamp).toLocaleTimeString()} · {t.path || "<root>"} · {t.operator ?? "∅"} ·
                    </span>{" "}
                    <span style={{ opacity: 1 }}>{String(t.expression)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div style={{ minWidth: 360, flex: 1 }}>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>persisted snapshots (Cleaks): {persisted.length}</div>
          <div style={{ border: "1px solid rgba(127,127,127,0.35)", borderRadius: 10, padding: 10 }}>
            {persisted.length === 0 ? (
              <div style={{ opacity: 0.7 }}>No cleaks yet.</div>
            ) : (
              persisted
                .slice()
                .reverse()
                .map((snap, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ marginBottom: 4, opacity: 0.85 }}>snapshot #{persisted.length - i} (size {snap.length})</div>
                    <div style={{ opacity: 0.9, fontSize: 12 }}>
                      {snap.map((t) => `${t.path || "<root>"}${t.operator ? `:${t.operator}` : ""}`).join(" · ")}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, maxWidth: 860, lineHeight: 1.35, opacity: 0.9 }}>
        <b>Key invariant:</b> the runtime can be noisy and ephemeral; the <b>ledger persistence</b> should only happen on a
        deliberate act (Cleak) and should serialize a stable representation (thoughts, encrypted branches, indexes, etc.).
      </div>
    </div>
  );
}
