import type { ViewStyle } from "react-native";
import type { Couleurs } from "./palettes";
import { BORDURES, ESPACES, RAYONS } from "./tokens";

/** Même surface pour les cartes statiques et les cartes interactives (Pressable). */
export function surfaceCarte(c: Couleurs): ViewStyle {
  return {
    padding: ESPACES.lg,
    gap: ESPACES.md,
    borderRadius: RAYONS.carte,
    borderWidth: BORDURES.fine,
    borderColor: c.ligne,
    backgroundColor: c.surface,
  };
}
