import React from "react";
import "./index.css";

// NOTE:
// This template is intentionally minimal.
// Users can replace <Welcome /> with their own routes/namespaces/app shell.

// Prefer importing from `this.gui` so consumers start in the same semantics
// they will use in the final product.
import {
  Theme,
  Box,
  Typography,
  Button,
  ThemeModeToggle,
} from "this.gui";

function Welcome() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 880,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: { xs: 3, sm: 5 },
          boxShadow: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top-right quick action */}
        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
          <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            component="img"
            src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1760629119/this.gui.neurons.me_mkapde.png"
            alt="this.GUI"
            sx={{ width: 56, height: 56, objectFit: "contain" }}
          />
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              this.GUI
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Starter app created with <code>npx this.gui &lt;AppName&gt;</code>
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, opacity: 0.92, textAlign: "left" }}>
          This template is a clean baseline. Swap this view for your routes, namespaces, and
          UI shell.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            mt: 3,
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <Button
            variant="contained"
            onClick={() => console.log("[this.GUI] Ready.")}
          >
            Start building
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              window.open("https://www.npmjs.com/package/this.gui", "_blank")
            }
          >
            View npm
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Tip: Keep this file minimal. Create your real app entry under <code>src/routes</code>
            or <code>src/app</code>, then render it here.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Theme initialMode="dark">
      <Welcome />
    </Theme>
  );
}
