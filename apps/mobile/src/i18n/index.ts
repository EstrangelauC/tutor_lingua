import { Platform, type TextStyle, type ViewStyle } from "react-native";
import { useDonnees } from "../donnees/donnees-context";
import { serif } from "../theme/couleurs";
import { estRtl, localeIntl, type LangueInterface } from "./langues";
import { TEXTES, type Textes } from "./textes";

export { NOMS_LANGUES, estRtl, type LangueInterface } from "./langues";
export type { Textes };

export interface I18n {
  langue: LangueInterface;
  t: Textes;
  rtl: boolean;
  /** Para o Intl (datas). */
  locale: string;
}

/** Textos e direção da língua da interface escolhida nas definições. */
export function useI18n(): I18n {
  const { preferences } = useDonnees();
  const langue = preferences.langueInterface;
  return { langue, t: TEXTES[langue], rtl: estRtl(langue), locale: localeIntl(langue) };
}

/**
 * Direção do layout de um ecrã. No Android e no iOS aplica-se a cada ecrã (sem reiniciar a
 * app, ao contrário do I18nManager). Na web vem do atributo dir do <html>.
 */
export function styleDirection(rtl: boolean): ViewStyle | undefined {
  return Platform.OS === "web" ? undefined : { direction: rtl ? "rtl" : "ltr" };
}

/** Texto numa língua concreta (a do feedback, por exemplo), seja qual for a da interface. */
export function styleTexte(rtl: boolean): TextStyle {
  return { writingDirection: rtl ? "rtl" : "ltr", textAlign: rtl ? "right" : "left" };
}

/** Francês: sempre da esquerda para a direita e em serifa, mesmo com a interface em árabe. */
export const FRANCAIS: TextStyle = { fontFamily: serif, ...styleTexte(false) };

/** «13» e «out.» para a lista do histórico. */
export function jourEtMois(date: string, locale: string): { jour: string; mois: string } {
  const d = new Date(date);
  return {
    jour: new Intl.DateTimeFormat(locale, { day: "numeric" }).format(d),
    mois: new Intl.DateTimeFormat(locale, { month: "short" }).format(d),
  };
}

/** «13 out. 2026». */
export function dateCourte(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
