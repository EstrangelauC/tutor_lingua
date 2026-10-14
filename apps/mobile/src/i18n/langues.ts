import type { LangueAppui } from "@camille/shared";

/**
 * Línguas da interface: as mesmas em que a Camille dá o feedback. Para juntar outra
 * (ucraniano, turco, romeno…), acrescenta-a a LangueAppuiSchema em @camille/shared e cria o
 * dicionário em textes/: o TypeScript diz o que falta.
 */
export type LangueInterface = LangueAppui;

/** Nome de cada língua na própria língua. */
export const NOMS_LANGUES: Record<LangueAppui, string> = {
  "pt-PT": "Português",
  en: "English",
  es: "Español",
  ar: "العربية",
  uk: "Українська",
  tr: "Türkçe",
  ro: "Română",
};

export function estRtl(langue: LangueAppui): boolean {
  return langue === "ar";
}

/** Escolhe a língua da interface a partir das línguas do aparelho, por ordem de preferência. */
export function langueDepuisAppareil(codes: readonly (string | null | undefined)[]): LangueAppui {
  for (const code of codes) {
    const base = code?.toLowerCase().split(/[-_]/)[0];
    if (base === "pt") return "pt-PT";
    if (base === "en" || base === "es" || base === "ar" || base === "uk" || base === "tr") {
      return base;
    }
    if (base === "ro" || base === "mo") return "ro";
  }
  return "en";
}

/** Locale para o Intl. Em árabe, algarismos latinos, como nos números do resto da app. */
export function localeIntl(langue: LangueAppui): string {
  return langue === "ar" ? "ar-u-nu-latn" : langue;
}
