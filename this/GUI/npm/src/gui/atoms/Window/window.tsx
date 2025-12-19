import React, { useEffect, useMemo, useRef, useState } from "react";
import Box from "@/gui/atoms/Box/Box";
import Stack from "@/gui/atoms/Stack/Stack";
import Button from "@/gui/atoms/Button/Button";
import Typography from "@/gui/atoms/Typography/Typography";
import Surface from "@/gui/atoms/Surface/Surface";
import TextField from "@/gui/atoms/TextField/TextField";
// MUI imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Fade from "@mui/material/Fade";
import { useTheme } from "@mui/material/styles";
/**
 * Free-Form Computing Interface — "Uncontained UI"
 * -------------------------------------------------
 * Goals
 *  - No rigid panes. The canvas is the app.
 *  - Spawn dynamic compute nodes anywhere.
 *  - Each node can run small JS snippets in a sandboxed Web Worker.
 *  - Command palette (⌘K / Ctrl+K) to keep flow keyboard-first.
 *  - Minimal, calm visuals; soft physics-like feel.
 *
 * Notes
 *  - Tailwind is available by default in this environment.
 *  - No external libs are required; this is a single-file prototype.
 */
// --- Utility: Create a sandbox worker for safe-ish JS eval (no DOM access) ---
function useWorker() {
  const workerRef = useRef<Worker | null>(null);
  const getWorker = () => {
    if (workerRef.current) return workerRef.current;
    const workerCode = `
      self.onmessage = async (e) => {
        const { id, code } = e.data;
        try {
          // Basic sandbox: no access to self except postMessage; no DOM.
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
          const fn = new AsyncFunction('__post', ` +
            "'use strict';\n" +
            // eslint-disable-next-line
            "const console = {\n" +
            "  log: (...a) => __post({type:'log', data:a}),\n" +
            "  visual: (shape) => __post({type:'visual', data:shape}),\n" +
            "  speak: (msg) => __post({type:'speak', data:msg})\n" +
            "};\n" +
            "return (async () => {\n" +
            "  " +
            "${code}\n" +
            "})()" +
          `);
          let logs = [];
          const __post = (msg) => {
            if (msg.type === 'log') logs.push(msg.data);
            self.postMessage({ id, stream: true, ...msg });
          };
          const result = await fn(__post);
          self.postMessage({ id, ok: true, result, logs });
        } catch (err) {
          self.postMessage({ id, ok: false, error: String(err) });
        }
      };
    `;
    const blob = new Blob([workerCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    workerRef.current = w;
    return w;
  };

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      workerRef.current = null;
    };
  }, []);
  return getWorker;
}

// Types
interface NodeData {
  id: string;
  x: number;
  y: number;
  code: string;
  output: string;
  running: boolean;
}

