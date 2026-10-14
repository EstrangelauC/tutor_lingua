import { getLocales } from "expo-localization";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { langueDepuisAppareil } from "../i18n/langues";
import { ajouterEntree, lireHistorique, type EntreeHistorique } from "./historique";
import {
  lirePreferences,
  modifierPreferences,
  preferencesParDefaut,
  type Preferences,
} from "./preferences";
import { ecrire, lire } from "./stockage";

interface Donnees {
  preferences: Preferences;
  /** A sessão mais recente primeiro. */
  historique: EntreeHistorique[];
}

interface ValeurDonnees extends Donnees {
  modifierPreferences: (changement: Partial<Preferences>) => void;
  ajouterSession: (entree: EntreeHistorique) => void;
  effacerHistorique: () => void;
}

const ContexteDonnees = createContext<ValeurDonnees | null>(null);

async function charger(): Promise<Donnees> {
  const [preferences, historique] = await Promise.all([lire("preferences"), lire("historique")]);
  const langue = langueDepuisAppareil(getLocales().map((locale) => locale.languageTag));
  return {
    preferences: lirePreferences(preferences, preferencesParDefaut(langue)),
    historique: lireHistorique(historique),
  };
}

/**
 * Preferências e histórico, guardados no aparelho. Não mostra nada até os ter lido
 * (o ecrã de arranque fica visível entretanto).
 */
export function DonneesProvider({ children }: { children: ReactNode }) {
  const [donnees, setDonnees] = useState<Donnees | null>(null);

  useEffect(() => {
    let actif = true;
    void charger().then((lues) => {
      if (actif) setDonnees(lues);
    });
    return () => {
      actif = false;
    };
  }, []);

  const preferences = donnees?.preferences;
  const historique = donnees?.historique;
  useEffect(() => {
    if (preferences) void ecrire("preferences", preferences);
  }, [preferences]);
  useEffect(() => {
    if (historique) void ecrire("historique", historique);
  }, [historique]);

  if (!donnees) {
    return null;
  }

  const valeur: ValeurDonnees = {
    ...donnees,
    modifierPreferences: (changement) =>
      setDonnees((d) => d && { ...d, preferences: modifierPreferences(d.preferences, changement) }),
    ajouterSession: (entree) =>
      setDonnees((d) => d && { ...d, historique: ajouterEntree(d.historique, entree) }),
    effacerHistorique: () => setDonnees((d) => d && { ...d, historique: [] }),
  };
  return <ContexteDonnees value={valeur}>{children}</ContexteDonnees>;
}

export function useDonnees(): ValeurDonnees {
  const valeur = use(ContexteDonnees);
  if (!valeur) {
    throw new Error("useDonnees tem de ser usado dentro de <DonneesProvider>.");
  }
  return valeur;
}
