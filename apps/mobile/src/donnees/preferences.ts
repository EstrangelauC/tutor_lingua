import { LangueAppuiSchema, NiveauSchema, type LangueAppui } from "@camille/shared";
import { z } from "zod";

export const ThemeSchema = z.enum(["systeme", "clair", "sombre"]);
export type PreferenceTheme = z.infer<typeof ThemeSchema>;

export const VitesseVoixSchema = z.enum(["lente", "normale", "naturelle"]);
export type VitesseVoix = z.infer<typeof VitesseVoixSchema>;

export const ModeMicroSchema = z.enum(["maintenir", "mainsLibres"]);
export type ModeMicro = z.infer<typeof ModeMicroSchema>;

export const PreferencesSchema = z.object({
  langueInterface: LangueAppuiSchema,
  /** Língua do feedback e das explicações da Camille. */
  langueAppui: LangueAppuiSchema,
  niveau: NiveauSchema,
  theme: ThemeSchema,
  vitesseVoix: VitesseVoixSchema,
  /** Modo com que o microfone abre em cada sessão. */
  modeMicro: ModeMicroSchema,
});
export type Preferences = z.infer<typeof PreferencesSchema>;

/** Velocidade de leitura do expo-speech (1 = normal do sistema). */
export const DEBITS: Record<VitesseVoix, number> = {
  lente: 0.75,
  normale: 0.95,
  naturelle: 1.1,
};

export function preferencesParDefaut(langue: LangueAppui): Preferences {
  return {
    langueInterface: langue,
    langueAppui: langue,
    niveau: "B1",
    theme: "systeme",
    vitesseVoix: "normale",
    modeMicro: "maintenir",
  };
}

/**
 * Lê as preferências guardadas campo a campo: um campo inválido ou de uma versão antiga
 * volta ao valor por omissão sem apagar os outros.
 */
export function lirePreferences(brut: unknown, defaut: Preferences): Preferences {
  const objet: Record<string, unknown> =
    typeof brut === "object" && brut !== null ? { ...brut } : {};
  const champs = Object.fromEntries(
    Object.entries(PreferencesSchema.shape).map(([cle, schema]) => {
      const resultat = schema.safeParse(objet[cle]);
      return [cle, resultat.success ? resultat.data : defaut[cle as keyof Preferences]];
    }),
  );
  return PreferencesSchema.parse(champs);
}

/**
 * Aplica uma alteração. Quem muda a língua da interface e tinha o feedback na mesma língua
 * quer, quase sempre, o feedback na nova também.
 */
export function modifierPreferences(
  actuelles: Preferences,
  changement: Partial<Preferences>,
): Preferences {
  const suivantes = { ...actuelles, ...changement };
  if (
    changement.langueInterface !== undefined &&
    changement.langueAppui === undefined &&
    actuelles.langueAppui === actuelles.langueInterface
  ) {
    suivantes.langueAppui = changement.langueInterface;
  }
  return suivantes;
}
