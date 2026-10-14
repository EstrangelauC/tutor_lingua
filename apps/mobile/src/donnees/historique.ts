import {
  FeedbackSchema,
  LangueAppuiSchema,
  NiveauSchema,
  TacheSchema,
  type NiveauEstime,
  type Tache,
} from "@camille/shared";
import { z } from "zod";

/** Uma sessão terminada, guardada no aparelho com o feedback. */
export const EntreeHistoriqueSchema = z.object({
  /** O id da sessão na API: pedir o feedback outra vez não cria uma entrada nova. */
  id: z.string().min(1),
  date: z.iso.datetime(),
  tache: TacheSchema,
  /** Nível alvo na altura da sessão. */
  niveau: NiveauSchema,
  langueAppui: LangueAppuiSchema,
  echanges: z.number().int().min(0),
  dureeMs: z.number().min(0),
  feedback: FeedbackSchema,
});
export type EntreeHistorique = z.infer<typeof EntreeHistoriqueSchema>;

export const TAILLE_MAX_HISTORIQUE = 100;
/** Sessões mostradas no gráfico de evolução. */
export const SESSIONS_GRAPHIQUE = 10;

const parDateDecroissante = (a: EntreeHistorique, b: EntreeHistorique) =>
  b.date.localeCompare(a.date);

/** Lê o histórico guardado, ignorando entradas inválidas; a mais recente primeiro. */
export function lireHistorique(brut: unknown): EntreeHistorique[] {
  if (!Array.isArray(brut)) return [];
  return brut
    .flatMap((entree) => {
      const resultat = EntreeHistoriqueSchema.safeParse(entree);
      return resultat.success ? [resultat.data] : [];
    })
    .sort(parDateDecroissante)
    .slice(0, TAILLE_MAX_HISTORIQUE);
}

/** Junta (ou substitui) uma sessão; guarda só as mais recentes. */
export function ajouterEntree(
  historique: readonly EntreeHistorique[],
  entree: EntreeHistorique,
): EntreeHistorique[] {
  return [entree, ...historique.filter((e) => e.id !== entree.id)]
    .sort(parDateDecroissante)
    .slice(0, TAILLE_MAX_HISTORIQUE);
}

/** Duração arredondada ao minuto, nunca menos de 1. */
export function enMinutes(dureeMs: number): number {
  return Math.max(1, Math.round(dureeMs / 60_000));
}

export interface Statistiques {
  sessions: number;
  minutes: number;
  /** Níveis estimados das últimas sessões, da mais antiga para a mais recente. */
  evolution: NiveauEstime[];
}

export function statistiques(historique: readonly EntreeHistorique[]): Statistiques {
  return {
    sessions: historique.length,
    minutes: historique.reduce((total, e) => total + enMinutes(e.dureeMs), 0),
    evolution: historique
      .slice(0, SESSIONS_GRAPHIQUE)
      .map((e) => e.feedback.niveauEstime)
      .reverse(),
  };
}

/** A sessão mais recente de cada tarefa. */
export function derniereParTache(
  historique: readonly EntreeHistorique[],
): Partial<Record<Tache, EntreeHistorique>> {
  const resultat: Partial<Record<Tache, EntreeHistorique>> = {};
  for (const entree of historique) {
    resultat[entree.tache] ??= entree;
  }
  return resultat;
}

/** Dias de calendário (hora local) entre a data da sessão e agora: 0 = hoje, 1 = ontem. */
export function joursDepuis(date: string, maintenant: Date): number {
  const jour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.max(0, Math.round((jour(maintenant) - jour(new Date(date))) / 86_400_000));
}
