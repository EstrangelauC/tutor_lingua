import { Platform } from "react-native";

/** Cores do design. `surPlein`: texto e ícones sobre fundos cheios (azul, laranja, tinta). */
const clair = {
  fond: "#F5F6FA",
  surface: "#FFFFFF",
  releve: "#FFFFFF",
  encre: "#151A2D",
  encre2: "#4A5170",
  encre3: "#646B87",
  ligne: "#DCE0EB",
  discret: "#EDEFF6",
  bleu: "#2747C4",
  bleuDoux: "#E6EBFB",
  bleuEncre: "#1F3AA3",
  bleuTrait: "#8EA2EA",
  ecoute: "#B54A17",
  ecouteDoux: "#FCEBDF",
  ecouteEncre: "#8F3A10",
  pense: "#5B6382",
  surPlein: "#FFFFFF",
};

export type Couleurs = typeof clair;

const sombre: Couleurs = {
  fond: "#0E1222",
  surface: "#171C30",
  releve: "#343C5E",
  encre: "#EEF0F7",
  encre2: "#B4BAD0",
  encre3: "#9097B0",
  ligne: "#2C3350",
  discret: "#1D2238",
  bleu: "#9DB1FF",
  bleuDoux: "#1F2A55",
  bleuEncre: "#C3D0FF",
  bleuTrait: "#4A5DA8",
  ecoute: "#FFB38A",
  ecouteDoux: "#3A2418",
  ecouteEncre: "#FFC9AA",
  pense: "#8A92B2",
  surPlein: "#0E1222",
};

export type NomTheme = "clair" | "sombre";

export const PALETTES: Record<NomTheme, Couleurs> = { clair, sombre };

/** Tudo o que é francês aparece em serifa, para se distinguir da língua da interface. */
export const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, 'Times New Roman', serif",
});

/** Alvo de toque mínimo (px). */
export const TOUCHE_MIN = 48;
