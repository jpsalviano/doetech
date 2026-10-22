import { createConfig } from "@gluestack-ui/themed";

export const config = createConfig({
  aliases: {},
  tokens: {
    colors: {
      primary: {
        50: "#e3f2f9",
        100: "#c5e4f3",
        200: "#a2d4ec",
        300: "#7ac1e4",
        400: "#47a9da",
        500: "#0088cc",
        600: "#007ab8",
        700: "#006ba1",
        800: "#005885",
        900: "#003f5e",
      },
      secondary: {
        500: "#F59E0B",
      },
      background: {
        light: "#FFFFFF",
        dark: "#121212",
      },
      text: {
        light: "#000000",
        dark: "#FFFFFF",
      },
    },
    space: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSizes: {
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
    },
    radii: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
  },
  themes: {
    light: {
      colors: {
        background: "$background.light",
        text: "$text.light",
      },
    },
    dark: {
      colors: {
        background: "$background.dark",
        text: "$text.dark",
      },
    },
  },
});
