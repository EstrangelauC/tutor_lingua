import { useWindowDimensions, type ViewStyle } from "react-native";

/** Título do separador do browser (o React Navigation põe-no a partir do `title` de cada ecrã). */
export const TITRE_DOCUMENT = "Camille — Oral TCF IRN";

/** A partir desta largura (tablet deitado, computador) a app usa o layout de ecrã largo. */
export const LARGEUR_LARGE = 900;
/** Largura máxima de uma coluna de leitura (listas, definições). */
export const LARGEUR_LECTURE = 760;

export function useLarge(): boolean {
  return useWindowDimensions().width >= LARGEUR_LARGE;
}

/** Centra o conteúdo de um ScrollView e limita-lhe a largura em ecrãs largos. */
export const COLONNE_LECTURE: ViewStyle = {
  width: "100%",
  maxWidth: LARGEUR_LECTURE,
  alignSelf: "center",
};