export default function UncontainedUI() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [grid, setGrid] = useState(true);
  const [hint, setHint] = useState(true);
  const getWorker = useWorker();
  // background pointer position — for subtle parallax sparks
  const [ptr, setPtr] = useState({ x: 0.5, y: 0.5 });
  // Command palette actions
  const actions = useMemo(
    () => [
      { id: "spawn", label: "Spawn compute node", run: () => spawnNode() },
      { id: "grid", label: grid ? "Hide grid" : "Show grid", run: () => setGrid((g) => !g) },
      { id: "clear", label: "Clear all nodes", run: () => setNodes([]) },
    ],
    [grid]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function spawnNode(x?: number, y?: number) {
    const id = Math.random().toString(36).slice(2);
    const nx = x ?? window.innerWidth * (0.35 + Math.random() * 0.3);
    const ny = y ?? window.innerHeight * (0.35 + Math.random() * 0.3);
    const starter = `// async JS — logs show below.\n// Example: generate points on a circle\nconst pts = Array.from({length: 8}, (_,i)=>({\n  x: Math.cos(i/8*2*Math.PI).toFixed(3),\n  y: Math.sin(i/8*2*Math.PI).toFixed(3)\n}));\nconsole.log('pts', pts);\nreturn pts;`;
    setNodes((n) => [
      ...n,
      { id, x: nx, y: ny, code: starter, output: "", running: false },
    ]);
    setHint(false);
  }

  function runNode(node: NodeData) {
    const worker = getWorker();
    const id = node.id + ":" + Date.now();
    setNodes((list) => list.map((n) => (n.id === node.id ? { ...n, running: true, output: "" } : n)));
    const onMessage = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg || typeof msg !== "object") return;
      if (!String(msg.id).startsWith(node.id)) return;
      if (msg.stream && msg.type === "log") {
        setNodes((list) =>
          list.map((n) => (n.id === node.id ? { ...n, output: (n.output || "") + "\n" + JSON.stringify(msg.data) } : n))
        );
        return;
      }
      if (msg.stream && msg.type === 'visual') {
        setNodes((list) =>
          list.map((n) =>
            n.id === node.id
              ? { ...n, output: (n.output || '') + '\n[visual] ' + JSON.stringify(msg.data) }
              : n
          )
        );
        return;
      }
      if (msg.stream && msg.type === 'speak') {
        const utter = new SpeechSynthesisUtterance(String(msg.data));
        window.speechSynthesis.speak(utter);
        setNodes((list) =>
          list.map((n) =>
            n.id === node.id
              ? { ...n, output: (n.output || '') + '\n[speak] ' + JSON.stringify(msg.data) }
              : n
          )
        );
        return;
      }
      if (msg.ok) {
        setNodes((list) =>
          list.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  running: false,
                  output:
                    (n.output ? n.output + "\n\n" : "") +
                    "result => " + JSON.stringify(msg.result, null, 2),
                }
              : n
          )
        );
        worker.removeEventListener("message", onMessage);
      } else {
        setNodes((list) =>
          list.map((n) => (n.id === node.id ? { ...n, running: false, output: "error => " + msg.error } : n))
        );
        worker.removeEventListener("message", onMessage);
      }
    };

    worker.addEventListener("message", onMessage);
    worker.postMessage({ id, code: node.code });
  }

  // Drag logic for nodes (very lightweight)
  function useDrag(nodeId: string) {
    const posRef = useRef<{ dx: number; dy: number } | null>(null);
    const onDown = (e: React.PointerEvent) => {
      const target = (e.currentTarget as HTMLElement).closest('[data-node]') as HTMLElement | null;
      if (!target) return;
      const id = target.dataset.node as string;
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      posRef.current = { dx: e.clientX - node.x, dy: e.clientY - node.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onMove = (e: React.PointerEvent) => {
      if (!posRef.current) return;
      const { dx, dy } = posRef.current;
      setNodes((list) => list.map((n) => (n.id === nodeId ? { ...n, x: e.clientX - dx, y: e.clientY - dy } : n)));
    };

    const onUp = (e: React.PointerEvent) => {
      posRef.current = null;
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    };

    return { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp };
  }

  return (
    <Box
      sx={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", userSelect: "none" }}
      onPointerMove={(e) => setPtr({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })}
    >
      {/* Ambient background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: -20,
          background: grid
            ? `radial-gradient(500px circle at ${ptr.x * 100}% ${ptr.y * 100}%, rgba(0,0,0,0.06), transparent 60%), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`
            : `radial-gradient(600px circle at ${ptr.x * 100}% ${ptr.y * 100}%, rgba(0,0,0,0.075), transparent 55%)`,
          backgroundSize: grid ? "cover, 32px 32px, 32px 32px" : "cover",
          backgroundColor: "#fafafa",
        }}
      />

      {/* Floating help hint */}
      {hint && (
        <Box
          sx={{
            pointerEvents: "none",
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            fontSize: 14,
            color: "text.secondary",
          }}
        >
          <Surface
            variant="outlined"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: "9999px",
              bgcolor: "rgba(255 255 255 / 0.7)",
              px: 3,
              py: 1,
              boxShadow: 1,
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <Box
              component="kbd"
              sx={{
                borderRadius: 1,
                bgcolor: "rgba(0,0,0,0.8)",
                px: 1.5,
                py: 0.5,
                color: "common.white",
                fontSize: 12,
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              ⌘K
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Open command palette
            </Typography>
            <Typography variant="body2" sx={{ mx: 1, color: "text.secondary" }}>
              ·
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Click to spawn a node
            </Typography>
          </Surface>
        </Box>
      )}

      {/* Click-to-spawn layer */}
      <Box
        sx={{ position: "absolute", inset: 0, zIndex: -10 }}
        onDoubleClick={(e) => spawnNode(e.clientX, e.clientY)}
        onClick={(e) => {
          // soft spawn near cursor on click (not double)
          if ((e.target as HTMLElement).closest('[data-node]')) return;
          spawnNode(e.clientX + 16, e.clientY + 16);
        }}
      />

      {/* Nodes */}
      {nodes.map((node) => (
        <NodeView key={node.id} node={node} onRun={() => runNode(node)} updateNode={setNodes} useDrag={useDrag} />
      ))}

      {/* Command palette */}
      {paletteOpen && (
        <Palette actions={actions} onClose={() => setPaletteOpen(false)} />
      )}
    </Box>
  );
}

function NodeView({ node, onRun, updateNode, useDrag }: {
  node: NodeData;
  onRun: () => void;
  updateNode: React.Dispatch<React.SetStateAction<NodeData[]>>;
  useDrag: (id: string) => any;
}) {
  const drag = useDrag(node.id);
  return (
    <Surface
      variant="card"
      sx={{
        position: "absolute",
        maxWidth: 520,
        width: 520,
        borderRadius: 16,
        boxShadow: 3,
        bgcolor: "rgba(255 255 255 / 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,0,0,0.1)",
        transform: `translate(${node.x}px, ${node.y}px)`,
        userSelect: "none",
      }}
      data-node={node.id}
      {...drag}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ px: 3, py: 1.5, cursor: "grab", userSelect: "none" }}
        {...drag}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: node.running ? "success.main" : "grey.400",
              animation: node.running ? "pulse 2s infinite" : "none",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.5 },
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ userSelect: "none" }}>
            compute-node
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ userSelect: "none" }}>
          drag
        </Typography>
      </Stack>
      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          multiline
          minRows={8}
          value={node.code}
          onChange={(e) => updateNode((list) => list.map((n) => (n.id === node.id ? { ...n, code: e.target.value } : n)))}
          sx={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: 13,
            bgcolor: "rgba(255 255 255 / 0.7)",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.300",
            "& textarea": { px: 1.5, py: 1.25 },
          }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
          <Button
            variant="contained"
            onClick={onRun}
            disabled={node.running}
            sx={{ fontSize: 14, px: 2, py: 1 }}
          >
            {node.running ? "Running…" : "Run (worker)"}
          </Button>
          <Button
            variant="text"
            color="inherit"
            onClick={() => updateNode((list) => list.filter((n) => n.id !== node.id))}
            sx={{ fontSize: 14, px: 2, py: 1 }}
          >
            Close
          </Button>
        </Stack>
        <Box
          component="pre"
          sx={{
            mt: 2,
            maxHeight: 224,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            borderRadius: 2,
            bgcolor: "grey.100",
            p: 2,
            fontSize: 13,
            color: "text.primary",
            border: "1px solid",
            borderColor: "grey.300",
            fontFamily: "monospace",
          }}
        >
          {node.output || "// output will appear here"}
        </Box>
      </Box>
    </Surface>
  );
}

