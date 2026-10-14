import { Platform } from "react-native";

/** Cores do design (tema claro). O tema escuro chega com o i18n e as definições. */
export const couleurs = {
  fond: "#F5F6FA",
  surface: "#FFFFFF",
  encre: "#151A2D",
  encre2: "#4A5170",
  encre3: "#646B87",
  ligne: "#DCE0EB",
  discret: "#EDEFF6",
  bleu: "#2747C4",
  bleuDoux: "#E6EBFB",
  bleuEncre: "#1F3AA3",
  ecoute: "#B54A17",
  ecouteDoux: "#FCEBDF",
  ecouteEncre: "#8F3A10",
  pense: "#5B6382",
  blanc: "#FFFFFF",
} as const;

/** Tudo o que é francês aparece em serifa, para se distinguir da língua da interface. */
export const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, 'Times New Roman', serif",
});

/** Alvo de toque mínimo (px). */
export const TOUCHE_MIN = 48;
