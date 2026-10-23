import { StyleSheet, useColorScheme } from "react-native";
import { useDonnees } from "../donnees/donnees-context";
import { PALETTES, type Couleurs, type NomTheme } from "./couleurs";

export { TOUCHE_MIN, serif, type Couleurs } from "./couleurs";
export {
  COLONNE_LECTURE,
  LARGEUR_LARGE,
  LARGEUR_LECTURE,
  TITRE_DOCUMENT,
  useLarge,
} from "./mise-en-page";

/** Tema em uso: o escolhido nas definições, ou o do sistema. */
export function useTheme(): { nom: NomTheme; couleurs: Couleurs } {
  const systeme = useColorScheme();
  const { preferences } = useDonnees();
  const nom =
    preferences.theme === "systeme" ? (systeme === "dark" ? "sombre" : "clair") : preferences.theme;
  return { nom, couleurs: PALETTES[nom] };
}

/**
 * Cria as folhas de estilo dos dois temas de uma vez e devolve um hook que dá a do tema
 * em uso: `const useStyles = creerStyles((c) => ({ ... }))`.
 */
export function creerStyles<T extends StyleSheet.NamedStyles<T>>(
  fabrique: (couleurs: Couleurs) => T,
): () => T {
  const feuilles: Record<NomTheme, T> = {
    clair: StyleSheet.create(fabrique(PALETTES.clair)),
    sombre: StyleSheet.create(fabrique(PALETTES.sombre)),
  };
  return function useStyles() {
    return feuilles[useTheme().nom];
  };
}

export { ESPACES, RAYONS, BORDURES, LARGEURS, SEUILS } from "./tokens";
export { TYPOGRAPHIE, type VarianteTexte } from "./typographie";
export { useMiseEnPage } from "./mise-en-page";
export { surfaceCarte } from "./surfaces";
