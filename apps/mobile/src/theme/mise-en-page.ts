import { useWindowDimensions, type ViewStyle } from "react-native";
import { ESPACES, LARGEURS, SEUILS } from "./tokens";

export const TITRE_DOCUMENT = "Camille — Oral TCF IRN";
/** Compatibilité: ne change pas le seuil de navigation pendant une session. */
export const LARGEUR_LARGE = SEUILS.navigationLarge;
export const LARGEUR_LECTURE = LARGEURS.lecture;
export function useLarge(): boolean {
  return useWindowDimensions().width >= LARGEUR_LARGE;
}
export const COLONNE_LECTURE: ViewStyle = {
  width: "100%",
  maxWidth: LARGEUR_LECTURE,
  alignSelf: "center",
};
export function useMiseEnPage() {
  const { width } = useWindowDimensions();
  const format =
    width < SEUILS.mobileGrand
      ? "compact"
      : width < SEUILS.tablette
        ? "mobile"
        : width < SEUILS.desktop
          ? "tablette"
          : "desktop";
  const marge = format === "compact" ? ESPACES.lg : format === "mobile" ? ESPACES.xl : ESPACES.xxl;
  const contenu: ViewStyle = {
    ...COLONNE_LECTURE,
    maxWidth: width >= SEUILS.navigationLarge ? LARGEURS.contenu : LARGEUR_LECTURE,
    padding: marge,
    gap: ESPACES.xl,
  };
  return { format, marge, contenu };
}
