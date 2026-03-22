import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#667eea" },
    secondary: { main: "#f5576c" },
    background: {
      default: "#0f0f1e",
      paper: "rgba(26, 26, 46, 0.95)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b8b8d1",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