function Palette({ actions, onClose }: { actions: { id: string; label: string; run: () => void }[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const theme = useTheme();
  const list = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation and close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        setSelected((s) => Math.min(list.length - 1, s + 1));
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setSelected((s) => Math.max(0, s - 1));
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (list[selected]) {
          list[selected].run();
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line
  }, [onClose, list, selected]);

  // Reset selection on query change
  useEffect(() => {
    setSelected(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth={false}
      maxWidth="sm"
      PaperProps={{
        elevation: 12,
        sx: {
          borderRadius: 12,
          bgcolor: theme.palette.background.paper,
          boxShadow: "0 8px 32px 2px rgba(0,0,0,0.17), 0 1.5px 8px 0px rgba(0,0,0,0.04)",
          top: '10%',
          margin: '0 auto',
          left: 0,
          right: 0,
          position: 'absolute',
          minWidth: 340,
          maxWidth: 420,
          width: '100%',
          transition: "box-shadow 0.3s cubic-bezier(.4,2,.2,1)",
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: theme.palette.mode === "dark"
            ? "rgba(20,20,20,0.7)"
            : "rgba(0,0,0,0.18)",
          backdropFilter: "blur(2px)",
        },
      }}
      TransitionComponent={Fade}
      keepMounted
      aria-labelledby="command-palette"
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        <Box
          sx={{
            position: "relative",
            borderBottom: "1px solid",
            borderColor: theme.palette.divider,
          }}
        >
          <TextField
            inputRef={inputRef}
            autoFocus
            placeholder="Type a command… (spawn, grid, clear)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="standard"
            fullWidth
            sx={{
              px: 2,
              py: 1.4,
              fontSize: 15,
              fontWeight: 500,
              color: "text.primary",
              bgcolor: theme.palette.background.paper,
              "& .MuiInputBase-root": {
                bgcolor: "transparent",
              },
              "& .MuiInputBase-input": {
                fontSize: 15,
                color: "text.primary",
                transition: "box-shadow 0.2s",
                boxShadow: "0 0 0px 0px",
                "&:focus": {
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}44`,
                },
                padding: 0,
                lineHeight: 1.25,
              },
              "& .MuiInput-underline:before": {
                borderBottomColor: "transparent",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: theme.palette.primary.main,
              },
            }}
            inputProps={{
              "aria-label": "Command palette",
            }}
          />
        </Box>
        <List
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            py: 0.5,
            bgcolor: "transparent",
            minWidth: 0,
          }}
          component="nav"
          aria-label="command list"
        >
          {list.length === 0 && (
            <Typography
              sx={{
                px: 2,
                py: 3,
                fontSize: 14,
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              No results
            </Typography>
          )}
          {list.map((a, i) => (
            <ListItemButton
              key={a.id}
              selected={i === selected}
              onClick={() => {
                a.run();
                onClose();
              }}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 1,
                transition: "background 0.15s",
                my: 0.3,
                minHeight: 0,
                bgcolor: i === selected
                  ? (theme.palette.mode === "dark"
                      ? "rgba(90,185,255,0.12)"
                      : "rgba(0,110,255,0.08)")
                  : "transparent",
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
                color: "text.primary",
                outline: i === selected ? `2px solid ${theme.palette.primary.main}44` : undefined,
              }}
              tabIndex={0}
              onFocus={() => setSelected(i)}
              onMouseMove={() => setSelected(i)}
            >
              <ListItemText
                primary={a.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "text.primary",
                  lineHeight: 1.3,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
